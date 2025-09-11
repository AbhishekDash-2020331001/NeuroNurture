package com.example.school.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "school_tournament")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolTournament {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // Auto-incrementing primary key
    
    @Column(name = "tournament_id", nullable = false)
    private Long tournamentId; // Same tournament_id for multiple children
    
    @Column(name = "school_id", nullable = false)
    private Long schoolId;
    
    @Column(name = "child_id", nullable = false)
    private Long childId;
    
    @Column(name = "game_id", nullable = false)
    private Integer gameId; // Bit-mapped game selection
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(name = "tournament_title")
    private String tournamentTitle;
    
    @Column(name = "tournament_description")
    private String tournamentDescription;
    
    @Column(name = "grade_level")
    private String gradeLevel; // Gentle Bloom, Rising Star, Bright Light
    
    @Column(name = "status")
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
