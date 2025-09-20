package com.example.nuru_chat.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.nuru_chat.entity.Message;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
    void deleteByConversationId(String conversationId);
    long countByConversationId(String conversationId);
}
