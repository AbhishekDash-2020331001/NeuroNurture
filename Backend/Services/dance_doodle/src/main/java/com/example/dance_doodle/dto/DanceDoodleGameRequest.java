package com.example.dance_doodle.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DanceDoodleGameRequest {
    
    private String sessionId;
    private LocalDateTime dateTime;
    private String childId;
    private Integer age;
    
    // School task tracking
    private String schoolTaskId;
    
    // Tournament tracking
    private Long tournamentId;
    
    // Dance pose completion times
    private Integer cool_arms;
    private Integer open_wings;
    private Integer silly_boxer;
    private Integer happy_stand;
    private Integer crossy_play;
    private Integer shh_fun;
    private Integer stretch;
    
    private String videoURL;
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
    private Boolean isASD;
}

