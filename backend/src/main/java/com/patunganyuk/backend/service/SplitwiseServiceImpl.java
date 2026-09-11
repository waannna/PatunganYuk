package com.patunganyuk.backend.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.patunganyuk.backend.dto.ExpenseRequest;
import com.patunganyuk.backend.entity.Activity;
import com.patunganyuk.backend.entity.Expense;
import com.patunganyuk.backend.entity.ExpenseDetail;
import com.patunganyuk.backend.entity.Group;
import com.patunganyuk.backend.entity.GroupMember;
import com.patunganyuk.backend.entity.Settlement;
import com.patunganyuk.backend.exception.ResourceNotFoundException;
import com.patunganyuk.backend.repository.ActivityRepository;
import com.patunganyuk.backend.repository.ExpenseDetailRepository;
import com.patunganyuk.backend.repository.ExpenseRepository;
import com.patunganyuk.backend.repository.GroupMemberRepository;
import com.patunganyuk.backend.repository.GroupRepository;
import com.patunganyuk.backend.repository.SettlementRepository;
import com.patunganyuk.backend.repository.UserRepository;

@Service
public class SplitwiseServiceImpl implements SplitwiseService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final ActivityRepository activityRepository;
    private final ExpenseDetailRepository detailRepository;
    private final UserRepository userRepository;

    public SplitwiseServiceImpl(GroupRepository groupRepository,
                                GroupMemberRepository memberRepository,
                                ExpenseRepository expenseRepository,
                                SettlementRepository settlementRepository,
                                ActivityRepository activityRepository,
                                ExpenseDetailRepository detailRepository,
                                UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.memberRepository = memberRepository;
        this.expenseRepository = expenseRepository;
        this.settlementRepository = settlementRepository;
        this.activityRepository = activityRepository;
        this.detailRepository = detailRepository;
        this.userRepository = userRepository;
    }

    // Helper untuk membuat Sort
    private Sort getSort(String sortBy, String direction) {
        String field = (sortBy != null && !sortBy.trim().isEmpty()) ? sortBy.trim() : "id";
        Sort.Direction dir = (direction != null && direction.trim().equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        return Sort.by(dir, field);
    }

    @Override
    public List<Expense> getAllExpenses() {
        return this.expenseRepository.findAll();
    }

    @Override
    public List<Expense> getAllExpenses(String sortBy, String direction) {
        return this.expenseRepository.findAll(getSort(sortBy, direction));
    }

    @Override
    public List<Expense> getNonGroupExpenses() {
        return this.expenseRepository.findAll().stream()
                .filter(e -> e.getGroupId() == null)
                .toList();
    }

    @Override
    public List<Group> getAllGroups() {
        return this.groupRepository.findAll();
    }

    @Override
    public List<Group> getAllGroups(String search) {
        if (search != null && !search.trim().isEmpty()) {
            return this.groupRepository.findByNameContainingIgnoreCase(search.trim());
        }
        return this.groupRepository.findAll();
    }

    @Override
    public List<Group> getAllGroups(String search, String sortBy, String direction) {
        return getAllGroups(search, sortBy, direction, null, null);
    }

    @Override
    public List<Group> getAllGroups(String search, String sortBy, String direction, String userName, String userEmail) {
        String cleanName = (userName != null) ? userName.trim() : "";
        String cleanEmail = (userEmail != null) ? userEmail.trim() : "";

        if (!cleanName.isEmpty() || !cleanEmail.isEmpty()) {
            return this.groupRepository.findUserGroups(cleanName, cleanEmail);
        }
        
        if (search != null && !search.trim().isEmpty()) {
            return this.groupRepository.findByNameContainingIgnoreCase(search.trim(), getSort(sortBy, direction));
        }
        return this.groupRepository.findAll(getSort(sortBy, direction));
    }

    @Override
    public Group createGroup(Group group) {
        if (group.getName() == null || group.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama grup tidak boleh kosong");
        }
        return this.groupRepository.save(group);
    }

    @Override
    public Group getGroupById(Long id) {
        return this.groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grup tidak ditemukan: " + id));
    }

    @Override
    public Group updateGroup(Long id, Group group) {
        Group existing = this.getGroupById(id);
        if (group.getName() == null || group.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama grup tidak boleh kosong");
        }
        existing.setName(group.getName());
        existing.setDescription(group.getDescription());
        existing.setCategory(group.getCategory());
        return this.groupRepository.save(existing);
    }

    @Override
    public void deleteGroup(Long id) {
        if (!this.groupRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grup tidak ditemukan: " + id);
        }
        this.groupRepository.deleteById(id);
    }

    @Override
    public List<GroupMember> getMembersByGroupId(Long groupId) {
        return this.memberRepository.findByGroupId(groupId);
    }

    @Override
    public List<GroupMember> getMembersByGroupId(Long groupId, String sortBy, String direction) {
        return this.memberRepository.findByGroupId(groupId, getSort(sortBy, direction));
    }

    @Override
    public GroupMember addMember(GroupMember member) {
        if (member.getMemberName() == null || member.getMemberName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama anggota tidak boleh kosong");
        }

        if (member.getEmail() != null && !member.getEmail().trim().isEmpty()) {
            String cleanEmail = member.getEmail().trim().toLowerCase();
            member.setEmail(cleanEmail);

            this.userRepository.findByEmail(cleanEmail).ifPresent(user -> {
                member.setUserId(user.getId());
            });
        } else {
            member.setUserId(null);
            member.setEmail(null);
        }

        GroupMember saved = this.memberRepository.save(member);

        String groupName = "Grup";
        if (member.getGroupId() != null) {
            groupName = this.groupRepository.findById(member.getGroupId())
                    .map(Group::getName).orElse("Grup");
        }

        String desc = saved.getUserId() != null 
                ? saved.getMemberName() + " (Akun Terdaftar) bergabung ke " + groupName
                : saved.getMemberName() + " (Non-Akun) ditambahkan ke " + groupName;

        Activity act = new Activity(
                member.getMemberName(),
                "FRIEND_ADDED",
                "Anggota Baru Bergabung",
                desc,
                null,
                member.getGroupId()
        );
        this.activityRepository.save(act);

        return saved;
    }

    @Override
    public GroupMember updateMember(Long id, GroupMember member) {
        GroupMember existing = this.memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Anggota tidak ditemukan: " + id));
        if (member.getMemberName() == null || member.getMemberName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nama anggota tidak boleh kosong");
        }
        existing.setMemberName(member.getMemberName());
        existing.setPhoneNumber(member.getPhoneNumber());

        if (member.getEmail() != null && !member.getEmail().trim().isEmpty()) {
            String cleanEmail = member.getEmail().trim().toLowerCase();
            existing.setEmail(cleanEmail);
            this.userRepository.findByEmail(cleanEmail).ifPresentOrElse(
                    user -> existing.setUserId(user.getId()),
                    () -> existing.setUserId(null)
            );
        } else {
            existing.setEmail(null);
            existing.setUserId(null);
        }

        return this.memberRepository.save(existing);
    }

    @Override
    public void deleteMember(Long id) {
        if (!this.memberRepository.existsById(id)) {
            throw new ResourceNotFoundException("Anggota tidak ditemukan: " + id);
        }
        this.memberRepository.deleteById(id);
    }

    @Override
    public List<Expense> getExpensesByGroupId(Long groupId) {
        return this.expenseRepository.findByGroupId(groupId);
    }

    // PERBAIKAN UTAMA: Sorting sekarang diproses di backend
    @Override
    public List<Expense> getExpensesByGroupId(Long groupId, String sortBy, String direction) {
        return this.expenseRepository.findByGroupId(groupId, getSort(sortBy, direction));
    }

    @Override
    public Expense createExpense(Expense expense) {
        validateExpense(expense);
        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDate.now());
        }
        Expense saved = this.expenseRepository.save(expense);

        String targetName = "Non-Group Expense";
        if (expense.getGroupId() != null) {
            targetName = this.groupRepository.findById(expense.getGroupId())
                    .map(Group::getName).orElse("Grup");
        }
        Activity act = new Activity(
                expense.getPaidBy(),
                "EXPENSE_SPLIT",
                "Pengeluaran Ditambahkan",
                expense.getPaidBy() + " mencatat \"" + expense.getTitle() + "\" di " + targetName,
                expense.getAmount(),
                expense.getGroupId()
        );
        this.activityRepository.save(act);

        return saved;
    }

    @Override
    public Expense createExpenseWithDetails(ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setAmount(request.getAmount());
        expense.setPaidBy(request.getPaidBy());
        expense.setCategory(request.getCategory());
        expense.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now());
        expense.setNotes(request.getNotes());
        expense.setGroupId(request.getGroupId());

        Expense saved = createExpense(expense);

        if (request.getShares() != null && !request.getShares().isEmpty()) {
            for (ExpenseRequest.MemberShare share : request.getShares()) {
                if (share.getShareAmount() != null && share.getShareAmount() > 0) {
                    ExpenseDetail detail = new ExpenseDetail();
                    detail.setExpenseId(saved.getId());
                    detail.setMemberName(share.getMemberName());
                    detail.setShareAmount(share.getShareAmount());
                    this.detailRepository.save(detail);
                }
            }
        }

        return saved;
    }

    @Override
    public Expense updateExpense(Long id, Expense expense) {
        Expense existing = this.expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pengeluaran tidak ditemukan: " + id));
        validateExpense(expense);
        existing.setTitle(expense.getTitle());
        existing.setAmount(expense.getAmount());
        existing.setPaidBy(expense.getPaidBy());
        existing.setCategory(expense.getCategory());
        existing.setExpenseDate(expense.getExpenseDate());
        existing.setNotes(expense.getNotes());
        return this.expenseRepository.save(existing);
    }

    @Override
    public Expense updateExpenseWithDetails(Long id, ExpenseRequest request) {
        Expense existing = this.expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pengeluaran tidak ditemukan: " + id));

        existing.setTitle(request.getTitle());
        existing.setAmount(request.getAmount());
        existing.setPaidBy(request.getPaidBy());
        existing.setCategory(request.getCategory());
        existing.setExpenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : existing.getExpenseDate());
        existing.setNotes(request.getNotes());

        validateExpense(existing);
        Expense updated = this.expenseRepository.save(existing);

        this.detailRepository.deleteByExpenseId(id);
        if (request.getShares() != null && !request.getShares().isEmpty()) {
            for (ExpenseRequest.MemberShare share : request.getShares()) {
                if (share.getShareAmount() != null && share.getShareAmount() > 0) {
                    ExpenseDetail detail = new ExpenseDetail();
                    detail.setExpenseId(updated.getId());
                    detail.setMemberName(share.getMemberName());
                    detail.setShareAmount(share.getShareAmount());
                    this.detailRepository.save(detail);
                }
            }
        }

        return updated;
    }

    @Override
    public void deleteExpense(Long id) {
        if (!this.expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pengeluaran tidak ditemukan: " + id);
        }
        this.detailRepository.deleteByExpenseId(id);
        this.expenseRepository.deleteById(id);
    }

    private void validateExpense(Expense expense) {
        if (expense.getTitle() == null || expense.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Judul pengeluaran tidak boleh kosong");
        }
        if (expense.getAmount() == null || expense.getAmount() <= 0) {
            throw new IllegalArgumentException("Nominal harus lebih dari 0");
        }
    }

    @Override
    public List<Settlement> getSettlementsByGroupId(Long groupId) {
        return this.settlementRepository.findByGroupId(groupId);
    }

    // PERBAIKAN UTAMA: Sorting settlement diproses di backend
    @Override
    public List<Settlement> getSettlementsByGroupId(Long groupId, String sortBy, String direction) {
        return this.settlementRepository.findByGroupId(groupId, getSort(sortBy, direction));
    }

    @Override
    public Settlement recordSettlement(Settlement settlement) {
        if (settlement.getAmount() == null || settlement.getAmount() <= 0) {
            throw new IllegalArgumentException("Nominal pelunasan harus lebih dari 0");
        }
        if (settlement.getPaymentDate() == null) {
            settlement.setPaymentDate(LocalDate.now());
        }
        Settlement saved = this.settlementRepository.save(settlement);

        Activity act = new Activity(
                settlement.getFromMember(),
                "SETTLEMENT",
                "Pelunasan Hutang",
                settlement.getFromMember() + " melunasi hutang kepada " + settlement.getToMember(),
                settlement.getAmount(),
                settlement.getGroupId()
        );
        this.activityRepository.save(act);

        return saved;
    }

    @Override
    public void deleteSettlement(Long id) {
        if (!this.settlementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pelunasan tidak ditemukan: " + id);
        }
        this.settlementRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> calculateBalances(Long groupId) {
        List<GroupMember> members = this.memberRepository.findByGroupId(groupId);
        List<Expense> expenses = this.expenseRepository.findByGroupId(groupId);
        List<Settlement> settlements = this.settlementRepository.findByGroupId(groupId);

        Map<String, Double> balanceMap = new HashMap<>();
        Map<String, Double> categoryTotals = new HashMap<>();
        for (GroupMember m : members) {
            balanceMap.put(m.getMemberName().trim(), 0.0);
        }

        double totalExpense = 0.0;
        int memberCount = members.size();

        for (Expense exp : expenses) {
            totalExpense += exp.getAmount();
            categoryTotals.put(exp.getCategory(),
                    categoryTotals.getOrDefault(exp.getCategory(), 0.0) + exp.getAmount());

            String payer = exp.getPaidBy() != null ? exp.getPaidBy().trim() : "";
            balanceMap.put(payer, balanceMap.getOrDefault(payer, 0.0) + exp.getAmount());

            List<ExpenseDetail> details = this.detailRepository.findByExpenseId(exp.getId());
            if (details != null && !details.isEmpty()) {
                for (ExpenseDetail d : details) {
                    String dMember = d.getMemberName() != null ? d.getMemberName().trim() : "";
                    balanceMap.put(dMember, balanceMap.getOrDefault(dMember, 0.0) - d.getShareAmount());
                }
            } else if (memberCount > 0) {
                double splitPerPerson = exp.getAmount() / memberCount;
                for (GroupMember m : members) {
                    String mName = m.getMemberName().trim();
                    balanceMap.put(mName, balanceMap.getOrDefault(mName, 0.0) - splitPerPerson);
                }
            }
        }

        for (Settlement s : settlements) {
            String from = s.getFromMember() != null ? s.getFromMember().trim() : "";
            String to = s.getToMember() != null ? s.getToMember().trim() : "";
            balanceMap.put(from, balanceMap.getOrDefault(from, 0.0) + s.getAmount());
            balanceMap.put(to, balanceMap.getOrDefault(to, 0.0) - s.getAmount());
        }

        List<Map<String, Object>> debtTransfers = new ArrayList<>();
        Map<String, Double> debtors = new HashMap<>();
        Map<String, Double> creditors = new HashMap<>();

        for (Map.Entry<String, Double> entry : balanceMap.entrySet()) {
            if (entry.getValue() < -0.01) {
                debtors.put(entry.getKey(), -entry.getValue());
            } else if (entry.getValue() > 0.01) {
                creditors.put(entry.getKey(), entry.getValue());
            }
        }

        for (String debtor : new ArrayList<>(debtors.keySet())) {
            double debtAmount = debtors.get(debtor);
            for (String creditor : new ArrayList<>(creditors.keySet())) {
                double creditAmount = creditors.get(creditor);
                if (debtAmount <= 0.01 || creditAmount <= 0.01) continue;

                double settled = Math.min(debtAmount, creditAmount);
                debtAmount -= settled;
                creditAmount -= settled;

                debtors.put(debtor, debtAmount);
                creditors.put(creditor, creditAmount);

                Map<String, Object> transfer = new HashMap<>();
                transfer.put("from", debtor);
                transfer.put("to", creditor);
                transfer.put("amount", Math.round(settled * 100.0) / 100.0);
                debtTransfers.add(transfer);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("groupId", groupId);
        result.put("totalExpense", totalExpense);
        result.put("memberCount", memberCount);
        result.put("balances", balanceMap);
        result.put("categoryBreakdown", categoryTotals);
        result.put("debtTransfers", debtTransfers);

        return result;
    }

    @Override
    public Map<String, Object> getUserFinancialSummary(String memberName) {
        return getUserFinancialSummary(memberName, null);
    }

    @Override
    public Map<String, Object> getUserFinancialSummary(String memberName, String memberEmail) {
        List<Group> allGroups = this.groupRepository.findAll();
        double totalYoullGet = 0.0;
        double totalYoullPay = 0.0;
        double personalExpenses = 0.0;

        String targetName = memberName != null ? memberName.trim().toLowerCase() : "";
        String targetEmail = memberEmail != null ? memberEmail.trim().toLowerCase() : "";

        for (Group g : allGroups) {
            List<GroupMember> members = this.memberRepository.findByGroupId(g.getId());
            Set<String> userAliases = new HashSet<>();

            for (GroupMember m : members) {
                String mName = m.getMemberName() != null ? m.getMemberName().trim() : "";
                String mEmail = m.getEmail() != null ? m.getEmail().trim().toLowerCase() : "";

                boolean match = false;
                if (!targetEmail.isEmpty() && targetEmail.equals(mEmail)) {
                    match = true;
                } else if (!targetName.isEmpty() && targetName.equalsIgnoreCase(mName.toLowerCase())) {
                    match = true;
                } else if (!targetName.isEmpty() && (mName.toLowerCase().startsWith(targetName) || targetName.startsWith(mName.toLowerCase()))) {
                    match = true;
                }

                if (match) {
                    userAliases.add(mName.toLowerCase());
                }
            }

            if (userAliases.isEmpty()) {
                continue;
            }

            Map<String, Object> balanceData = calculateBalances(g.getId());

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> debtTransfers = (List<Map<String, Object>>) balanceData.get("debtTransfers");

            if (debtTransfers != null) {
                for (Map<String, Object> transfer : debtTransfers) {
                    String from = ((String) transfer.get("from")).trim().toLowerCase();
                    String to = ((String) transfer.get("to")).trim().toLowerCase();
                    Double amount = ((Number) transfer.get("amount")).doubleValue();

                    if (userAliases.contains(from)) {
                        totalYoullPay += amount;
                    } else if (userAliases.contains(to)) {
                        totalYoullGet += amount;
                    }
                }
            }

            List<Expense> groupExpenses = this.expenseRepository.findByGroupId(g.getId());
            for (Expense exp : groupExpenses) {
                List<ExpenseDetail> details = this.detailRepository.findByExpenseId(exp.getId());
                if (details != null && !details.isEmpty()) {
                    for (ExpenseDetail d : details) {
                        String dMember = d.getMemberName() != null ? d.getMemberName().trim().toLowerCase() : "";
                        if (userAliases.contains(dMember)) {
                            personalExpenses += d.getShareAmount();
                        }
                    }
                } else if (!members.isEmpty()) {
                    personalExpenses += (exp.getAmount() / members.size());
                }
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("memberName", memberName);
        summary.put("youllGet", Math.round(totalYoullGet * 100.0) / 100.0);
        summary.put("youllPay", Math.round(totalYoullPay * 100.0) / 100.0);
        summary.put("personalExpenses", Math.round(personalExpenses * 100.0) / 100.0);

        return summary;
    }

    @Override
    public List<Activity> getAllActivities() {
        return this.activityRepository.findAllByOrderByCreatedAtDesc();
    }
}