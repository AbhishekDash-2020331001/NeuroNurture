package com.example.nuru_chat.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversations")
public class Conversation {
    @Id
    private String id;
    
    @Field("user_type")
    private String userType; // "parent", "school", "doctor", "admin"
    
    @Field("user_id")
    private String userId;
    
    private String title;
    
    @Field("context")
    private String context; // Updated after each message
    
    @Field("created_at")
    private LocalDateTime createdAt;
    
    @Field("updated_at")
    private LocalDateTime updatedAt;
    
    @Field("message_count")
    private int messageCount = 0;
    
    @Field("last_message")
    private String lastMessage;
    
    @Field("last_message_time")
    private LocalDateTime lastMessageTime;
}
