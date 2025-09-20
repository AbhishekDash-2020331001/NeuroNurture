package com.example.nuru_chat.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String conversationId;
    private String sender; // "user" or "assistant"
    private String content;
    private LocalDateTime timestamp;
    private boolean isTyping = false;
}
