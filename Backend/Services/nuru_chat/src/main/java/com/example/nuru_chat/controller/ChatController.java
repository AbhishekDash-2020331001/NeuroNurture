package com.example.nuru_chat.controller;

import com.example.nuru_chat.dto.ChatRequest;
import com.example.nuru_chat.dto.ChatResponse;
import com.example.nuru_chat.dto.ConversationListResponse;
import com.example.nuru_chat.dto.MessageListResponse;
import com.example.nuru_chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8081", "http://127.0.0.1:3000", "http://127.0.0.1:8081","http://localhost:3001"})
public class ChatController {
    
    private final ChatService chatService;
    
    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        log.info("Received chat request: userType={}, userId={}, conversationId={}", 
                request.getUserType(), request.getUserId(), request.getConversationId());
        
        ChatResponse response = chatService.processMessage(request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/conversations/{userType}/{userId}")
    public ResponseEntity<ConversationListResponse> getConversations(
            @PathVariable String userType,
            @PathVariable String userId) {
        log.info("Getting conversations for userType={}, userId={}", userType, userId);
        
        ConversationListResponse response = chatService.getConversations(userType, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/conversations/{userType}/{userId}/{conversationId}/messages")
    public ResponseEntity<MessageListResponse> getMessages(
            @PathVariable String userType,
            @PathVariable String userId,
            @PathVariable String conversationId) {
        log.info("Getting messages for conversationId={}", conversationId);
        
        MessageListResponse response = chatService.getMessages(conversationId);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/conversations/{userType}/{userId}/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable String userType,
            @PathVariable String userId,
            @PathVariable String conversationId) {
        log.info("Deleting conversation: userType={}, userId={}, conversationId={}", 
                userType, userId, conversationId);
        
        chatService.deleteConversation(userType, userId, conversationId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Nuru Chat Service is running");
    }
}
