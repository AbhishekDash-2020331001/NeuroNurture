package com.example.parent.service;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.parent.dto.ChatMessageDto;
import com.example.parent.dto.SendMessageRequest;
import com.example.parent.entity.ChatMessage;
import com.example.parent.repository.ChatMessageRepository;

@Service
public class ChatService {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);
    
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    // Send message from child to doctor
    public ChatMessageDto sendMessageFromChild(SendMessageRequest request) {
        logger.info("=== CHAT SERVICE: SEND MESSAGE FROM CHILD ===");
        logger.info("Child ID: {}, Doctor ID: {}, Message: {}", request.getChildId(), request.getDoctorId(), request.getMessage());
        
        ChatMessage message = new ChatMessage(
            request.getChildId(),
            request.getDoctorId(),
            "child",
            request.getChildId(),
            request.getMessage()
        );
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        logger.info("✅ Message saved with ID: {}", savedMessage.getId());
        
        return convertToDto(savedMessage);
    }
    
    // Send message from doctor to child
    public ChatMessageDto sendMessageFromDoctor(SendMessageRequest request) {
        logger.info("=== CHAT SERVICE: SEND MESSAGE FROM DOCTOR ===");
        logger.info("Child ID: {}, Doctor ID: {}, Message: {}", request.getChildId(), request.getDoctorId(), request.getMessage());
        
        ChatMessage message = new ChatMessage(
            request.getChildId(),
            request.getDoctorId(),
            "doctor",
            request.getDoctorId(),
            request.getMessage()
        );
        
        ChatMessage savedMessage = chatMessageRepository.save(message);
        logger.info("✅ Message saved with ID: {}", savedMessage.getId());
        
        return convertToDto(savedMessage);
    }
    
    // Get chat history between child and doctor
    public List<ChatMessageDto> getChatHistory(Long childId, Long doctorId) {
        logger.info("=== CHAT SERVICE: GET CHAT HISTORY ===");
        logger.info("Child ID: {}, Doctor ID: {}", childId, doctorId);
        
        List<ChatMessage> messages = chatMessageRepository.findByChildIdAndDoctorIdOrderByTimestampAsc(childId, doctorId);
        logger.info("✅ Found {} messages", messages.size());
        
        return messages.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // Mark messages as read
    public void markMessagesAsRead(Long childId, Long doctorId, String readerType) {
        logger.info("=== CHAT SERVICE: MARK MESSAGES AS READ ===");
        logger.info("Child ID: {}, Doctor ID: {}, Reader Type: {}", childId, doctorId, readerType);
        
        String senderType = "child".equals(readerType) ? "doctor" : "child";
        List<ChatMessage> unreadMessages = chatMessageRepository.findByChildIdAndDoctorIdAndSenderTypeAndIsReadFalseOrderByTimestampAsc(childId, doctorId, senderType);
        
        for (ChatMessage message : unreadMessages) {
            message.setRead(true);
            chatMessageRepository.save(message);
        }
        
        logger.info("✅ Marked {} messages as read", unreadMessages.size());
    }
    
    // Get unread message count
    public long getUnreadMessageCount(Long childId, Long doctorId, String userType) {
        logger.info("=== CHAT SERVICE: GET UNREAD MESSAGE COUNT ===");
        logger.info("Child ID: {}, Doctor ID: {}, User Type: {}", childId, doctorId, userType);
        
        String senderType = "child".equals(userType) ? "doctor" : "child";
        long count = chatMessageRepository.countByChildIdAndDoctorIdAndSenderTypeAndIsReadFalse(childId, doctorId, senderType);
        
        logger.info("✅ Unread message count: {}", count);
        return count;
    }
    
    // Convert entity to DTO
    private ChatMessageDto convertToDto(ChatMessage message) {
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(message.getId());
        dto.setChildId(message.getChildId());
        dto.setDoctorId(message.getDoctorId());
        dto.setSenderType(message.getSenderType());
        dto.setSenderId(message.getSenderId());
        dto.setMessage(message.getMessage());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        return dto;
    }
}
