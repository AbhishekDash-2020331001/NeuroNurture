package com.example.parent.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
public class ChatMessage {
    @Id
    private String id;
    
    @Field("child_id")
    private Long childId;
    
    @Field("doctor_id")
    private Long doctorId;
    
    @Field("sender_type")
    private String senderType; // "child" or "doctor"
    
    @Field("sender_id")
    private Long senderId;
    
    @Field("message")
    private String message;
    
    @Field("timestamp")
    private LocalDateTime timestamp;
    
    @Field("is_read")
    private boolean isRead;
    
    // Constructors
    public ChatMessage() {}
    
    public ChatMessage(Long childId, Long doctorId, String senderType, Long senderId, String message) {
        this.childId = childId;
        this.doctorId = doctorId;
        this.senderType = senderType;
        this.senderId = senderId;
        this.message = message;
        this.timestamp = LocalDateTime.now();
        this.isRead = false;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Long getChildId() { return childId; }
    public void setChildId(Long childId) { this.childId = childId; }
    
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    
    public String getSenderType() { return senderType; }
    public void setSenderType(String senderType) { this.senderType = senderType; }
    
    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
}
