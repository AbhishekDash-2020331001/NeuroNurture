package com.example.school.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.school.entity.SchoolApprovalRequest;

@Repository
public interface SchoolApprovalRequestRepository extends JpaRepository<SchoolApprovalRequest, Long> {
    
    // Find pending requests for a specific admin
    List<SchoolApprovalRequest> findByAssignedAdminIdAndStatus(Long adminId, String status);
    
    // Find all pending requests
    List<SchoolApprovalRequest> findByStatus(String status);
    
    // Find request by school ID
    Optional<SchoolApprovalRequest> findBySchoolId(Long schoolId);
    
    // Find request by school ID and admin ID
    Optional<SchoolApprovalRequest> findBySchoolIdAndAssignedAdminId(Long schoolId, Long adminId);
}
