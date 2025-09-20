package com.example.admin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
@RequestMapping("/api/admin/tickets")
@CrossOrigin(originPatterns = {"http://localhost:3001", "http://localhost:8081"})
public class TicketController {
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082";
    
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Ticket>> getTicketsByAdminId(@PathVariable Long adminId) {
        try {
            String url = PARENT_SERVICE_URL + "/api/tickets/admin/" + adminId;
            List<Ticket> tickets = restTemplate.getForObject(url, List.class);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String ticketId) {
        try {
            String url = PARENT_SERVICE_URL + "/api/tickets/" + ticketId;
            Ticket ticket = restTemplate.getForObject(url, Ticket.class);
            return ticket != null ? ResponseEntity.ok(ticket) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<Ticket> addMessage(@PathVariable String ticketId, @RequestBody AddMessageRequest request) {
        try {
            String url = PARENT_SERVICE_URL + "/api/tickets/" + ticketId + "/messages";
            Ticket ticket = restTemplate.postForObject(url, request, Ticket.class);
            return ticket != null ? ResponseEntity.ok(ticket) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PutMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable String ticketId, @RequestBody UpdateStatusRequest request) {
        try {
            String url = PARENT_SERVICE_URL + "/api/tickets/" + ticketId + "/status";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            HttpEntity<UpdateStatusRequest> entity = new HttpEntity<>(request, headers);
            
            Ticket ticket = restTemplate.exchange(url, HttpMethod.PUT, entity, Ticket.class).getBody();
            return ticket != null ? ResponseEntity.ok(ticket) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // DTOs for request bodies
    public static class AddMessageRequest {
        private Long senderId;
        private String senderType;
        private String content;
        
        // Getters and setters
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
    
    public static class UpdateStatusRequest {
        private String status;
        
        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // Ticket class for admin service
    public static class Ticket {
        private String id;
        private Long parentId;
        private Long adminId;
        private String subject;
        private String description;
        private String status;
        private String priority;
        private String createdAt;
        private String updatedAt;
        private String resolvedAt;
        private List<Message> messages;
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
        public Long getAdminId() { return adminId; }
        public void setAdminId(Long adminId) { this.adminId = adminId; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
        public String getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
        public String getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }
        public List<Message> getMessages() { return messages; }
        public void setMessages(List<Message> messages) { this.messages = messages; }
    }
    
    public static class Message {
        private String id;
        private Long senderId;
        private String senderType;
        private String content;
        private String timestamp;
        private boolean isRead;
        
        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }
    }
}
