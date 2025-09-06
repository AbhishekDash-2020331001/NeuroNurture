package com.example.school.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.school.entity.School;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    Optional<School> findByUsername(String username);
    Optional<School> findByEmail(String email);
    Optional<School> findByVerificationToken(String verificationToken);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Admin approval queries
    List<School> findByEmailVerifiedTrueAndIsVerifiedFalse();
}

