package com.example.nuru_chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationListResponse {
    private List<ConversationDto> conversations;
    private int totalCount;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationDto {
        private String id;
        private String title;
        private String lastMessage;
        private LocalDateTime lastMessageTime;
        private int messageCount;
        private LocalDateTime createdAt;
    }
}
