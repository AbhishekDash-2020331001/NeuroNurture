package com.example.jwt_auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.jwt_auth.entity.User;
import com.example.jwt_auth.entity.UserRole;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String verificationToken);
    List<User> findByUserRole(UserRole userRole);
}
