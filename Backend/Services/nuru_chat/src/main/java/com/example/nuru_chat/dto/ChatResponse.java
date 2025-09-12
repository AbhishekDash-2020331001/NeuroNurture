package com.example.nuru_chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String response;
    private String conversationId;
    private String userType;
    private String userId;
    private LocalDateTime timestamp;
    private boolean error = false;
    private String errorMessage;
}
