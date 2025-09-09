package com.example.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChildGameStatsDto {
    private int totalGameSessions;
    private int uniqueTasksParticipated;
    private String lastActiveDate;
}
