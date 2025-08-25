package com.example.gaze_game;

import lombok.Data;

@Data
public class GazeGameRequest {
    
    private String sessionId;
    private String childId;
    private Integer age;
    
    // Round-specific data
    private Integer round1Count;
    private Integer round2Count;
    private Integer round3Count;
    
    // Consent and medical data
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
}
