package com.example.parent.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDto {
    private String id;
    private Long childId;
    private Long doctorId;
    private String senderType; // "child" or "doctor"
    private Long senderId;
    private String message;
    private LocalDateTime timestamp;
    private boolean isRead;
}
