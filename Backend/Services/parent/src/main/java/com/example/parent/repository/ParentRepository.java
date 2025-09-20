package com.example.parent.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.parent.entity.Parent;

public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByEmail(String email);
} 