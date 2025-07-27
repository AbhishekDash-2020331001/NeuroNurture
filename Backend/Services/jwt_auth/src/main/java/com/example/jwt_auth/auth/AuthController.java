package com.example.jwt_auth.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.jwt_auth.user.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private UserRepository userRepository;

    @GetMapping("/")
    public String hello() {
        return "Hello from Neuronurture!";
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok("User registered");
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("User already exists")) {
                return ResponseEntity.status(409).body("User already exists");
            }
            return ResponseEntity.status(500).body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.loginWithTokens(request);
        ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.token)
                .httpOnly(true)
                .secure(false) // For local dev, allow HTTP
                .path("/")
                .maxAge(60 * 60) // 1 hour
                .sameSite("Lax") // Allow cross-origin for dev
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok(authResponse);
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
        String token = null;
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token == null) return ResponseEntity.ok(false);
        boolean valid = authService.validateToken(token);
        return ResponseEntity.ok(valid);
    }

    @GetMapping("/me")
    public ResponseEntity<String> me(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).body("");
        return ResponseEntity.ok(auth.getName());
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication auth, HttpServletResponse response) {
        if (auth != null) {
            String username = auth.getName();
            userRepository.findByUsername(username).ifPresent(user -> authService.invalidateRefreshToken(user));
        }
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(false) // For local dev, allow HTTP
                .path("/")
                .maxAge(0)
                .sameSite("Lax") // Allow cross-origin for dev
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok("Logged out and refresh token invalidated");
    }
}
