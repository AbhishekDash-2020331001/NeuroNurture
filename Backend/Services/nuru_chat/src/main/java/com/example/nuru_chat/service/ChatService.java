package com.example.nuru_chat.service;

import com.example.nuru_chat.dto.ChatRequest;
import com.example.nuru_chat.dto.ChatResponse;
import com.example.nuru_chat.dto.ConversationListResponse;
import com.example.nuru_chat.dto.MessageListResponse;
import com.example.nuru_chat.model.Conversation;
import com.example.nuru_chat.model.Message;
import com.example.nuru_chat.repository.ConversationRepository;
import com.example.nuru_chat.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final WebClient.Builder webClientBuilder;
    
    private static final String NURU_AGENT_URL = "http://localhost:8005";
    
    public ChatResponse processMessage(ChatRequest request) {
        try {
            log.info("=== PROCESSING MESSAGE ===");
            log.info("User: {} Type: {} Message: {}", request.getUserId(), request.getUserType(), request.getMessage());
            log.info("Conversation ID: {}", request.getConversationId());
            
            // Get or create conversation
            Conversation conversation = getOrCreateConversation(request);
            log.info("=== CONVERSATION RETRIEVED ===");
            log.info("Conversation ID: {}", conversation.getId());
            log.info("Context is null: {}", conversation.getContext() == null);
            log.info("Context length: {}", conversation.getContext() != null ? conversation.getContext().length() : 0);
            if (conversation.getContext() != null && conversation.getContext().length() > 0) {
                log.info("Context content: {}", conversation.getContext());
            } else {
                log.warn("NO CONTEXT FOUND IN DATABASE!");
            }
            
            // Save user message
            Message userMessage = saveUserMessage(conversation.getId(), request.getMessage());
            
            // Prepare request with context
            String conversationContext = conversation.getContext() != null ? conversation.getContext() : "";
            log.info("=== PREPARING REQUEST FOR NURU AGENT ===");
            log.info("Context to send length: {}", conversationContext.length());
            log.info("Context to send: {}", conversationContext);
            
            if (conversationContext.length() == 0) {
                log.error("ERROR: NO CONTEXT TO SEND TO NURU AGENT!");
            }
            
            ChatRequest requestWithContext = new ChatRequest(
                request.getMessage(),
                request.getUserType(),
                request.getUserId(),
                request.getConversationId(),
                conversationContext // Pass the conversation context
            );
            
            // Call NuruAgent API
            String aiResponse = callNuruAgent(requestWithContext);
            
            // Save AI response
            Message aiMessage = saveAIMessage(conversation.getId(), aiResponse);
            
            // Update conversation context and metadata
            updateConversationContext(conversation, request.getMessage(), aiResponse);
            
            return new ChatResponse(
                    aiResponse,
                    conversation.getId(),
                    request.getUserType(),
                    request.getUserId(),
                    LocalDateTime.now(),
                    false,
                    null
            );
                    
        } catch (Exception e) {
            log.error("Error processing message: {}", e.getMessage(), e);
            return new ChatResponse(
                    "I'm sorry, I encountered an error. Please try again.",
                    null,
                    null,
                    null,
                    LocalDateTime.now(),
                    true,
                    e.getMessage()
            );
        }
    }
    
    private Conversation getOrCreateConversation(ChatRequest request) {
        if (request.getConversationId() != null && !request.getConversationId().isEmpty()) {
            log.info("=== GETTING EXISTING CONVERSATION ===");
            log.info("Looking for conversation: {} {} {}", request.getUserType(), request.getUserId(), request.getConversationId());
            
            // Get existing conversation
            Conversation conversation = conversationRepository.findByUserTypeAndUserIdAndId(
                    request.getUserType(), 
                    request.getUserId(), 
                    request.getConversationId()
            ).orElseThrow(() -> new RuntimeException("Conversation not found"));
            
            log.info("Found conversation with context length: {}", conversation.getContext() != null ? conversation.getContext().length() : 0);
            log.info("Context content: {}", conversation.getContext());
            
            // Ensure context is not null
            if (conversation.getContext() == null) {
                log.warn("Context was null, setting to empty string");
                conversation.setContext("");
                conversationRepository.save(conversation);
            }
            
            return conversation;
        } else {
            log.info("=== CREATING NEW CONVERSATION ===");
            // Create new conversation
            Conversation conversation = new Conversation();
            conversation.setId(UUID.randomUUID().toString());
            conversation.setUserType(request.getUserType());
            conversation.setUserId(request.getUserId());
            conversation.setTitle(generateTitleFromMessage(request.getMessage()));
            conversation.setContext("");
            conversation.setCreatedAt(LocalDateTime.now());
            conversation.setUpdatedAt(LocalDateTime.now());
            conversation.setMessageCount(0);
            conversation.setLastMessage("");
            conversation.setLastMessageTime(LocalDateTime.now());
            
            log.info("Created new conversation with ID: {}", conversation.getId());
            log.info("Initial context: '{}'", conversation.getContext());
            
            Conversation savedConversation = conversationRepository.save(conversation);
            log.info("New conversation saved with context length: {}", savedConversation.getContext() != null ? savedConversation.getContext().length() : 0);
            
            return savedConversation;
        }
    }
    
    private Message saveUserMessage(String conversationId, String content) {
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setConversationId(conversationId);
        message.setSender("user");
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        
        return messageRepository.save(message);
    }
    
    private Message saveAIMessage(String conversationId, String content) {
        Message message = new Message();
        message.setId(UUID.randomUUID().toString());
        message.setConversationId(conversationId);
        message.setSender("assistant");
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        
        return messageRepository.save(message);
    }
    
    private String callNuruAgent(ChatRequest request) {
        try {
            WebClient webClient = webClientBuilder
                    .baseUrl(NURU_AGENT_URL)
                    .build();
            
            // Prepare request for NuruAgent
            var nuruRequest = new Object() {
                public final String message = request.getMessage();
                public final String user_type = request.getUserType();
                public final String user_id = request.getUserId();
                public final String context = request.getContext() != null ? request.getContext() : "";
            };
            
            log.info("=== SENDING TO NURU AGENT ===");
            log.info("Message: {}", request.getMessage());
            log.info("Context length: {}", nuruRequest.context.length());
            log.info("Context being sent: {}", nuruRequest.context);
            
            if (nuruRequest.context.length() == 0) {
                log.error("ERROR: SENDING EMPTY CONTEXT TO NURU AGENT!");
            }
            
            // Call NuruAgent API
            var response = webClient.post()
                    .uri("/chat")
                    .bodyValue(nuruRequest)
                    .retrieve()
                    .bodyToMono(Object.class)
                    .timeout(java.time.Duration.ofSeconds(30))
                    .block();
            
            // Extract response from the returned object
            if (response instanceof java.util.Map) {
                java.util.Map<String, Object> responseMap = (java.util.Map<String, Object>) response;
                return (String) responseMap.get("response");
            }
            
            return "I'm sorry, I couldn't process your request right now.";
            
        } catch (Exception e) {
            log.error("Error calling NuruAgent: {}", e.getMessage(), e);
            return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
        }
    }
    
    private void updateConversationContext(Conversation conversation, String userMessage, String aiResponse) {
        log.info("=== UPDATING CONVERSATION CONTEXT ===");
        log.info("Conversation ID: {}", conversation.getId());
        
        // Update context with new conversation
        String currentContext = conversation.getContext() != null ? conversation.getContext() : "";
        log.info("Current context length: {}", currentContext.length());
        log.info("Current context: {}", currentContext);
        
        String newContext = currentContext + 
                "\nUser: " + userMessage + 
                "\nAssistant: " + aiResponse;
        
        log.info("New context length: {}", newContext.length());
        log.info("New context: {}", newContext);
        
        // Keep only last 2000 characters to avoid context overflow
        if (newContext.length() > 4000) {
            newContext = newContext.substring(newContext.length() - 4000);
            log.info("Context truncated to 4000 characters");
        }
        
        conversation.setContext(newContext);
        conversation.setLastMessage(aiResponse);
        conversation.setLastMessageTime(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        conversation.setMessageCount(conversation.getMessageCount() + 2); // +2 for user and AI messages
        
        log.info("Saving conversation with context length: {}", conversation.getContext().length());
        Conversation savedConversation = conversationRepository.save(conversation);
        log.info("Conversation saved successfully. Context length in saved object: {}", 
                savedConversation.getContext() != null ? savedConversation.getContext().length() : 0);
    }
    
    private String generateTitleFromMessage(String message) {
        // Generate title from first 50 characters of the message
        String title = message.length() > 50 ? message.substring(0, 50) + "..." : message;
        return title.trim();
    }
    
    public ConversationListResponse getConversations(String userType, String userId) {
        List<Conversation> conversations = conversationRepository
                .findByUserTypeAndUserIdOrderByUpdatedAtDesc(userType, userId);
        
        List<ConversationListResponse.ConversationDto> conversationDtos = conversations.stream()
                .map(conv -> new ConversationListResponse.ConversationDto(
                        conv.getId(),
                        conv.getTitle(),
                        conv.getLastMessage(),
                        conv.getLastMessageTime(),
                        conv.getMessageCount(),
                        conv.getCreatedAt()
                ))
                .collect(Collectors.toList());
        
        return new ConversationListResponse(conversationDtos, conversationDtos.size());
    }
    
    public MessageListResponse getMessages(String conversationId) {
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
        
        List<MessageListResponse.MessageDto> messageDtos = messages.stream()
                .map(msg -> new MessageListResponse.MessageDto(
                        msg.getId(),
                        msg.getSender(),
                        msg.getContent(),
                        msg.getTimestamp(),
                        msg.isTyping()
                ))
                .collect(Collectors.toList());
        
        return new MessageListResponse(messageDtos, messageDtos.size());
    }
    
    public void deleteConversation(String userType, String userId, String conversationId) {
        // Delete all messages first
        messageRepository.deleteByConversationId(conversationId);
        
        // Delete conversation
        conversationRepository.deleteByUserTypeAndUserIdAndId(userType, userId, conversationId);
    }
}
