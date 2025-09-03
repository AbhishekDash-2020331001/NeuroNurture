package com.example.jwt_auth.config;

import java.io.IOException;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.example.jwt_auth.JwtUtil;
import com.example.jwt_auth.auth.AuthService;
import com.example.jwt_auth.user.User;
import com.example.jwt_auth.user.UserRepository;
import com.example.jwt_auth.user.UserRole;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class CustomOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final AuthService authService;
    private final UserRepository userRepository;

    public CustomOAuth2SuccessHandler(JwtUtil jwtUtil, AuthService authService, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        System.out.println("=== OAUTH2 SUCCESS HANDLER CALLED ===");
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String email = oauthToken.getPrincipal().getAttribute("email");
        System.out.println("OAuth2 email: " + email);
        
        User user = userRepository.findByUsername(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(email);
                    newUser.setEmail(email);
                    newUser.setPassword(""); // No password for OAuth users
                    newUser.setEmailVerified(true); // Google emails are pre-verified
                    newUser.setAuthProvider("GOOGLE");
                    newUser.setUserRole(UserRole.PARENT); // Google OAuth is only for parents
                    newUser.setIsVerified(true); // Parents are auto-verified
                    return userRepository.save(newUser);
                });
        
        // If user exists but doesn't have auth provider set, update it
        if (user.getAuthProvider() == null) {
            user.setAuthProvider("GOOGLE");
            user.setEmailVerified(true);
            user.setUserRole(UserRole.PARENT); // Ensure Google OAuth users are parents
            user.setIsVerified(true);
            userRepository.save(user);
        }
        
        // Check if user is a parent (Google OAuth is only allowed for parents)
        if (user.getUserRole() != UserRole.PARENT) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Google OAuth is only available for parents. Please use manual registration for other roles.");
            return;
        }
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getUserRole().toString());
        System.out.println("Generated JWT token: " + token.substring(0, Math.min(50, token.length())) + "...");
        authService.createRefreshToken(user);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false) // For local dev, allow HTTP
                .path("/")
                .maxAge(60 * 60)
                .sameSite("Lax") // Allow cross-origin for dev
                .build();
        System.out.println("Setting JWT cookie: " + cookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect based on user role
        System.out.println("User role: " + user.getUserRole());
        if (user.getUserRole() == UserRole.PARENT) {
            // For parents, redirect to auth page to let AuthSuccessHandler determine the flow
            System.out.println("Redirecting parent to /auth for AuthSuccessHandler");
            response.sendRedirect("http://localhost:8081/auth");
        } else {
            // For other roles, redirect to their respective dashboards
            System.out.println("Redirecting " + user.getUserRole() + " to dashboard");
            response.sendRedirect("http://localhost:8081/" + user.getUserRole().toString().toLowerCase() + "/dashboard");
        }
    }
} 