package com.patunganyuk.backend.service;

import java.util.List;
import java.util.Map;

import com.patunganyuk.backend.dto.ExpenseRequest;
import com.patunganyuk.backend.entity.Activity;
import com.patunganyuk.backend.entity.Expense;
import com.patunganyuk.backend.entity.Group;
import com.patunganyuk.backend.entity.GroupMember;
import com.patunganyuk.backend.entity.Settlement;

public interface SplitwiseService {

    // --- EXPENSES ---
    List<Expense> getAllExpenses();
    List<Expense> getAllExpenses(String sortBy, String direction);
    List<Expense> getExpensesByGroupId(Long groupId);
    List<Expense> getExpensesByGroupId(Long groupId, String sortBy, String direction);
    List<Expense> getNonGroupExpenses();
    Expense createExpense(Expense expense);
    Expense createExpenseWithDetails(ExpenseRequest request);
    Expense updateExpense(Long id, Expense expense);
    Expense updateExpenseWithDetails(Long id, ExpenseRequest request);
    void deleteExpense(Long id);

    // --- GROUPS ---
    List<Group> getAllGroups();
    List<Group> getAllGroups(String search);
    List<Group> getAllGroups(String search, String sortBy, String direction);
    List<Group> getAllGroups(String search, String sortBy, String direction, String userName, String userEmail);
    Group getGroupById(Long id);
    Group createGroup(Group group);
    Group updateGroup(Long id, Group group);
    void deleteGroup(Long id);

    // --- MEMBERS ---
    List<GroupMember> getMembersByGroupId(Long groupId);
    List<GroupMember> getMembersByGroupId(Long groupId, String sortBy, String direction);
    GroupMember addMember(GroupMember member);
    GroupMember updateMember(Long id, GroupMember member);
    void deleteMember(Long id);

    // --- SETTLEMENTS ---
    List<Settlement> getSettlementsByGroupId(Long groupId);
    List<Settlement> getSettlementsByGroupId(Long groupId, String sortBy, String direction);
    Settlement recordSettlement(Settlement settlement);
    void deleteSettlement(Long id);

    // --- BALANCES & SUMMARY ---
    Map<String, Object> calculateBalances(Long groupId);
    Map<String, Object> getUserFinancialSummary(String memberName);
    Map<String, Object> getUserFinancialSummary(String memberName, String memberEmail);

    // --- ACTIVITIES ---
    List<Activity> getAllActivities();
}