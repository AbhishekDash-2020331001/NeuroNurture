package com.example.gesture_game.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class GestureGameRequest {
    
    private String sessionId;
    private LocalDateTime dateTime;
    private String childId;
    private Integer age;
    
    // School task tracking
    private String schoolTaskId;
    
    // Tournament tracking
    private Long tournamentId;
    
    // Gesture completion times
    private Integer thumbs_up;
    private Integer thumbs_down;
    private Integer victory;
    private Integer butterfly;
    private Integer spectacle;
    private Integer heart;
    private Integer pointing_up;
    private Integer iloveyou;
    private Integer dua;
    private Integer closed_fist;
    private Integer open_palm;
    
    private String videoURL;
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
    private Boolean isASD;
}
