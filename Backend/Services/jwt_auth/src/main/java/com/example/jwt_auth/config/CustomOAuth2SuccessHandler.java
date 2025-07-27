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
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String email = oauthToken.getPrincipal().getAttribute("email");
        User user = userRepository.findByUsername(email)
                .orElseGet(() -> userRepository.save(new User(null, email, "")));
        String token = jwtUtil.generateToken(user.getUsername());
        String refreshToken = authService.createRefreshToken(user);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false) // For local dev, allow HTTP
                .path("/")
                .maxAge(60 * 60)
                .sameSite("Lax") // Allow cross-origin for dev
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Redirect to frontend dashboard
        response.sendRedirect("http://localhost:8081/dashboard");
    }
} 