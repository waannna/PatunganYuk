package com.patunganyuk.backend.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.patunganyuk.backend.entity.Group;

public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByNameContainingIgnoreCase(String name);
    List<Group> findByNameContainingIgnoreCase(String name, Sort sort);

    @Query("SELECT g FROM Group g WHERE g.id IN (" +
           "SELECT DISTINCT gm.groupId FROM GroupMember gm WHERE " +
           "(:userName IS NOT NULL AND :userName <> '' AND LOWER(TRIM(gm.memberName)) = LOWER(TRIM(:userName))) OR " +
           "(:userEmail IS NOT NULL AND :userEmail <> '' AND LOWER(TRIM(gm.email)) = LOWER(TRIM(:userEmail))))")
    List<Group> findUserGroups(@Param("userName") String userName, @Param("userEmail") String userEmail);
}