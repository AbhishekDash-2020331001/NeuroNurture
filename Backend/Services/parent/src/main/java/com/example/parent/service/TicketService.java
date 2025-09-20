package com.example.parent.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.parent.entity.Ticket;
import com.example.parent.repository.TicketRepository;

@Service
public class TicketService {
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String ADMIN_SERVICE_URL = "http://localhost:8090";
    
    public List<Ticket> getTicketsByParentId(Long parentId) {
        return ticketRepository.findByParentIdOrderByCreatedAtDesc(parentId);
    }
    
    public Optional<Ticket> getTicketById(String ticketId) {
        return ticketRepository.findById(ticketId);
    }
    
    public Ticket createTicket(Long parentId, String subject, String description, String priority) {
        Ticket ticket = new Ticket();
        ticket.setId(UUID.randomUUID().toString());
        ticket.setParentId(parentId);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setPriority(priority);
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(LocalDateTime.now());
        ticket.setUpdatedAt(LocalDateTime.now());
        ticket.setMessages(new ArrayList<>());
        
        // Assign random admin
        Long adminId = getRandomAdminId();
        ticket.setAdminId(adminId);
        
        return ticketRepository.save(ticket);
    }
    
    public Ticket addMessage(String ticketId, Long senderId, String senderType, String content) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            
            Ticket.Message message = new Ticket.Message();
            message.setId(UUID.randomUUID().toString());
            message.setSenderId(senderId);
            message.setSenderType(senderType);
            message.setContent(content);
            message.setTimestamp(LocalDateTime.now());
            message.setRead(false);
            
            if (ticket.getMessages() == null) {
                ticket.setMessages(new ArrayList<>());
            }
            ticket.getMessages().add(message);
            ticket.setUpdatedAt(LocalDateTime.now());
            
            return ticketRepository.save(ticket);
        }
        return null;
    }
    
    public Ticket updateTicketStatus(String ticketId, String status) {
        Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
        if (ticketOpt.isPresent()) {
            Ticket ticket = ticketOpt.get();
            ticket.setStatus(status);
            ticket.setUpdatedAt(LocalDateTime.now());
            
            if ("RESOLVED".equals(status) || "CLOSED".equals(status)) {
                ticket.setResolvedAt(LocalDateTime.now());
            }
            
            return ticketRepository.save(ticket);
        }
        return null;
    }
    
    public List<Ticket> getTicketsByStatus(String status) {
        return ticketRepository.findByStatusOrderByCreatedAtDesc(status);
    }
    
    public List<Ticket> getTicketsByAdminId(Long adminId) {
        return ticketRepository.findByAdminIdOrderByCreatedAtDesc(adminId);
    }
    
    private Long getRandomAdminId() {
        try {
            // Get all admin users from admin service
            String url = ADMIN_SERVICE_URL + "/api/admin/auth/all";
            AdminUser[] admins = restTemplate.getForObject(url, AdminUser[].class);
            
            if (admins != null && admins.length > 0) {
                // Select random admin
                int randomIndex = (int) (Math.random() * admins.length);
                return admins[randomIndex].getId();
            }
        } catch (Exception e) {
            System.err.println("Error fetching admins: " + e.getMessage());
        }
        
        // Fallback: return null if no admins found
        return null;
    }
    
    // Inner class for admin user data
    public static class AdminUser {
        private Long id;
        private String username;
        private String email;
        private String role;
        
        // Getters and setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}
