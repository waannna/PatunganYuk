package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patunganyuk.backend.entity.IssueReport;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {
    List<IssueReport> findAllByOrderByReportDateDesc();
}