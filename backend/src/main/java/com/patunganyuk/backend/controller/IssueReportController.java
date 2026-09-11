package com.patunganyuk.backend.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.patunganyuk.backend.entity.IssueReport;
import com.patunganyuk.backend.exception.ResourceNotFoundException;
import com.patunganyuk.backend.repository.IssueReportRepository;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class IssueReportController {

    private final IssueReportRepository reportRepo;

    public IssueReportController(IssueReportRepository reportRepo) {
        this.reportRepo = reportRepo;
    }

    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getAllReports() {
        List<IssueReport> reports = this.reportRepo.findAllByOrderByReportDateDesc();
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("data", reports);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reports")
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody IssueReport report) {
        if (report.getSubject() == null || report.getSubject().trim().isEmpty()) {
            throw new IllegalArgumentException("Subjek laporan wajib diisi");
        }
        report.setStatus("OPEN");
        report.setReportDate(LocalDate.now());
        IssueReport saved = this.reportRepo.save(report);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Laporan masalah berhasil dikirim ke Admin");
        res.put("data", saved);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @RequestMapping(value = "/reports/{id}/toggle", method = RequestMethod.PUT)
    public ResponseEntity<Map<String, Object>> toggleStatus(@PathVariable Long id) {
        IssueReport report = this.reportRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laporan tidak ditemukan"));
        report.setStatus("OPEN".equals(report.getStatus()) ? "RESOLVED" : "OPEN");
        IssueReport updated = this.reportRepo.save(report);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Status laporan diperbarui");
        res.put("data", updated);
        return ResponseEntity.ok(res);
    }
}