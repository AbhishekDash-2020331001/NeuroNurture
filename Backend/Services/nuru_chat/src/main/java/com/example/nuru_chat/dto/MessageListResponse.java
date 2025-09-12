package com.example.nuru_chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageListResponse {
    private List<MessageDto> messages;
    private int totalCount;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDto {
        private String id;
        private String sender;
        private String content;
        private LocalDateTime timestamp;
        private boolean isTyping = false;
    }
}
