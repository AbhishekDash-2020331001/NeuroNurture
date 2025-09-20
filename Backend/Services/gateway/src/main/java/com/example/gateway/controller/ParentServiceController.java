package com.example.gateway.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/gateway/parent")
public class ParentServiceController {

    @GetMapping("/health")
    public Map<String, Object> getParentServiceHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "parent-service");
        response.put("status", "healthy");
        response.put("timestamp", Instant.now().toString());
        response.put("gateway", "active");
        return response;
    }

    @GetMapping("/info")
    public Map<String, Object> getParentServiceInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "parent-service");
        response.put("description", "Parent and Child Management Service");
        response.put("endpoints", new String[]{
            "/api/parents/**",
            "/api/tickets/**", 
            "/api/test/**"
        });
        response.put("authentication", "JWT required for most endpoints");
        response.put("gateway", "http://localhost:8085");
        response.put("direct", "http://localhost:8082 (internal use only)");
        return response;
    }
}
