package com.example.mirror_posture_game.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class MirrorPostureGameRequest {
    
    private String sessionId;
    private LocalDateTime dateTime;
    private String childId;
    private Integer age;
    
    // School task tracking
    private String schoolTaskId;
    
    // Tournament tracking
    private Long tournamentId;
    
    // Posture completion times
    private Integer lookingSideways;
    private Integer mouthOpen;
    private Integer showingTeeth;
    private Integer kiss;
    
    private String videoURL;
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
    private Boolean isASD;
} 