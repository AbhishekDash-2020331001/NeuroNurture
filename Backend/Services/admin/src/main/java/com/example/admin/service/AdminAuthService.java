package com.example.admin.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.admin.entity.AdminUser;
import com.example.admin.repository.AdminUserRepository;
import com.example.admin.util.JwtUtil;

@Service
public class AdminAuthService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    public Map<String, Object> registerAdmin(String username, String email, String password) {
        if (adminUserRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (adminUserRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(username);
        adminUser.setEmail(email);
        adminUser.setPassword(passwordEncoder.encode(password));
        adminUser.setRole("ADMIN");
        adminUser.setEnabled(true);

        AdminUser savedAdmin = adminUserRepository.save(adminUser);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Admin registered successfully");
        response.put("adminId", savedAdmin.getId());
        response.put("username", savedAdmin.getUsername());
        response.put("email", savedAdmin.getEmail());
        response.put("role", savedAdmin.getRole());

        return response;
    }

    public Map<String, Object> loginAdmin(String username, String password) {
        try {
            System.out.println("=== ADMIN LOGIN ATTEMPT ===");
            System.out.println("Username: " + username);
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            System.out.println("Authentication successful");
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(userDetails);

            AdminUser adminUser = adminUserRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("adminId", adminUser.getId());
            response.put("username", adminUser.getUsername());
            response.put("email", adminUser.getEmail());
            response.put("role", adminUser.getRole());

            System.out.println("Login successful for: " + username);
            return response;
        } catch (Exception e) {
            System.out.println("Login failed for: " + username + ", Error: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Invalid credentials: " + e.getMessage());
        }
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }

    public Map<String, Object> getAdminInfo(String username) {
        AdminUser adminUser = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("adminId", adminUser.getId());
        response.put("username", adminUser.getUsername());
        response.put("email", adminUser.getEmail());
        response.put("role", adminUser.getRole());

        return response;
    }
    
    public List<Map<String, Object>> getAllAdmins() {
        List<AdminUser> adminUsers = adminUserRepository.findAll();
        
        return adminUsers.stream()
                .map(admin -> {
                    Map<String, Object> adminInfo = new HashMap<>();
                    adminInfo.put("id", admin.getId());
                    adminInfo.put("username", admin.getUsername());
                    adminInfo.put("email", admin.getEmail());
                    adminInfo.put("role", admin.getRole());
                    return adminInfo;
                })
                .collect(Collectors.toList());
    }
}
