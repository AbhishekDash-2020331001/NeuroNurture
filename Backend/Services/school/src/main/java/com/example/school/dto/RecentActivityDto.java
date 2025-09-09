package com.example.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDto {
    private String gameName;
    private String sessionId;
    private String timestamp;
    private String score;
    private String status; // "completed", "in_progress", "failed"
    private String gameServiceUrl;
}
