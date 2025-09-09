package com.example.school.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long taskId;
    private Long schoolId;
    private Long childId;
    private String childName;
    private Integer gameId;
    private List<String> selectedGames;
    private String taskTitle;
    private String taskDescription;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // For grouped tasks
    private List<ChildAssignment> assignedChildren;
    private Integer totalAssigned;
    private Integer completedCount;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildAssignment {
        private Long childId;
        private String childName;
        private String status;
        private LocalDateTime lastUpdated;
    }
}
