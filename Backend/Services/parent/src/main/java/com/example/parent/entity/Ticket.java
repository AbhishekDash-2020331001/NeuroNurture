package com.example.parent.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class Ticket {
    private String id;
    private Long parentId;
    private Long adminId;
    private String subject;
    private String description;
    private String status; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private String priority; // LOW, MEDIUM, HIGH, URGENT
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private List<Message> messages;

    public Ticket() {
        this.id = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

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
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }

    public static class Message {
        private String id;
        private Long senderId;
        private String senderType; // PARENT, ADMIN
        private String content;
        private LocalDateTime timestamp;
        private boolean isRead;

        public Message() {
            this.id = UUID.randomUUID().toString();
            this.timestamp = LocalDateTime.now();
            this.isRead = false;
        }

        // Getters and setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        
        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
        
        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }
    }
}
