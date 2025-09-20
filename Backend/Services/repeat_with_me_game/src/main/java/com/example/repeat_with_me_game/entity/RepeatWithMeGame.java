package com.example.repeat_with_me_game.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "repeat_with_me_game")
@Data
public class RepeatWithMeGame {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String sessionId;
    
    @Column(nullable = false)
    private LocalDateTime dateTime;
    
    @Column(nullable = false)
    private String childId;
    
    @Column(nullable = false)
    private Integer age;
    
    // School task tracking
    @Column
    private String schoolTaskId;
    
    // Tournament tracking
    @Column
    private Long tournamentId;
    
    // Round scores (similarity scores for each round) - Support all 12 rounds
    @Column
    private Double round1Score;
    @Column
    private Double round2Score;
    @Column
    private Double round3Score;
    @Column
    private Double round4Score;
    @Column
    private Double round5Score;
    @Column
    private Double round6Score;
    @Column
    private Double round7Score;
    @Column
    private Double round8Score;
    @Column
    private Double round9Score;
    @Column
    private Double round10Score;
    @Column
    private Double round11Score;
    @Column
    private Double round12Score;
    
    // Target and transcribed text for each round - Support all 12 rounds
    @Column(length = 1000)
    private String round1TargetText;
    @Column(length = 1000)
    private String round1TranscribedText;
    
    @Column(length = 1000)
    private String round2TargetText;
    @Column(length = 1000)
    private String round2TranscribedText;
    
    @Column(length = 1000)
    private String round3TargetText;
    @Column(length = 1000)
    private String round3TranscribedText;
    
    @Column(length = 1000)
    private String round4TargetText;
    @Column(length = 1000)
    private String round4TranscribedText;
    
    @Column(length = 1000)
    private String round5TargetText;
    @Column(length = 1000)
    private String round5TranscribedText;
    
    @Column(length = 1000)
    private String round6TargetText;
    @Column(length = 1000)
    private String round6TranscribedText;
    
    @Column(length = 1000)
    private String round7TargetText;
    @Column(length = 1000)
    private String round7TranscribedText;
    
    @Column(length = 1000)
    private String round8TargetText;
    @Column(length = 1000)
    private String round8TranscribedText;
    
    @Column(length = 1000)
    private String round9TargetText;
    @Column(length = 1000)
    private String round9TranscribedText;
    
    @Column(length = 1000)
    private String round10TargetText;
    @Column(length = 1000)
    private String round10TranscribedText;
    
    @Column(length = 1000)
    private String round11TargetText;
    @Column(length = 1000)
    private String round11TranscribedText;
    
    @Column(length = 1000)
    private String round12TargetText;
    @Column(length = 1000)
    private String round12TranscribedText;
    
    // Average score for the session
    private Double averageScore;
    
    // Total completed rounds
    private Integer completedRounds;
    
    @Column(nullable = false)
    private Boolean isTrainingAllowed;
    
    @Column(nullable = false)
    private Boolean suspectedASD;
    
    private Boolean isASD; // Will be populated by ML model later
    
    @PrePersist
    protected void onCreate() {
        if (dateTime == null) {
            dateTime = LocalDateTime.now();
        }
    }
}
