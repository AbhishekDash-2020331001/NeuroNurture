package com.example.gateway.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Object>> authFallback() {
        return createFallbackResponse("Authentication service is temporarily unavailable");
    }

    @GetMapping("/parent")
    public ResponseEntity<Map<String, Object>> parentFallback() {
        return createFallbackResponse("Parent service is temporarily unavailable");
    }

    @GetMapping("/school")
    public ResponseEntity<Map<String, Object>> schoolFallback() {
        return createFallbackResponse("School service is temporarily unavailable");
    }

    @GetMapping("/doctor")
    public ResponseEntity<Map<String, Object>> doctorFallback() {
        return createFallbackResponse("Doctor service is temporarily unavailable");
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> adminFallback() {
        return createFallbackResponse("Admin service is temporarily unavailable");
    }

    @GetMapping("/game")
    public ResponseEntity<Map<String, Object>> gameFallback() {
        return createFallbackResponse("Game service is temporarily unavailable");
    }

    @GetMapping("/chat")
    public ResponseEntity<Map<String, Object>> chatFallback() {
        return createFallbackResponse("Chat service is temporarily unavailable");
    }

    private ResponseEntity<Map<String, Object>> createFallbackResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "error");
        response.put("message", message);
        response.put("timestamp", Instant.now().toString());
        response.put("fallback", true);
        
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}

