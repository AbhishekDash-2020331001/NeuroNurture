package com.example.gaze_game.dto;

import lombok.Data;

@Data
public class GazeGameRequest {
    
    private String sessionId;
    private String childId;
    private Integer age;
    
    // School task tracking
    private String schoolTaskId;
    
    // Tournament tracking
    private Long tournamentId;
    
    // Round-specific data
    private Integer round1Count;
    private Integer round2Count;
    private Integer round3Count;
    
    // Consent and medical data
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
}
