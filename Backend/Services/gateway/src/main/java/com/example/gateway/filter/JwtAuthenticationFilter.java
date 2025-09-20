package com.example.gateway.filter;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import com.example.gateway.util.JwtUtil;

import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    @Autowired
    private JwtUtil jwtUtil;

    // Public endpoints that don't require authentication
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
        "/auth/login",
        "/auth/register",
        "/auth/verify-email",
        "/auth/resend-verification",
        "/auth/session",
        "/auth/me",
        "/api/school/auth/login",
        "/api/school/auth/register",
        "/api/school/auth/verify-email",
        "/api/school/auth/verification-status",
        "/api/admin/auth/login",
        "/api/admin/auth/register",
        "/oauth2/authorization/google",
        "/oauth2/authorization/facebook",
        "/login/oauth2/code/google",
        "/login/oauth2/code/facebook"
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip authentication for public endpoints
        if (isPublicEndpoint(path)) {
            return chain.filter(exchange);
        }

        // Skip authentication for OPTIONS requests (CORS preflight)
        if ("OPTIONS".equals(request.getMethod().name())) {
            return chain.filter(exchange);
        }

        String token = getTokenFromRequest(request);
        
        if (token == null) {
            return handleUnauthorized(exchange, "Missing authentication token");
        }

        try {
            if (jwtUtil.validateToken(token)) {
                // Add user info to request headers for downstream services
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                
                ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Id", username)
                    .header("X-User-Role", role != null ? role : "PARENT")
                    .header("X-User-Email", username)
                    .build();
                
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            } else {
                return handleUnauthorized(exchange, "Invalid authentication token");
            }
        } catch (Exception e) {
            return handleUnauthorized(exchange, "Token validation failed: " + e.getMessage());
        }
    }

    private boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    private String getTokenFromRequest(ServerHttpRequest request) {
        // Check Authorization header first
        String bearerToken = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        // Check cookies as fallback
        if (request.getCookies().containsKey("jwt")) {
            return request.getCookies().getFirst("jwt").getValue();
        }
        
        return null;
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add("Content-Type", "application/json");
        
        String body = "{\"error\":\"Unauthorized\",\"message\":\"" + message + "\",\"timestamp\":\"" + 
                     java.time.Instant.now().toString() + "\"}";
        
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -100; // High priority
    }
}
