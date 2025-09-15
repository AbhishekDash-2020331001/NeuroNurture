package com.example.doctor.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.doctor.dto.DoctorAuthResponse;
import com.example.doctor.dto.DoctorLoginRequest;
import com.example.doctor.dto.DoctorRegistrationRequest;
import com.example.doctor.entity.Doctor;
import com.example.doctor.entity.DoctorApprovalRequest;
import com.example.doctor.repository.DoctorApprovalRequestRepository;
import com.example.doctor.repository.DoctorRepository;
import com.example.doctor.util.JwtUtil;

@Service
@Transactional
public class DoctorAuthService implements UserDetailsService {
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private DoctorApprovalRequestRepository approvalRequestRepository;
    
    @Autowired
    @Lazy
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private RestTemplate restTemplate;
    
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return doctorRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Doctor not found: " + username));
    }
    
    @Transactional
    public String registerDoctor(DoctorRegistrationRequest request) {
        if (doctorRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Doctor already exists with this username");
        }
        if (doctorRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (doctorRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new RuntimeException("License number already registered");
        }
        
        // Ensure username and email are the same
        if (!request.getUsername().equals(request.getEmail())) {
            throw new RuntimeException("Username and email must be the same");
        }
        
        Doctor doctor = new Doctor();
        doctor.setUsername(request.getUsername());
        doctor.setEmail(request.getEmail());
        doctor.setPassword(passwordEncoder.encode(request.getPassword()));
        doctor.setFirstName(request.getFirstName());
        doctor.setLastName(request.getLastName());
        doctor.setPhone(request.getPhone());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setLicenseNumber(request.getLicenseNumber());
        doctor.setHospital(request.getHospital());
        doctor.setAddress(request.getAddress());
        doctor.setCity(request.getCity());
        doctor.setState(request.getState());
        doctor.setZipCode(request.getZipCode());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setEnabled(true);
        
        // Generate verification token
        String verificationToken = generateVerificationToken();
        doctor.setVerificationToken(verificationToken);
        doctor.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
        
        doctorRepository.save(doctor);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(doctor.getEmail(), doctor.getFirstName() + " " + doctor.getLastName(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            // Don't fail registration if email fails, but log it
        }
        
        return "Doctor registered successfully. Please check your email to verify your account before logging in.";
    }
    
    public DoctorAuthResponse loginDoctor(DoctorLoginRequest request) {
        Doctor doctor = doctorRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), doctor.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        if (!doctor.isEnabled()) {
            throw new RuntimeException("Doctor account is disabled");
        }
        
        if (!doctor.getEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in. Check your email for verification instructions.");
        }
        
        if (!doctor.getIsVerified()) {
            throw new RuntimeException("Your doctor account is pending admin approval. You will be notified once approved.");
        }
        
        String token = jwtUtil.generateToken(doctor.getUsername());
        
        DoctorAuthResponse.DoctorInfo doctorInfo = new DoctorAuthResponse.DoctorInfo();
        doctorInfo.setId(doctor.getId());
        doctorInfo.setUsername(doctor.getUsername());
        doctorInfo.setEmail(doctor.getEmail());
        doctorInfo.setFirstName(doctor.getFirstName());
        doctorInfo.setLastName(doctor.getLastName());
        doctorInfo.setPhone(doctor.getPhone());
        doctorInfo.setSpecialization(doctor.getSpecialization());
        doctorInfo.setLicenseNumber(doctor.getLicenseNumber());
        doctorInfo.setHospital(doctor.getHospital());
        doctorInfo.setAddress(doctor.getAddress());
        doctorInfo.setCity(doctor.getCity());
        doctorInfo.setState(doctor.getState());
        doctorInfo.setZipCode(doctor.getZipCode());
        doctorInfo.setYearsOfExperience(doctor.getYearsOfExperience());
        doctorInfo.setSubscriptionStatus(doctor.getSubscriptionStatus());
        doctorInfo.setSubscriptionExpiry(doctor.getSubscriptionExpiry() != null ? doctor.getSubscriptionExpiry().toString() : null);
        doctorInfo.setStripeCustomerId(doctor.getStripeCustomerId());
        doctorInfo.setStripeSubscriptionId(doctor.getStripeSubscriptionId());
        doctorInfo.setPatientLimit(doctor.getPatientLimit());
        doctorInfo.setCurrentPatients(doctor.getCurrentPatients());
        
        return new DoctorAuthResponse(token, "Bearer", doctorInfo);
    }
    
    public String verifyEmail(String token) {
        Doctor doctor = doctorRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (doctor.getVerificationTokenExpiry() != null && 
            doctor.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }
        
        doctor.setEmailVerified(true);
        doctor.setVerificationToken(null);
        doctor.setVerificationTokenExpiry(null);
        doctorRepository.save(doctor);
        
        // Create approval request with random admin assignment
        Long adminId = assignRandomAdmin();
        if (adminId != null) {
            DoctorApprovalRequest approvalRequest = new DoctorApprovalRequest();
            approvalRequest.setDoctorId(doctor.getId());
            approvalRequest.setAssignedAdminId(adminId);
            approvalRequest.setStatus("pending");
            approvalRequestRepository.save(approvalRequest);
        }
        
        return "Email verified successfully. Your doctor account is now pending admin approval. You will be notified once approved.";
    }
    
    private Long assignRandomAdmin() {
        try {
            // Get all admin users from admin service
            Long[] adminIds = restTemplate.getForObject(
                "http://localhost:8090/api/admin/users",
                Long[].class
            );
            
            if (adminIds != null && adminIds.length > 0) {
                Random random = new Random();
                return adminIds[random.nextInt(adminIds.length)];
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public Doctor getDoctorByUsername(String username) {
        return doctorRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Doctor not found: " + username));
    }
    
    public String checkVerificationStatus(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        if (!doctor.getEmailVerified()) {
            return "pending_email";
        }
        
        if (!doctor.getIsVerified()) {
            return "pending_approval";
        }
        
        return "approved";
    }
    
    private String generateVerificationToken() {
        return java.util.UUID.randomUUID().toString();
    }
    
    // Get doctor information by ID (public method)
    public ResponseEntity<?> getDoctorInfo(Long doctorId) {
        Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
        if (doctorOpt.isPresent()) {
            Doctor doctor = doctorOpt.get();
            
            // Create a simplified doctor info DTO for public access
            Map<String, Object> doctorInfo = new HashMap<>();
            doctorInfo.put("id", doctor.getId());
            doctorInfo.put("firstName", doctor.getFirstName());
            doctorInfo.put("lastName", doctor.getLastName());
            doctorInfo.put("specialization", doctor.getSpecialization());
            doctorInfo.put("hospital", doctor.getHospital());
            doctorInfo.put("email", doctor.getEmail());
            doctorInfo.put("phone", doctor.getPhone());
            doctorInfo.put("address", doctor.getAddress());
            doctorInfo.put("yearsOfExperience", doctor.getYearsOfExperience());
            doctorInfo.put("licenseNumber", doctor.getLicenseNumber());
            
            return ResponseEntity.ok(doctorInfo);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
