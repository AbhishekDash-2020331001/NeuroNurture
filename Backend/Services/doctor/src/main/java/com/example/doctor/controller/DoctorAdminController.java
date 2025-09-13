package com.example.doctor.controller;

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

import com.example.doctor.dto.DoctorApprovalDto;
import com.example.doctor.entity.Doctor;
import com.example.doctor.entity.DoctorApprovalRequest;
import com.example.doctor.repository.DoctorApprovalRequestRepository;
import com.example.doctor.repository.DoctorRepository;

@RestController
@RequestMapping("/api/doctor/admin")
public class DoctorAdminController {
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private DoctorApprovalRequestRepository approvalRequestRepository;
    
    @GetMapping("/pending")
    public ResponseEntity<List<DoctorApprovalDto>> getPendingDoctors() {
        List<DoctorApprovalRequest> requests = approvalRequestRepository.findByStatus("pending");
        List<DoctorApprovalDto> doctorDtos = requests.stream()
            .map(this::convertRequestToDto)
            .filter(dto -> dto != null)
            .toList();
        return ResponseEntity.ok(doctorDtos);
    }
    
    @GetMapping("/pending/{adminId}")
    public ResponseEntity<List<DoctorApprovalDto>> getPendingDoctorsForAdmin(@PathVariable Long adminId) {
        List<DoctorApprovalRequest> requests = approvalRequestRepository.findByAssignedAdminIdAndStatus(adminId, "pending");
        List<DoctorApprovalDto> doctorDtos = requests.stream()
            .map(this::convertRequestToDto)
            .filter(dto -> dto != null)
            .toList();
        return ResponseEntity.ok(doctorDtos);
    }
    
    @PostMapping("/approve/{doctorId}")
    public ResponseEntity<DoctorApprovalDto> approveDoctor(@PathVariable Long doctorId) {
        Optional<DoctorApprovalRequest> requestOpt = approvalRequestRepository.findByDoctorId(doctorId);
        if (requestOpt.isPresent()) {
            DoctorApprovalRequest request = requestOpt.get();
            request.setStatus("approved");
            request.setReviewedAt(java.time.LocalDateTime.now());
            approvalRequestRepository.save(request);
            
            // Update doctor status
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                doctor.setIsVerified(true);
                doctorRepository.save(doctor);
            }
            
            return ResponseEntity.ok(convertRequestToDto(request));
        }
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/reject/{doctorId}")
    public ResponseEntity<DoctorApprovalDto> rejectDoctor(@PathVariable Long doctorId) {
        Optional<DoctorApprovalRequest> requestOpt = approvalRequestRepository.findByDoctorId(doctorId);
        if (requestOpt.isPresent()) {
            DoctorApprovalRequest request = requestOpt.get();
            request.setStatus("rejected");
            request.setReviewedAt(java.time.LocalDateTime.now());
            approvalRequestRepository.save(request);
            
            // Doctor remains unverified
            return ResponseEntity.ok(convertRequestToDto(request));
        }
        return ResponseEntity.notFound().build();
    }
    
    // Test endpoint to manually verify a doctor and create approval request
    @PostMapping("/test-verify/{doctorId}")
    public ResponseEntity<String> testVerifyDoctor(@PathVariable Long doctorId) {
        try {
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                doctor.setEmailVerified(true);
                doctor.setVerificationToken(null);
                doctor.setVerificationTokenExpiry(null);
                doctorRepository.save(doctor);
                
                // Create approval request
                DoctorApprovalRequest approvalRequest = new DoctorApprovalRequest();
                approvalRequest.setDoctorId(doctor.getId());
                approvalRequest.setAssignedAdminId(1L); // Use admin ID 1 for testing
                approvalRequest.setStatus("pending");
                approvalRequestRepository.save(approvalRequest);
                
                return ResponseEntity.ok("Doctor verified and approval request created successfully!");
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Get all doctors for admin management
    @GetMapping("/all")
    public ResponseEntity<List<DoctorApprovalDto>> getAllDoctors() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<DoctorApprovalDto> doctorDtos = doctors.stream()
            .map(this::convertDoctorToDto)
            .toList();
        return ResponseEntity.ok(doctorDtos);
    }
    
    // Get doctor by ID for admin management
    @GetMapping("/{doctorId}")
    public ResponseEntity<DoctorApprovalDto> getDoctorById(@PathVariable Long doctorId) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            DoctorApprovalDto doctorDto = convertDoctorToDto(doctorOpt.get());
            return ResponseEntity.ok(doctorDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Update doctor status (active/suspended)
    @PutMapping("/{doctorId}/status")
    public ResponseEntity<DoctorApprovalDto> updateDoctorStatus(
            @PathVariable Long doctorId, 
            @RequestBody String status) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            // Update the status field for active/suspended status
            if ("active".equals(status) || "suspended".equals(status)) {
                doctor.setStatus(status);
            }
            doctorRepository.save(doctor);
            
            DoctorApprovalDto doctorDto = convertDoctorToDto(doctor);
            return ResponseEntity.ok(doctorDto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    private DoctorApprovalDto convertDoctorToDto(Doctor doctor) {
        return new DoctorApprovalDto(
            doctor.getId(),
            doctor.getUsername(),
            doctor.getEmail(),
            doctor.getFirstName(),
            doctor.getLastName(),
            doctor.getPhone(),
            doctor.getSpecialization(),
            doctor.getLicenseNumber(),
            doctor.getHospital(),
            doctor.getAddress(),
            doctor.getCity(),
            doctor.getState(),
            doctor.getZipCode(),
            doctor.getYearsOfExperience(),
            doctor.getEmailVerified(),
            doctor.getIsVerified(),
            null, // No assigned admin for general doctor management
            doctor.getSubscriptionStatus(),
            doctor.getPatientLimit(),
            doctor.getCurrentPatients(),
            doctor.getCreatedAt(),
            doctor.getEmailVerified() ? doctor.getUpdatedAt() : null
        );
    }
    
    private DoctorApprovalDto convertRequestToDto(DoctorApprovalRequest request) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(request.getDoctorId());
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            return new DoctorApprovalDto(
                doctor.getId(),
                doctor.getUsername(),
                doctor.getEmail(),
                doctor.getFirstName(),
                doctor.getLastName(),
                doctor.getPhone(),
                doctor.getSpecialization(),
                doctor.getLicenseNumber(),
                doctor.getHospital(),
                doctor.getAddress(),
                doctor.getCity(),
                doctor.getState(),
                doctor.getZipCode(),
                doctor.getYearsOfExperience(),
                doctor.getEmailVerified(),
                doctor.getIsVerified(),
                request.getAssignedAdminId(),
                doctor.getSubscriptionStatus(),
                doctor.getPatientLimit(),
                doctor.getCurrentPatients(),
                doctor.getCreatedAt(),
                doctor.getEmailVerified() ? doctor.getUpdatedAt() : null
            );
        }
        return null;
    }
}
