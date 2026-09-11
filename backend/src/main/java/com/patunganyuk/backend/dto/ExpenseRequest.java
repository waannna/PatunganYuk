package com.patunganyuk.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class ExpenseRequest {

    private String title;
    private Double amount;
    private String paidBy;
    private String category;
    private LocalDate expenseDate;
    private String notes;
    private Long groupId;
    private List<MemberShare> shares;

    public static class MemberShare {
        private String memberName;
        private Double shareAmount;

        public MemberShare() {}

        public MemberShare(String memberName, Double shareAmount) {
            this.memberName = memberName;
            this.shareAmount = shareAmount;
        }

        public String getMemberName() { return this.memberName; }
        public void setMemberName(String memberName) { this.memberName = memberName; }
        public Double getShareAmount() { return this.shareAmount; }
        public void setShareAmount(Double shareAmount) { this.shareAmount = shareAmount; }
    }

    public ExpenseRequest() {}

    public String getTitle() { return this.title; }
    public void setTitle(String title) { this.title = title; }
    public Double getAmount() { return this.amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getPaidBy() { return this.paidBy; }
    public void setPaidBy(String paidBy) { this.paidBy = paidBy; }
    public String getCategory() { return this.category; }
    public void setCategory(String category) { this.category = category; }
    public LocalDate getExpenseDate() { return this.expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }
    public String getNotes() { return this.notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getGroupId() { return this.groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public List<MemberShare> getShares() { return this.shares; }
    public void setShares(List<MemberShare> shares) { this.shares = shares; }
}