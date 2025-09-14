package com.example.school.service;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.school.dto.SchoolAuthResponse;
import com.example.school.dto.SchoolLoginRequest;
import com.example.school.dto.SchoolRegistrationRequest;
import com.example.school.dto.VerificationStatusResponse;
import com.example.school.entity.School;
import com.example.school.entity.SchoolApprovalRequest;
import com.example.school.repository.SchoolApprovalRequestRepository;
import com.example.school.repository.SchoolRepository;
import com.example.school.util.JwtUtil;

@Service
@Transactional
public class SchoolAuthService implements UserDetailsService {
    
    @Autowired
    private SchoolRepository schoolRepository;
    
    @Autowired
    private SchoolApprovalRequestRepository approvalRequestRepository;
    
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
        return schoolRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("School not found: " + username));
    }
    
    @Transactional
    public String registerSchool(SchoolRegistrationRequest request) {
        if (schoolRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("School already exists with this username");
        }
        if (schoolRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        
        // Ensure username and email are the same
        if (!request.getUsername().equals(request.getEmail())) {
            throw new RuntimeException("Username and email must be the same");
        }
        
        School school = new School();
        school.setUsername(request.getUsername());
        school.setEmail(request.getEmail());
        school.setPassword(passwordEncoder.encode(request.getPassword()));
        school.setSchoolName(request.getSchoolName());
        school.setContactPerson(request.getContactPerson());
        school.setPhone(request.getPhone());
        school.setAddress(request.getAddress());
        school.setCity(request.getCity());
        school.setState(request.getState());
        school.setZipCode(request.getZipCode());
        school.setStudentCount(request.getStudentCount());
        school.setEnabled(true);
        
        // Generate verification token
        String verificationToken = generateVerificationToken();
        school.setVerificationToken(verificationToken);
        school.setVerificationTokenExpiry(java.time.LocalDateTime.now().plusHours(24));
        
        schoolRepository.save(school);
        
        // Send verification email
        try {
            emailService.sendVerificationEmail(school.getEmail(), school.getSchoolName(), verificationToken);
        } catch (Exception e) {
            System.err.println("Failed to send verification email: " + e.getMessage());
            // Don't fail registration if email fails, but log it
        }
        
        return "School registered successfully. Please check your email to verify your account before logging in.";
    }
    
    public SchoolAuthResponse loginSchool(SchoolLoginRequest request) {
        School school = schoolRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("School not found"));
        
        if (!passwordEncoder.matches(request.getPassword(), school.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        
        if (!school.isEnabled()) {
            throw new RuntimeException("School account is disabled");
        }
        
        if (!school.getEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in. Check your email for verification instructions.");
        }
        
        if (!school.getIsVerified()) {
            throw new RuntimeException("Your school account is pending admin approval. You will be notified once approved.");
        }
        
        String token = jwtUtil.generateToken(school.getUsername());
        
        SchoolAuthResponse.SchoolInfo schoolInfo = new SchoolAuthResponse.SchoolInfo();
        schoolInfo.setId(school.getId());
        schoolInfo.setUsername(school.getUsername());
        schoolInfo.setEmail(school.getEmail());
        schoolInfo.setSchoolName(school.getSchoolName());
        schoolInfo.setContactPerson(school.getContactPerson());
        schoolInfo.setPhone(school.getPhone());
        schoolInfo.setAddress(school.getAddress());
        schoolInfo.setCity(school.getCity());
        schoolInfo.setState(school.getState());
        schoolInfo.setZipCode(school.getZipCode());
        schoolInfo.setStudentCount(school.getStudentCount());
        // Debug subscription data
        System.out.println("=== SCHOOL LOGIN DEBUG ===");
        System.out.println("School ID: " + school.getId());
        System.out.println("Subscription Status: " + school.getSubscriptionStatus());
        System.out.println("Subscription Plan: " + school.getSubscriptionPlan());
        System.out.println("Subscription Expiry: " + school.getSubscriptionExpiry());
        System.out.println("Stripe Customer ID: " + school.getStripeCustomerId());
        System.out.println("Stripe Subscription ID: " + school.getStripeSubscriptionId());
        System.out.println("Children Limit: " + school.getChildrenLimit());
        System.out.println("Current Children: " + school.getCurrentChildren());
        System.out.println("=========================");
        
        schoolInfo.setSubscriptionStatus(school.getSubscriptionStatus());
        schoolInfo.setSubscriptionPlan(school.getSubscriptionPlan());
        schoolInfo.setSubscriptionExpiry(school.getSubscriptionExpiry() != null ? school.getSubscriptionExpiry().toString() : null);
        schoolInfo.setStripeCustomerId(school.getStripeCustomerId());
        schoolInfo.setStripeSubscriptionId(school.getStripeSubscriptionId());
        schoolInfo.setChildrenLimit(school.getChildrenLimit());
        schoolInfo.setCurrentChildren(school.getCurrentChildren());
        
        return new SchoolAuthResponse(token, "Bearer", schoolInfo);
    }
    
    public String verifyEmail(String token) {
        School school = schoolRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (school.getVerificationTokenExpiry() != null && 
            school.getVerificationTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }
        
        school.setEmailVerified(true);
        school.setVerificationToken(null);
        school.setVerificationTokenExpiry(null);
        schoolRepository.save(school);
        
        // Create approval request with random admin assignment
        Long adminId = assignRandomAdmin();
        if (adminId != null) {
            SchoolApprovalRequest approvalRequest = new SchoolApprovalRequest();
            approvalRequest.setSchoolId(school.getId());
            approvalRequest.setAssignedAdminId(adminId);
            approvalRequest.setStatus("pending");
            approvalRequestRepository.save(approvalRequest);
        }
        
        return "Email verified successfully. Your school account is now pending admin approval. You will be notified once approved.";
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
    
    public School getSchoolByUsername(String username) {
        return schoolRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("School not found: " + username));
    }
    
    public JwtUtil getJwtUtil() {
        return jwtUtil;
    }
    
    public VerificationStatusResponse getVerificationStatus(String email) {
        School school = schoolRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("School not found"));
        
        VerificationStatusResponse response = new VerificationStatusResponse();
        VerificationStatusResponse.SchoolInfo schoolInfo = new VerificationStatusResponse.SchoolInfo();
        
        // Populate school info
        schoolInfo.setId(school.getId());
        schoolInfo.setSchoolName(school.getSchoolName());
        schoolInfo.setContactPerson(school.getContactPerson());
        schoolInfo.setEmail(school.getEmail());
        schoolInfo.setPhone(school.getPhone());
        schoolInfo.setAddress(school.getAddress());
        schoolInfo.setCity(school.getCity());
        schoolInfo.setState(school.getState());
        schoolInfo.setZipCode(school.getZipCode());
        schoolInfo.setStudentCount(school.getStudentCount());
        schoolInfo.setEmailVerified(school.getEmailVerified());
        schoolInfo.setIsVerified(school.getIsVerified());
        schoolInfo.setSubscriptionStatus(school.getSubscriptionStatus());
        schoolInfo.setChildrenLimit(school.getChildrenLimit());
        schoolInfo.setCurrentChildren(school.getCurrentChildren());
        // Get assigned admin ID from approval request
        Optional<SchoolApprovalRequest> approvalRequest = approvalRequestRepository.findBySchoolId(school.getId());
        schoolInfo.setAssignedAdminId(approvalRequest.map(SchoolApprovalRequest::getAssignedAdminId).orElse(null));
        
        response.setSchool(schoolInfo);
        
        // Determine status
        if (!school.getEmailVerified()) {
            response.setStatus("pending_email");
            response.setMessage("Please verify your email address to continue. Check your email for verification instructions.");
        } else if (!school.getIsVerified()) {
            response.setStatus("pending_admin");
            response.setMessage("Your email has been verified. Your school account is now pending admin approval. You will be notified once approved.");
        } else {
            response.setStatus("approved");
            response.setMessage("Your school account is fully verified and approved. You can now access all features.");
        }
        
        return response;
    }
    
    private String generateVerificationToken() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

