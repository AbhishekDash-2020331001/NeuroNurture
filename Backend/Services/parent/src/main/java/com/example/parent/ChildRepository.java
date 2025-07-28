package com.example.parent;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByParentId(Long parentId);
} 