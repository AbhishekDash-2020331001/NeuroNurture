package com.example.school.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.dto.SchoolAuthResponse;
import com.example.school.dto.SchoolLoginRequest;
import com.example.school.dto.SchoolRegistrationRequest;
import com.example.school.dto.VerificationStatusResponse;
import com.example.school.service.SchoolAuthService;

@RestController
@RequestMapping("/api/school/auth")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001"}, allowCredentials = "true")
public class SchoolAuthController {
    
    @Autowired
    private SchoolAuthService schoolAuthService;
    
    @PostMapping("/register")
    public ResponseEntity<String> registerSchool(@RequestBody SchoolRegistrationRequest request) {
        try {
            String message = schoolAuthService.registerSchool(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists") || e.getMessage().contains("already registered")) {
                return ResponseEntity.status(409).body(e.getMessage());
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginSchool(@RequestBody SchoolLoginRequest request) {
        try {
            SchoolAuthResponse response = schoolAuthService.loginSchool(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        try {
            String message = schoolAuthService.verifyEmail(token);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Email verification failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/verification-status")
    public ResponseEntity<?> getVerificationStatus(@RequestParam("email") String email) {
        try {
            VerificationStatusResponse response = schoolAuthService.getVerificationStatus(email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to get verification status: " + e.getMessage());
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentSchool(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            String username = schoolAuthService.getJwtUtil().extractUsername(token);
            var school = schoolAuthService.getSchoolByUsername(username);
            
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
            
            return ResponseEntity.ok(schoolInfo);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Unauthorized: " + e.getMessage());
        }
    }
}
