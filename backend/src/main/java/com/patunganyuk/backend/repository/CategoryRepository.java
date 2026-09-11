package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.patunganyuk.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByNameContainingIgnoreCase(String name);

    List<Category> findByNameContainingIgnoreCase(String name, Sort sort);

    boolean existsByNameIgnoreCase(String name);
}