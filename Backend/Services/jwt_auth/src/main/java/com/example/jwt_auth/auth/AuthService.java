package com.example.jwt_auth.auth;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.jwt_auth.JwtUtil;
import com.example.jwt_auth.email.EmailService;
import com.example.jwt_auth.token.RefreshToken;
import com.example.jwt_auth.token.RefreshTokenRepository;
import com.example.jwt_auth.user.User;
import com.example.jwt_auth.user.UserRepository;

@Service
@Transactional(readOnly = true)
public class AuthService {

    @Autowired private AuthenticationManager authManager;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private RefreshTokenRepository refreshTokenRepository;
    @Autowired private EmailService emailService;
    
    @Transactional
    public void register(AuthRequest request) {
        if (userRepository.findByUsername(request.username).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        if (userRepository.findByEmail(request.email).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        // Ensure username and email are the same
        if (!request.username.equals(request.email)) {
            throw new RuntimeException("Username and email must be the same");
        }
        
        User user = new User();
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setEmailVerified(false);
        user.setAuthProvider("MANUAL");
        
        // Generate verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        
        userRepository.save(user);
        
        // Send verification email (don't fail registration if email fails)
        try {
            emailService.sendVerificationEmail(request.email, request.username, verificationToken);
        } catch (Exception e) {
            // Log the error but don't fail registration
            System.err.println("Failed to send verification email: " + e.getMessage());
            System.err.println("Verification token for " + request.email + ": " + verificationToken);
        }
    }
    
    @Transactional
    public boolean verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));
        
        if (user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token expired");
        }
        
        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        
        return true;
    }
    
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        // Generate new verification token
        String verificationToken = UUID.randomUUID().toString();
        user.setVerificationToken(verificationToken);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken);
    }
    
    @Transactional
    public AuthResponse loginWithTokens(AuthRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username, request.password)
        );
        User user = userRepository.findByUsername(request.username).orElseThrow();
        
        // Check if email is verified for manual signups
        if ("MANUAL".equals(user.getAuthProvider()) && !user.getEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in");
        }
        
        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(token, refreshToken);
    }
    
    public boolean isEmailVerified(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getEmailVerified();
    }

    public boolean verifyPassword(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return passwordEncoder.matches(password, user.getPassword());
    }
    
    @Transactional
    public void changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public String createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusSeconds(7 * 24 * 60 * 60)); // 7 days
        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    public String refreshAccessToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        return jwtUtil.generateToken(refreshToken.getUser().getUsername());
    }
    
    @Transactional
    public void invalidateRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}