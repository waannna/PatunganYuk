package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.patunganyuk.backend.entity.Settlement;

public interface SettlementRepository extends JpaRepository<Settlement, Long> {
    List<Settlement> findByGroupId(Long groupId);

    List<Settlement> findByGroupId(Long groupId, Sort sort);
}