package com.example.school.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.school.dto.TaskResponse.ChildAssignment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentResponse {
    private Long tournamentId;
    private Long schoolId;
    private Long childId; // Optional for grouped tournaments
    private String childName; // Optional for grouped tournaments
    private Integer gameId;
    private List<String> selectedGames;
    private String tournamentTitle;
    private String tournamentDescription;
    private String gradeLevel;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // For grouped tournaments
    private List<ChildAssignment> assignedChildren;
    private Integer totalAssigned;
    private Integer completedCount;
}

