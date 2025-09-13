package com.example.doctor.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.doctor.entity.DoctorApprovalRequest;

@Repository
public interface DoctorApprovalRequestRepository extends JpaRepository<DoctorApprovalRequest, Long> {
    Optional<DoctorApprovalRequest> findByDoctorId(Long doctorId);
    List<DoctorApprovalRequest> findByStatus(String status);
    List<DoctorApprovalRequest> findByAssignedAdminIdAndStatus(Long assignedAdminId, String status);
}
