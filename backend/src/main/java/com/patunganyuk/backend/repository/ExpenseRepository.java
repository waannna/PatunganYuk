package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.patunganyuk.backend.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByGroupId(Long groupId);

    List<Expense> findByGroupId(Long groupId, Sort sort);

    List<Expense> findByTitleContainingIgnoreCase(String title);
}