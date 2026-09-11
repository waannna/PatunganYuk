package com.patunganyuk.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "activities")
public class Activity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Activity() {}

    public Activity(String userName, String activityType, String title, String description, Double amount, Long groupId) {
        this.userName = userName;
        this.activityType = activityType;
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.groupId = groupId;
        this.createdAt = LocalDateTime.now();
    }

    @Override
    public String getSummary() {
        return "[" + this.activityType + "] " + this.description;
    }

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public String getUserName() { return this.userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getActivityType() { return this.activityType; }
    public void setActivityType(String activityType) { this.activityType = activityType; }
    public String getTitle() { return this.title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return this.description; }
    public void setDescription(String description) { this.description = description; }
    public Double getAmount() { return this.amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public Long getGroupId() { return this.groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public LocalDateTime getCreatedAt() { return this.createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}