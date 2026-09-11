package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patunganyuk.backend.entity.ExpenseDetail;

public interface ExpenseDetailRepository extends JpaRepository<ExpenseDetail, Long> {
    List<ExpenseDetail> findByExpenseId(Long expenseId);
    void deleteByExpenseId(Long expenseId);
}