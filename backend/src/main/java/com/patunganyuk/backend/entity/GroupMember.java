package com.patunganyuk.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "group_members")
public class GroupMember extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_name", nullable = false)
    private String memberName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "email")
    private String email;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    public GroupMember() {}

    public GroupMember(Long id, String memberName, String phoneNumber, String email, Long userId, Long groupId) {
        this.id = id;
        this.memberName = memberName;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.userId = userId;
        this.groupId = groupId;
    }

    @Override
    public String getSummary() {
        return "Member: " + this.memberName + (this.email != null ? " (" + this.email + ")" : "");
    }

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public String getMemberName() { return this.memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getPhoneNumber() { return this.phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }
    public Long getUserId() { return this.userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getGroupId() { return this.groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
}