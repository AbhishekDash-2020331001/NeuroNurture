package com.example.parent.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.parent.entity.Ticket;
import com.example.parent.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:8081")
public class TicketController {
    
    @Autowired
    private TicketService ticketService;
    
    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Ticket>> getTicketsByParentId(@PathVariable Long parentId) {
        List<Ticket> tickets = ticketService.getTicketsByParentId(parentId);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/admin/{adminId}")
    public ResponseEntity<List<Ticket>> getTicketsByAdminId(@PathVariable Long adminId) {
        List<Ticket> tickets = ticketService.getTicketsByAdminId(adminId);
        return ResponseEntity.ok(tickets);
    }
    
    @GetMapping("/{ticketId}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String ticketId) {
        Optional<Ticket> ticket = ticketService.getTicketById(ticketId);
        return ticket.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody CreateTicketRequest request) {
        Ticket ticket = ticketService.createTicket(
            request.getParentId(),
            request.getSubject(),
            request.getDescription(),
            request.getPriority()
        );
        return ResponseEntity.ok(ticket);
    }
    
    @PostMapping("/{ticketId}/messages")
    public ResponseEntity<Ticket> addMessage(@PathVariable String ticketId, @RequestBody AddMessageRequest request) {
        Ticket ticket = ticketService.addMessage(
            ticketId,
            request.getSenderId(),
            request.getSenderType(),
            request.getContent()
        );
        return ticket != null ? ResponseEntity.ok(ticket) : ResponseEntity.notFound().build();
    }
    
    @PutMapping("/{ticketId}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable String ticketId, @RequestBody UpdateStatusRequest request) {
        Ticket ticket = ticketService.updateTicketStatus(ticketId, request.getStatus());
        return ticket != null ? ResponseEntity.ok(ticket) : ResponseEntity.notFound().build();
    }
    
    // DTOs for request bodies
    public static class CreateTicketRequest {
        private Long parentId;
        private String subject;
        private String description;
        private String priority;
        
        // Getters and setters
        public Long getParentId() { return parentId; }
        public void setParentId(Long parentId) { this.parentId = parentId; }
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
    }
    
    public static class AddMessageRequest {
        private Long senderId;
        private String senderType;
        private String content;
        
        // Getters and setters
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderType() { return senderType; }
        public void setSenderType(String senderType) { this.senderType = senderType; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
    
    public static class UpdateStatusRequest {
        private String status;
        
        // Getters and setters
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}
