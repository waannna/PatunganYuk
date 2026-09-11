package com.patunganyuk.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "issue_reports")
public class IssueReport extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_email", nullable = false)
    private String reporterEmail;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    public IssueReport() {}

    public IssueReport(Long id, String reporterEmail, String subject, String description, String status, LocalDate reportDate) {
        this.id = id;
        this.reporterEmail = reporterEmail;
        this.subject = subject;
        this.description = description;
        this.status = status;
        this.reportDate = reportDate;
    }

    @Override
    public String getSummary() {
        return "Laporan dari " + this.reporterEmail + ": " + this.subject + " (" + this.status + ")";
    }

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public String getReporterEmail() { return this.reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }
    public String getSubject() { return this.subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getDescription() { return this.description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return this.status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getReportDate() { return this.reportDate; }
    public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }
}