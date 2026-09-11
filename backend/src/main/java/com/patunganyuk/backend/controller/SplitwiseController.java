package com.patunganyuk.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.patunganyuk.backend.dto.ExpenseRequest;
import com.patunganyuk.backend.entity.Activity;
import com.patunganyuk.backend.entity.Expense;
import com.patunganyuk.backend.entity.Group;
import com.patunganyuk.backend.entity.GroupMember;
import com.patunganyuk.backend.entity.Settlement;
import com.patunganyuk.backend.service.SplitwiseService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class SplitwiseController {

    private final SplitwiseService splitwiseService;

    // PERBAIKAN: Spring akan otomatis inject service yang sudah di-annotate @Service
    public SplitwiseController(SplitwiseService splitwiseService) {
        this.splitwiseService = splitwiseService;
    }

    // ==========================================
    // 1. GROUPS ENDPOINTS
    // ==========================================

    @GetMapping("/groups")
    public ResponseEntity<Map<String, Object>> getAllGroups(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) String userEmail) {
        List<Group> groups = this.splitwiseService.getAllGroups(search, sortBy, direction, userName, userEmail);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", groups);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/groups/{id}")
    public ResponseEntity<Map<String, Object>> getGroupById(@PathVariable Long id) {
        Group group = this.splitwiseService.getGroupById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", group);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/groups")
    public ResponseEntity<Map<String, Object>> createGroup(
            @RequestBody Group group,
            @RequestParam(required = false) String creatorName,
            @RequestParam(required = false) String creatorEmail) {
        Group created = this.splitwiseService.createGroup(group);

        if (creatorName != null && !creatorName.trim().isEmpty()) {
            GroupMember creatorMember = new GroupMember();
            creatorMember.setGroupId(created.getId());
            creatorMember.setMemberName(creatorName.trim());
            creatorMember.setEmail(creatorEmail != null && !creatorEmail.trim().isEmpty() ? creatorEmail.trim() : null);
            this.splitwiseService.addMember(creatorMember);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Grup berhasil dibuat");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/groups/{id}")
    public ResponseEntity<Map<String, Object>> updateGroup(@PathVariable Long id, @RequestBody Group group) {
        Group updated = this.splitwiseService.updateGroup(id, group);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Grup berhasil diperbarui");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/groups/{id}")
    public ResponseEntity<Map<String, Object>> deleteGroup(@PathVariable Long id) {
        this.splitwiseService.deleteGroup(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Grup berhasil dihapus");
        return ResponseEntity.ok(response);
    }

    // 2. MEMBERS ENDPOINTS

    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<Map<String, Object>> getMembersByGroupId(
            @PathVariable Long groupId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        List<GroupMember> members = this.splitwiseService.getMembersByGroupId(groupId, sortBy, direction);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", members);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/groups/{groupId}/members")
    public ResponseEntity<Map<String, Object>> addMember(
            @PathVariable Long groupId,
            @RequestBody GroupMember member) {
        member.setGroupId(groupId);
        GroupMember created = this.splitwiseService.addMember(member);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Anggota berhasil ditambahkan");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/groups/{groupId}/members/{memberId}")
    public ResponseEntity<Map<String, Object>> updateMember(
            @PathVariable Long groupId,
            @PathVariable Long memberId,
            @RequestBody GroupMember member) {
        member.setGroupId(groupId);
        GroupMember updated = this.splitwiseService.updateMember(memberId, member);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Data anggota berhasil diperbarui");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/groups/{groupId}/members/{memberId}")
    public ResponseEntity<Map<String, Object>> deleteMember(
            @PathVariable Long groupId,
            @PathVariable Long memberId) {
        this.splitwiseService.deleteMember(memberId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Anggota berhasil dihapus");
        return ResponseEntity.ok(response);
    }

    // 3. EXPENSES ENDPOINTS (MENGGUNAKAN DTO)

    @GetMapping("/expenses")
    public ResponseEntity<Map<String, Object>> getAllExpenses(
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        List<Expense> expenses = this.splitwiseService.getAllExpenses(sortBy, direction);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", expenses);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/expenses/non-group")
    public ResponseEntity<Map<String, Object>> getNonGroupExpenses() {
        List<Expense> list = this.splitwiseService.getNonGroupExpenses();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", list);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/groups/{groupId}/expenses")
    public ResponseEntity<Map<String, Object>> getExpensesByGroupId(
            @PathVariable Long groupId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        List<Expense> expenses = this.splitwiseService.getExpensesByGroupId(groupId, sortBy, direction);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", expenses);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/groups/{groupId}/expenses")
    public ResponseEntity<Map<String, Object>> createGroupExpense(
            @PathVariable Long groupId,
            @RequestBody ExpenseRequest request) {
        request.setGroupId(groupId);
        Expense created = this.splitwiseService.createExpenseWithDetails(request);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Pengeluaran berhasil dicatat");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/expenses/non-group")
    public ResponseEntity<Map<String, Object>> createNonGroupExpense(@RequestBody ExpenseRequest request) {
        request.setGroupId(null);
        Expense created = this.splitwiseService.createExpenseWithDetails(request);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Pengeluaran non-grup berhasil dicatat");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/groups/{groupId}/expenses/{expenseId}")
    public ResponseEntity<Map<String, Object>> updateExpense(
            @PathVariable Long groupId,
            @PathVariable Long expenseId,
            @RequestBody ExpenseRequest request) {
        request.setGroupId(groupId);
        Expense updated = this.splitwiseService.updateExpenseWithDetails(expenseId, request);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Pengeluaran berhasil diperbarui");
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/groups/{groupId}/expenses/{expenseId}")
    public ResponseEntity<Map<String, Object>> deleteExpense(
            @PathVariable Long groupId,
            @PathVariable Long expenseId) {
        this.splitwiseService.deleteExpense(expenseId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Pengeluaran berhasil dihapus");
        return ResponseEntity.ok(response);
    }

    // 4. SETTLEMENTS & BALANCES ENDPOINTS

    @GetMapping("/groups/{groupId}/settlements")
    public ResponseEntity<Map<String, Object>> getSettlementsByGroupId(
            @PathVariable Long groupId,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        List<Settlement> settlements = this.splitwiseService.getSettlementsByGroupId(groupId, sortBy, direction);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", settlements);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/groups/{groupId}/settle")
    public ResponseEntity<Map<String, Object>> settleDebt(
            @PathVariable Long groupId,
            @RequestBody Settlement settlement) {
        settlement.setGroupId(groupId);
        Settlement created = this.splitwiseService.recordSettlement(settlement);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Pelunasan berhasil dicatat");
        response.put("data", created);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/groups/{groupId}/settlements/{settlementId}")
    public ResponseEntity<Map<String, Object>> deleteSettlement(
            @PathVariable Long groupId,
            @PathVariable Long settlementId) {
        this.splitwiseService.deleteSettlement(settlementId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Catatan pelunasan berhasil dihapus");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/groups/{groupId}/balances")
    public ResponseEntity<Map<String, Object>> getGroupBalances(@PathVariable Long groupId) {
        Map<String, Object> balances = this.splitwiseService.calculateBalances(groupId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", balances);
        return ResponseEntity.ok(response);
    }

    // 5. USER SUMMARY & ACTIVITIES

    @GetMapping("/users/summary")
    public ResponseEntity<Map<String, Object>> getUserFinancialSummary(
            @RequestParam String name,
            @RequestParam(required = false) String email) {
        Map<String, Object> data = this.splitwiseService.getUserFinancialSummary(name, email);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activities")
    public ResponseEntity<Map<String, Object>> getActivities() {
        List<Activity> activities = this.splitwiseService.getAllActivities();
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("data", activities);
        return ResponseEntity.ok(response);
    }
}