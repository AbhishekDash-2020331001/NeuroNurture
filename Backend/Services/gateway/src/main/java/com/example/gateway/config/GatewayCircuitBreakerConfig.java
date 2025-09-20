package com.example.gateway.config;

import java.time.Duration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;

@Configuration
public class GatewayCircuitBreakerConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
            .failureRateThreshold(50) // 50% failure rate threshold
            .waitDurationInOpenState(Duration.ofSeconds(30)) // Wait 30 seconds before trying again
            .slidingWindowSize(10) // Last 10 calls
            .minimumNumberOfCalls(5) // Minimum 5 calls before calculating failure rate
            .permittedNumberOfCallsInHalfOpenState(3) // Allow 3 calls in half-open state
            .build();

        return CircuitBreakerRegistry.of(config);
    }

    @Bean
    public CircuitBreaker authServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("auth-service");
    }

    @Bean
    public CircuitBreaker parentServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("parent-service");
    }

    @Bean
    public CircuitBreaker schoolServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("school-service");
    }

    @Bean
    public CircuitBreaker doctorServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("doctor-service");
    }

    @Bean
    public CircuitBreaker adminServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("admin-service");
    }

    @Bean
    public CircuitBreaker gameServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("game-service");
    }

    @Bean
    public CircuitBreaker chatServiceCircuitBreaker(CircuitBreakerRegistry registry) {
        return registry.circuitBreaker("chat-service");
    }
}
