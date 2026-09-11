package com.patunganyuk.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "expense_details")
public class ExpenseDetail extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "expense_id", nullable = false)
    private Long expenseId;

    @Column(name = "member_name", nullable = false)
    private String memberName;

    @Column(name = "share_amount", nullable = false)
    private Double shareAmount;

    public ExpenseDetail() {}

    public ExpenseDetail(Long id, Long expenseId, String memberName, Double shareAmount) {
        this.id = id;
        this.expenseId = expenseId;
        this.memberName = memberName;
        this.shareAmount = shareAmount;
    }

    @Override
    public String getSummary() {
        return "Detail: " + this.memberName + " menanggung Rp" + this.shareAmount;
    }

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public Long getExpenseId() { return this.expenseId; }
    public void setExpenseId(Long expenseId) { this.expenseId = expenseId; }
    public String getMemberName() { return this.memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public Double getShareAmount() { return this.shareAmount; }
    public void setShareAmount(Double shareAmount) { this.shareAmount = shareAmount; }
}