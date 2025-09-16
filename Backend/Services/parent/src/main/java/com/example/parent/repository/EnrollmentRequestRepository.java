package com.example.parent.repository;

import com.example.parent.entity.EnrollmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRequestRepository extends JpaRepository<EnrollmentRequest, Long> {
    
    // Find all requests for a specific child
    List<EnrollmentRequest> findByChildIdOrderByCreatedAtDesc(Long childId);
    
    // Find all requests from a specific school
    List<EnrollmentRequest> findBySchoolIdOrderByCreatedAtDesc(Long schoolId);
    
    // Find pending requests for a child
    List<EnrollmentRequest> findByChildIdAndStatusOrderByCreatedAtDesc(Long childId, EnrollmentRequest.RequestStatus status);
    
    // Find pending requests from a school
    List<EnrollmentRequest> findBySchoolIdAndStatusOrderByCreatedAtDesc(Long schoolId, EnrollmentRequest.RequestStatus status);
    
    // Find specific request by child and school
    Optional<EnrollmentRequest> findByChildIdAndSchoolIdAndStatus(Long childId, Long schoolId, EnrollmentRequest.RequestStatus status);
    
    // Check if there's already a pending request for this child-school combination
    boolean existsByChildIdAndSchoolIdAndStatus(Long childId, Long schoolId, EnrollmentRequest.RequestStatus status);
    
    // Count pending requests for a child
    long countByChildIdAndStatus(Long childId, EnrollmentRequest.RequestStatus status);
    
    // Count pending requests from a school
    long countBySchoolIdAndStatus(Long schoolId, EnrollmentRequest.RequestStatus status);
}
