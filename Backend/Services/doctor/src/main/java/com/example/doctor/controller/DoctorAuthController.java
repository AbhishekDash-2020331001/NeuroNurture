package com.example.doctor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctor.dto.DoctorAuthResponse;
import com.example.doctor.dto.DoctorLoginRequest;
import com.example.doctor.dto.DoctorRegistrationRequest;
import com.example.doctor.service.DoctorAuthService;

@RestController
@RequestMapping("/api/doctor/auth")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001"}, allowCredentials = "true")
public class DoctorAuthController {
    
    @Autowired
    private DoctorAuthService doctorAuthService;
    
    @PostMapping("/register")
    public ResponseEntity<String> registerDoctor(@RequestBody DoctorRegistrationRequest request) {
        try {
            String message = doctorAuthService.registerDoctor(request);
            return ResponseEntity.ok(message);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists") || e.getMessage().contains("already registered")) {
                return ResponseEntity.status(409).body(e.getMessage());
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginDoctor(@RequestBody DoctorLoginRequest request) {
        try {
            DoctorAuthResponse response = doctorAuthService.loginDoctor(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Login failed: " + e.getMessage());
        }
    }
    
    // Get doctor information by ID (public endpoint)
    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<?> getDoctorInfo(@PathVariable Long doctorId) {
        try {
            return doctorAuthService.getDoctorInfo(doctorId);
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Doctor not found: " + e.getMessage());
        }
    }
    
    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        try {
            String message = doctorAuthService.verifyEmail(token);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Email verification failed: " + e.getMessage());
        }
    }
    
    @GetMapping("/verification-status")
    public ResponseEntity<String> checkVerificationStatus(@RequestParam("email") String email) {
        try {
            String status = doctorAuthService.checkVerificationStatus(email);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to check verification status: " + e.getMessage());
        }
    }
}

