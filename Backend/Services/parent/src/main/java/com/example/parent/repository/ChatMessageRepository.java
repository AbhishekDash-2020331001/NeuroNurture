package com.example.parent.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.parent.entity.ChatMessage;

@Repository
public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    
    // Find all messages between a child and doctor
    List<ChatMessage> findByChildIdAndDoctorIdOrderByTimestampAsc(Long childId, Long doctorId);
    
    // Find unread messages for a specific sender type
    List<ChatMessage> findByChildIdAndDoctorIdAndSenderTypeAndIsReadFalseOrderByTimestampAsc(Long childId, Long doctorId, String senderType);
    
    // Count unread messages for a specific sender type
    long countByChildIdAndDoctorIdAndSenderTypeAndIsReadFalse(Long childId, Long doctorId, String senderType);
}
