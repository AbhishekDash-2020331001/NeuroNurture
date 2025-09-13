package com.example.doctor.repository;

import com.example.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUsername(String username);
    Optional<Doctor> findByEmail(String email);
    Optional<Doctor> findByVerificationToken(String token);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByLicenseNumber(String licenseNumber);
}

