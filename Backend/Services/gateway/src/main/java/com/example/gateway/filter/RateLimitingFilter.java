package com.example.gateway.filter;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class RateLimitingFilter implements GlobalFilter, Ordered {

    private final ConcurrentHashMap<String, RateLimitInfo> rateLimitMap = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS = 100; // Max requests per minute
    private static final long WINDOW_SIZE = 60000; // 1 minute in milliseconds

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String clientIp = getClientIp(request);
        String key = clientIp + ":" + request.getURI().getPath();

        RateLimitInfo rateLimitInfo = rateLimitMap.computeIfAbsent(key, k -> new RateLimitInfo());

        if (rateLimitInfo.isAllowed()) {
            return chain.filter(exchange);
        } else {
            return handleRateLimitExceeded(exchange);
        }
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddress() != null ? 
               request.getRemoteAddress().getAddress().getHostAddress() : "unknown";
    }

    private Mono<Void> handleRateLimitExceeded(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("Content-Type", "application/json");
        response.getHeaders().add("Retry-After", "60");

        String body = "{\"error\":\"Rate limit exceeded\",\"message\":\"Too many requests. Please try again later.\"," +
                     "\"timestamp\":\"" + Instant.now().toString() + "\"}";

        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -50; // After authentication filter
    }

    private static class RateLimitInfo {
        private final AtomicInteger requestCount = new AtomicInteger(0);
        private volatile long windowStart = System.currentTimeMillis();

        public boolean isAllowed() {
            long now = System.currentTimeMillis();
            
            // Reset window if it has expired
            if (now - windowStart > WINDOW_SIZE) {
                requestCount.set(0);
                windowStart = now;
            }
            
            // Check if under the limit
            return requestCount.incrementAndGet() <= MAX_REQUESTS;
        }
    }
}

