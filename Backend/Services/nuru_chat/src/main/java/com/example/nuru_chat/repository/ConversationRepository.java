package com.example.nuru_chat.repository;

import com.example.nuru_chat.model.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    List<Conversation> findByUserTypeAndUserIdOrderByUpdatedAtDesc(String userType, String userId);
    Optional<Conversation> findByUserTypeAndUserIdAndId(String userType, String userId, String id);
    void deleteByUserTypeAndUserIdAndId(String userType, String userId, String id);
}
