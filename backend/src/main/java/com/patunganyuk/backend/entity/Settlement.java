package com.patunganyuk.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "settlements")
public class Settlement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_member", nullable = false)
    private String fromMember;

    @Column(name = "to_member", nullable = false)
    private String toMember;

    @Column(name = "amount", nullable = false)
    private Double amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    public Settlement() {
    }

    public Settlement(Long id, String fromMember, String toMember, Double amount, LocalDate paymentDate, Long groupId) {
        this.id = id;
        this.fromMember = fromMember;
        this.toMember = toMember;
        this.amount = amount;
        this.paymentDate = paymentDate;
        this.groupId = groupId;
    }

    @Override
    public String getSummary() {
        return "Pelunasan: " + this.fromMember + " membayar Rp" + this.amount + " kepada " + this.toMember;
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFromMember() {
        return this.fromMember;
    }

    public void setFromMember(String fromMember) {
        this.fromMember = fromMember;
    }

    public String getToMember() {
        return this.toMember;
    }

    public void setToMember(String toMember) {
        this.toMember = toMember;
    }

    public Double getAmount() {
        return this.amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getPaymentDate() {
        return this.paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Long getGroupId() {
        return this.groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }
}