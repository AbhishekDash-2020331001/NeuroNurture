package com.example.jwt_auth.auth;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.jwt_auth.user.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @GetMapping("/")
    public String hello() {
        return "Hello from Neuronurture!";
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok("User registered. Please check your email to verify your account.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User already exists")) {
                return ResponseEntity.status(409).body("User already exists");
            }
            if (e.getMessage() != null && e.getMessage().contains("Email already registered")) {
                return ResponseEntity.status(409).body("Email already registered");
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/register/parent")
    public ResponseEntity<String> registerParent(@RequestBody ParentRegistrationRequest request) {
        try {
            authService.registerParent(request);
            return ResponseEntity.ok("Parent registered successfully. Please check your email to verify your account.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User already exists")) {
                return ResponseEntity.status(409).body("User already exists");
            }
            if (e.getMessage() != null && e.getMessage().contains("Email already registered")) {
                return ResponseEntity.status(409).body("Email already registered");
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/register/school")
    public ResponseEntity<String> registerSchool(@RequestBody SchoolRegistrationRequest request) {
        try {
            authService.registerSchool(request);
            return ResponseEntity.ok("School registered successfully. Please check your email to verify your account. Your account will be reviewed for approval.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User already exists")) {
                return ResponseEntity.status(409).body("User already exists");
            }
            if (e.getMessage() != null && e.getMessage().contains("Email already registered")) {
                return ResponseEntity.status(409).body("Email already registered");
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/register/doctor")
    public ResponseEntity<String> registerDoctor(@RequestBody DoctorRegistrationRequest request) {
        try {
            authService.registerDoctor(request);
            return ResponseEntity.ok("Doctor registered successfully. Please check your email to verify your account. Your account will be reviewed for approval.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User already exists")) {
                return ResponseEntity.status(409).body("User already exists");
            }
            if (e.getMessage() != null && e.getMessage().contains("Email already registered")) {
                return ResponseEntity.status(409).body("Email already registered");
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/register/admin")
    public ResponseEntity<String> registerAdmin(@RequestBody AdminRegistrationRequest request) {
        try {
            authService.registerAdmin(request);
            return ResponseEntity.ok("Admin registered successfully. You can now login.");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User already exists")) {
                return ResponseEntity.status(409).body("User already exists");
            }
            if (e.getMessage() != null && e.getMessage().contains("Email already registered")) {
                return ResponseEntity.status(409).body("Email already registered");
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.loginWithTokens(request);
            
            // Get user information for the response
            User user = authService.getUserByUsername(request.username);
            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("token", authResponse.token);
            loginResponse.put("refreshToken", authResponse.refreshToken);
            loginResponse.put("id", user.getId());
            loginResponse.put("email", user.getEmail());
            loginResponse.put("role", user.getUserRole().toString());
            
            ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.token)
                    .httpOnly(true)
                    .secure(false) // For local dev, allow HTTP
                    .path("/")
                    .maxAge(60 * 60) // 1 hour
                    .sameSite("Lax") // Allow cross-origin for dev
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Please verify your email")) {
                return ResponseEntity.status(401)
                    .header("Content-Type", "application/json")
                    .body("{\"error\": \"Please verify your email before logging in\"}");
            }
            // For other authentication errors, return a generic message
            return ResponseEntity.status(401)
                .header("Content-Type", "application/json")
                .body("{\"error\": \"Invalid credentials\"}");
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam String token) {
        System.out.println("=== VERIFY EMAIL ENDPOINT CALLED ===");
        System.out.println("Token received: " + token);
        try {
            authService.verifyEmail(token);
            System.out.println("=== EMAIL VERIFICATION SUCCESS ===");
            return ResponseEntity.ok("Email verified successfully");
        } catch (RuntimeException e) {
            System.out.println("=== EMAIL VERIFICATION FAILED ===");
            System.out.println("Error: " + e.getMessage());
            return ResponseEntity.status(400).body("Email verification failed: " + e.getMessage());
        }
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<String> resendVerificationEmail(@RequestBody ResendVerificationRequest request) {
        try {
            authService.resendVerificationEmail(request.email);
            return ResponseEntity.ok("Verification email sent");
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body("Failed to send verification email: " + e.getMessage());
        }
    }

    @GetMapping("/check-email-verified")
    public ResponseEntity<Boolean> checkEmailVerified(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body(false);
        try {
            boolean isVerified = authService.isEmailVerified(auth.getName());
            return ResponseEntity.ok(isVerified);
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(false);
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<Boolean> verify(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.verifyPassword(request.username, request.password));
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest req, Authentication auth) {
        String username = auth.getName();
        authService.changePassword(username, req.oldPassword, req.newPassword);
        return ResponseEntity.ok("Password changed");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody TokenRefreshRequest request) {
        String newAccessToken = authService.refreshAccessToken(request.refreshToken);
        return ResponseEntity.ok(new AuthResponse(newAccessToken, request.refreshToken));
    }

    @GetMapping("/session")
    public ResponseEntity<Boolean> session(HttpServletRequest request) {
        System.out.println("=== SESSION CHECK CALLED ===");
        String token = null;
        if (request.getCookies() != null) {
            System.out.println("Cookies found: " + request.getCookies().length);
            for (var cookie : request.getCookies()) {
                System.out.println("Cookie: " + cookie.getName() + " = " + cookie.getValue());
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        } else {
            System.out.println("No cookies found");
        }
        if (token == null) {
            System.out.println("No JWT token found, returning false");
            return ResponseEntity.ok(false);
        }
        boolean valid = authService.validateToken(token);
        System.out.println("Token valid: " + valid);
        return ResponseEntity.ok(valid);
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth, @RequestParam(required = false) String format) {
        System.out.println("=== /auth/me ENDPOINT ===");
        System.out.println("Authentication: " + auth);
        System.out.println("Format requested: " + format);
        if (auth == null) {
            System.out.println("Authentication is null, returning 401");
            return ResponseEntity.status(401).body("");
        }
        System.out.println("Authentication name: " + auth.getName());
        
        try {
            // Get user information for the response
            User user = authService.getUserByUsername(auth.getName());
            
            // If format=json is requested, return full user data as JSON
            if ("json".equals(format)) {
                Map<String, Object> userData = new HashMap<>();
                userData.put("id", user.getId());
                userData.put("email", user.getEmail());
                userData.put("username", user.getUsername());
                userData.put("role", user.getUserRole().toString());
                userData.put("isVerified", user.getIsVerified());
                
                return ResponseEntity.ok(userData);
            }
            
            // Default behavior: return just the email/username as plain text for backward compatibility
            return ResponseEntity.ok(user.getEmail());
        } catch (Exception e) {
            System.out.println("Error getting user data: " + e.getMessage());
            // Fallback to just returning the username as plain text for backward compatibility
            return ResponseEntity.ok(auth.getName());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication auth, HttpServletResponse response) {
        // Clear the JWT cookie regardless of authentication status
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Logged out successfully");
    }
    
    @GetMapping("/clear-cookie")
    public ResponseEntity<String> clearCookie(HttpServletResponse response) {
        // Clear the JWT cookie
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Cookie cleared");
    }
    
    @GetMapping("/admins")
    public ResponseEntity<List<AdminUserDto>> getAdmins() {
        List<User> adminUsers = authService.getAdmins();
        List<AdminUserDto> adminDtos = adminUsers.stream()
                .map(user -> new AdminUserDto(user.getId(), user.getUsername(), user.getEmail(), user.getUserRole().toString()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(adminDtos);
    }
    
    @GetMapping("/user-by-email")
    public ResponseEntity<AdminUserDto> getUserByEmail(@RequestParam String email) {
        try {
            User user = authService.getUserByEmail(email);
            AdminUserDto adminDto = new AdminUserDto(user.getId(), user.getUsername(), user.getEmail(), user.getUserRole().toString());
            return ResponseEntity.ok(adminDto);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // DTO for admin users
    public static class AdminUserDto {
        private Long id;
        private String username;
        private String email;
        private String userRole;
        
        public AdminUserDto(Long id, String username, String email, String userRole) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.userRole = userRole;
        }
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getUserRole() { return userRole; }
        public void setUserRole(String userRole) { this.userRole = userRole; }
    }
}
