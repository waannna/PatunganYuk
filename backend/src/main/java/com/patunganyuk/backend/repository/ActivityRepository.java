package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.patunganyuk.backend.entity.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findAllByOrderByCreatedAtDesc();
}