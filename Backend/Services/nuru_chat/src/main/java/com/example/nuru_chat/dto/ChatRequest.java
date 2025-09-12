package com.example.nuru_chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private String userType;
    private String userId;
    private String conversationId; // Optional - if null, creates new conversation
    private String context; // Optional - conversation context for better AI responses
}
