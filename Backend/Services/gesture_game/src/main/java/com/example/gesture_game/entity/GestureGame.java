package com.example.gesture_game.entity;

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
@Table(name = "gesture_game")
@Data
public class GestureGame {
    
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
