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
@Table(name = "school_task")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id; // Auto-incrementing primary key
    
    @Column(name = "task_id", nullable = false)
    private Long taskId; // Same task_id for multiple children
    
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
    
    @Column(name = "task_title")
    private String taskTitle;
    
    @Column(name = "task_description")
    private String taskDescription;
    
    @Column(name = "status")
    private String status = "ASSIGNED"; // ASSIGNED, IN_PROGRESS, COMPLETED, OVERDUE
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
