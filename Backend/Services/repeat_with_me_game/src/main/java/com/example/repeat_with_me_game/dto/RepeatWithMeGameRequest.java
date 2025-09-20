package com.example.repeat_with_me_game.dto;

import lombok.Data;

@Data
public class RepeatWithMeGameRequest {
    private String sessionId;
    private String childId;
    private Integer age;
    
    // School task tracking
    private String schoolTaskId;
    
    // Tournament tracking
    private Long tournamentId;
    
    // Round scores - Support all 12 rounds
    private Double round1Score;
    private Double round2Score;
    private Double round3Score;
    private Double round4Score;
    private Double round5Score;
    private Double round6Score;
    private Double round7Score;
    private Double round8Score;
    private Double round9Score;
    private Double round10Score;
    private Double round11Score;
    private Double round12Score;
    
    // Target and transcribed text for each round - Support all 12 rounds
    private String round1TargetText;
    private String round1TranscribedText;
    private String round2TargetText;
    private String round2TranscribedText;
    private String round3TargetText;
    private String round3TranscribedText;
    private String round4TargetText;
    private String round4TranscribedText;
    private String round5TargetText;
    private String round5TranscribedText;
    private String round6TargetText;
    private String round6TranscribedText;
    private String round7TargetText;
    private String round7TranscribedText;
    private String round8TargetText;
    private String round8TranscribedText;
    private String round9TargetText;
    private String round9TranscribedText;
    private String round10TargetText;
    private String round10TranscribedText;
    private String round11TargetText;
    private String round11TranscribedText;
    private String round12TargetText;
    private String round12TranscribedText;
    
    private Double averageScore;
    private Integer completedRounds;
    private Boolean isTrainingAllowed;
    private Boolean suspectedASD;
}
