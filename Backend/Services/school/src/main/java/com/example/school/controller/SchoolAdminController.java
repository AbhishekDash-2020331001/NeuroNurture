package com.example.school.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.school.dto.SchoolApprovalDto;
import com.example.school.entity.School;
import com.example.school.entity.SchoolApprovalRequest;
import com.example.school.repository.SchoolApprovalRequestRepository;
import com.example.school.repository.SchoolRepository;

@RestController
@RequestMapping("/api/school/admin")
public class SchoolAdminController {
    
    @Autowired
    private SchoolRepository schoolRepository;
    
    @Autowired
    private SchoolApprovalRequestRepository approvalRequestRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String ADMIN_SERVICE_URL = "http://localhost:8080";
    
    @GetMapping("/pending")
    public ResponseEntity<List<SchoolApprovalDto>> getPendingSchools() {
        List<SchoolApprovalRequest> requests = approvalRequestRepository.findByStatus("pending");
        List<SchoolApprovalDto> schoolDtos = requests.stream()
            .map(this::convertRequestToDto)
            .toList();
        return ResponseEntity.ok(schoolDtos);
    }
    
    @GetMapping("/pending/{adminId}")
    public ResponseEntity<List<SchoolApprovalDto>> getPendingSchoolsForAdmin(@PathVariable Long adminId) {
        List<SchoolApprovalRequest> requests = approvalRequestRepository.findByAssignedAdminIdAndStatus(adminId, "pending");
        List<SchoolApprovalDto> schoolDtos = requests.stream()
            .map(this::convertRequestToDto)
            .toList();
        return ResponseEntity.ok(schoolDtos);
    }
    
    @PostMapping("/approve/{schoolId}")
    public ResponseEntity<SchoolApprovalDto> approveSchool(@PathVariable Long schoolId) {
        Optional<SchoolApprovalRequest> requestOpt = approvalRequestRepository.findBySchoolId(schoolId);
        if (requestOpt.isPresent()) {
            SchoolApprovalRequest request = requestOpt.get();
            request.setStatus("approved");
            request.setReviewedAt(java.time.LocalDateTime.now());
            approvalRequestRepository.save(request);
            
            // Update school status
            Optional<School> schoolOpt = schoolRepository.findById(schoolId);
            if (schoolOpt.isPresent()) {
                School school = schoolOpt.get();
                school.setIsVerified(true);
                schoolRepository.save(school);
            }
            
            return ResponseEntity.ok(convertRequestToDto(request));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/reject/{schoolId}")
    public ResponseEntity<SchoolApprovalDto> rejectSchool(@PathVariable Long schoolId) {
        Optional<SchoolApprovalRequest> requestOpt = approvalRequestRepository.findBySchoolId(schoolId);
        if (requestOpt.isPresent()) {
            SchoolApprovalRequest request = requestOpt.get();
            request.setStatus("rejected");
            request.setReviewedAt(java.time.LocalDateTime.now());
            approvalRequestRepository.save(request);
            
            // School remains unverified
            return ResponseEntity.ok(convertRequestToDto(request));
        }
        return ResponseEntity.notFound().build();
    }
    
    // Test endpoint to manually verify a school and create approval request
    @PostMapping("/test-verify/{schoolId}")
    public ResponseEntity<String> testVerifySchool(@PathVariable Long schoolId) {
        try {
            Optional<School> schoolOpt = schoolRepository.findById(schoolId);
            if (schoolOpt.isPresent()) {
                School school = schoolOpt.get();
                school.setEmailVerified(true);
                school.setVerificationToken(null);
                school.setVerificationTokenExpiry(null);
                schoolRepository.save(school);
                
                // Create approval request
                SchoolApprovalRequest approvalRequest = new SchoolApprovalRequest();
                approvalRequest.setSchoolId(school.getId());
                approvalRequest.setAssignedAdminId(1L); // Use admin ID 1 for testing
                approvalRequest.setStatus("pending");
                approvalRequestRepository.save(approvalRequest);
                
                return ResponseEntity.ok("School verified and approval request created successfully!");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Get all schools for admin management
    @GetMapping("/all")
    public ResponseEntity<List<SchoolApprovalDto>> getAllSchools() {
        List<School> schools = schoolRepository.findAll();
        List<SchoolApprovalDto> schoolDtos = schools.stream()
            .map(this::convertSchoolToDto)
            .toList();
        return ResponseEntity.ok(schoolDtos);
    }
    
    // Get school by ID for admin management
    @GetMapping("/{schoolId}")
    public ResponseEntity<SchoolApprovalDto> getSchoolById(@PathVariable Long schoolId) {
        Optional<School> schoolOpt = schoolRepository.findById(schoolId);
        if (schoolOpt.isPresent()) {
            SchoolApprovalDto schoolDto = convertSchoolToDto(schoolOpt.get());
            return ResponseEntity.ok(schoolDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Update school status (active/suspended)
    @PutMapping("/{schoolId}/status")
    public ResponseEntity<SchoolApprovalDto> updateSchoolStatus(
            @PathVariable Long schoolId, 
            @RequestBody String status) {
        Optional<School> schoolOpt = schoolRepository.findById(schoolId);
        if (schoolOpt.isPresent()) {
            School school = schoolOpt.get();
            // Update the status field for active/suspended status
            if ("active".equals(status) || "suspended".equals(status)) {
                school.setStatus(status);
            }
            schoolRepository.save(school);
            
            SchoolApprovalDto schoolDto = convertSchoolToDto(school);
            return ResponseEntity.ok(schoolDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    private SchoolApprovalDto convertSchoolToDto(School school) {
        return new SchoolApprovalDto(
            school.getId(),
            school.getSchoolName(),
            school.getContactPerson(),
            school.getEmail(),
            school.getPhone(),
            school.getAddress(),
            school.getCity(),
            school.getState(),
            school.getZipCode(),
            school.getStudentCount(),
            school.getEmailVerified(),
            school.getIsVerified(),
            null, // No assigned admin for general school management
            school.getSubscriptionStatus(),
            school.getChildrenLimit(),
            school.getCurrentChildren(),
            school.getCreatedAt(),
            school.getEmailVerified() ? school.getUpdatedAt() : null
        );
    }
    
    private SchoolApprovalDto convertRequestToDto(SchoolApprovalRequest request) {
        Optional<School> schoolOpt = schoolRepository.findById(request.getSchoolId());
        if (schoolOpt.isPresent()) {
            School school = schoolOpt.get();
            return new SchoolApprovalDto(
                school.getId(),
                school.getSchoolName(),
                school.getContactPerson(),
                school.getEmail(),
                school.getPhone(),
                school.getAddress(),
                school.getCity(),
                school.getState(),
                school.getZipCode(),
                school.getStudentCount(),
                school.getEmailVerified(),
                school.getIsVerified(),
                request.getAssignedAdminId(),
                school.getSubscriptionStatus(),
                school.getChildrenLimit(),
                school.getCurrentChildren(),
                school.getCreatedAt(),
                school.getEmailVerified() ? school.getUpdatedAt() : null
            );
        }
        return null;
    }
}
