package com.example.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeExchange(exchanges -> exchanges
                // Allow actuator endpoints
                .pathMatchers("/actuator/**").permitAll()
                // Allow fallback endpoints
                .pathMatchers("/fallback/**").permitAll()
                // Allow all other requests (authentication handled by JWT filter)
                .anyExchange().permitAll()
            )
            .build();
    }
}
