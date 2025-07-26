package com.example.jwt_auth.auth;

import com.example.jwt_auth.user.User;
import com.example.jwt_auth.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
        authService.register(request);
        return ResponseEntity.ok("User registered");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        AuthResponse response = authService.loginWithTokens(request);
        return ResponseEntity.ok(response);
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

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        authService.invalidateRefreshToken(user);
        return ResponseEntity.ok("Logged out and refresh token invalidated");
    }
}
