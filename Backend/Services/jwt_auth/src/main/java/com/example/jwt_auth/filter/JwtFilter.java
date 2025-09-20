package com.example.jwt_auth.filter;

import java.io.IOException;
import java.util.Collections; // for empty authorities list

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.jwt_auth.util.JwtUtil;

import io.jsonwebtoken.JwtException; // handles all signature/expiration errors
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String token = null;
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        
        System.out.println("=== JWT FILTER ===");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Token found: " + (token != null));
        if (token != null) {
            System.out.println("Token: " + token.substring(0, Math.min(50, token.length())) + "...");
        }
        
        if (token != null) {
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.extractUsername(token);
                    System.out.println("Setting authentication for user: " + username);
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, Collections.emptyList());
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    System.out.println("Token validation failed");
                }
            } catch (JwtException ex) {
                System.out.println("JWT Exception: " + ex.getMessage());
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}