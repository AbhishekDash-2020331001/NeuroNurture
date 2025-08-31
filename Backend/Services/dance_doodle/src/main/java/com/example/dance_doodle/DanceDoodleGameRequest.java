package com.example.dance_doodle;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DanceDoodleGameRequest {
    
    private String sessionId;
    private LocalDateTime dateTime;
    private String childId;
    private Integer age;
    
    // Dance pose completion times
    private Integer cool_arms;
    private Integer open_wings;
    private Integer silly_boxer;
    private Integer happy_stand_left;
    private Integer happy_stand_right;
    private Integer crossy_play;
    private Integer shh_fun;
    private Integer stretch_left;
    private Integer stretch_right;
    
    private String videoURL;
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
    private Boolean isASD;
}

