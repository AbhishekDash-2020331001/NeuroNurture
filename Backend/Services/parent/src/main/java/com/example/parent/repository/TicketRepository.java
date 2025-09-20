package com.example.parent.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.parent.entity.Ticket;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByParentIdOrderByCreatedAtDesc(Long parentId);
    List<Ticket> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    List<Ticket> findByStatusOrderByCreatedAtDesc(String status);
    List<Ticket> findByParentIdAndStatusOrderByCreatedAtDesc(Long parentId, String status);
}
