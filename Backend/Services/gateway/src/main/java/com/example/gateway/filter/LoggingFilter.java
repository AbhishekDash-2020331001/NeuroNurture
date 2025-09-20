package com.example.gateway.filter;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String requestId = request.getId();
        Instant startTime = Instant.now();

        logger.info("=== GATEWAY REQUEST START ===");
        logger.info("Request ID: {}", requestId);
        logger.info("Method: {}", request.getMethod());
        logger.info("URI: {}", request.getURI());
        logger.info("Headers: {}", request.getHeaders());
        logger.info("Remote Address: {}", request.getRemoteAddress());

        return chain.filter(exchange).then(
            Mono.fromRunnable(() -> {
                ServerHttpResponse response = exchange.getResponse();
                Instant endTime = Instant.now();
                Duration duration = Duration.between(startTime, endTime);

                logger.info("=== GATEWAY REQUEST END ===");
                logger.info("Request ID: {}", requestId);
                logger.info("Status: {}", response.getStatusCode());
                logger.info("Duration: {}ms", duration.toMillis());
                logger.info("Response Headers: {}", response.getHeaders());
            })
        );
    }

    @Override
    public int getOrder() {
        return -1; // Lowest priority, runs last
    }
}

