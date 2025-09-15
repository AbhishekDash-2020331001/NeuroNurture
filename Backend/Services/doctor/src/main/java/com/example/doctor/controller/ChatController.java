package com.example.doctor.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/doctor/chat")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082/api/parents";
    
    // Send message from doctor to child
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, Object> request) {
        logger.info("=== DOCTOR SERVICE: SEND MESSAGE ===");
        logger.info("Request: {}", request);
        
        try {
            String parentServiceUrl = PARENT_SERVICE_URL + "/chat/send-from-doctor";
            logger.info("Calling parent service: {}", parentServiceUrl);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(parentServiceUrl, request, Map.class);
            
            logger.info("Parent service response status: {}", response.getStatusCode());
            logger.info("Parent service response body: {}", response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("✅ Message sent successfully");
                return ResponseEntity.ok(response.getBody());
            } else {
                logger.warn("❌ Parent service returned non-2xx status or null body");
                return ResponseEntity.status(500).body("Failed to send message");
            }
        } catch (Exception e) {
            logger.error("❌ Error sending message: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(500).body("Error sending message: " + e.getMessage());
        }
    }
    
    // Get chat history between doctor and child
    @GetMapping("/history/{childId}/{doctorId}")
    public ResponseEntity<?> getChatHistory(@PathVariable Long childId, @PathVariable Long doctorId) {
        logger.info("=== DOCTOR SERVICE: GET CHAT HISTORY ===");
        logger.info("Child ID: {}, Doctor ID: {}", childId, doctorId);
        
        try {
            String parentServiceUrl = PARENT_SERVICE_URL + "/chat/history/" + childId + "/" + doctorId;
            logger.info("Calling parent service: {}", parentServiceUrl);
            
            ResponseEntity<List> response = restTemplate.getForEntity(parentServiceUrl, List.class);
            
            logger.info("Parent service response status: {}", response.getStatusCode());
            logger.info("Parent service response body: {}", response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("✅ Retrieved chat history successfully");
                return ResponseEntity.ok(response.getBody());
            } else {
                logger.warn("❌ Parent service returned non-2xx status or null body");
                return ResponseEntity.status(404).body("No chat history found");
            }
        } catch (Exception e) {
            logger.error("❌ Error getting chat history: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(500).body("Error getting chat history: " + e.getMessage());
        }
    }
    
    // Mark messages as read by doctor
    @PutMapping("/mark-read/{childId}/{doctorId}")
    public ResponseEntity<?> markMessagesAsRead(@PathVariable Long childId, @PathVariable Long doctorId) {
        logger.info("=== DOCTOR SERVICE: MARK MESSAGES AS READ ===");
        logger.info("Child ID: {}, Doctor ID: {}", childId, doctorId);
        
        try {
            String parentServiceUrl = PARENT_SERVICE_URL + "/chat/mark-read/" + childId + "/" + doctorId + "/doctor";
            logger.info("Calling parent service: {}", parentServiceUrl);
            
            restTemplate.put(parentServiceUrl, null);
            
            logger.info("✅ Messages marked as read successfully");
            return ResponseEntity.ok("Messages marked as read");
        } catch (Exception e) {
            logger.error("❌ Error marking messages as read: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(500).body("Error marking messages as read: " + e.getMessage());
        }
    }
    
    // Get unread message count for doctor
    @GetMapping("/unread-count/{childId}/{doctorId}")
    public ResponseEntity<?> getUnreadMessageCount(@PathVariable Long childId, @PathVariable Long doctorId) {
        logger.info("=== DOCTOR SERVICE: GET UNREAD MESSAGE COUNT ===");
        logger.info("Child ID: {}, Doctor ID: {}", childId, doctorId);
        
        try {
            String parentServiceUrl = PARENT_SERVICE_URL + "/chat/unread-count/" + childId + "/" + doctorId + "/doctor";
            logger.info("Calling parent service: {}", parentServiceUrl);
            
            ResponseEntity<Long> response = restTemplate.getForEntity(parentServiceUrl, Long.class);
            
            logger.info("Parent service response status: {}", response.getStatusCode());
            logger.info("Parent service response body: {}", response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("✅ Retrieved unread message count: {}", response.getBody());
                return ResponseEntity.ok(response.getBody());
            } else {
                logger.warn("❌ Parent service returned non-2xx status or null body");
                return ResponseEntity.ok(0L);
            }
        } catch (Exception e) {
            logger.error("❌ Error getting unread message count: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return ResponseEntity.ok(0L);
        }
    }
}
