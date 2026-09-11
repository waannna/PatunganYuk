package com.patunganyuk.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    // Disimpan dalam bentuk hash (SHA-256), bukan plain text. Lihat
    // UserServiceImpl.hashPassword(). Untuk produksi sungguhan sebaiknya
    // pakai BCrypt (butuh dependency spring-security-crypto), tapi ini
    // sudah jauh lebih aman dibanding menyimpan password apa adanya.
    @Column(name = "password", nullable = false)
    private String password;

    // Nilai yang valid: "ADMIN" atau "USER". Divalidasi di service.
    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "phone_number")
    private String phoneNumber;

    public User() {
    }

    public User(Long id, String name, String email, String password, String role, String phoneNumber) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phoneNumber = phoneNumber;
    }

    @Override
    public String getSummary() {
        return "Pengguna: " + this.name + " (" + this.role + ")";
    }

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return this.role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}