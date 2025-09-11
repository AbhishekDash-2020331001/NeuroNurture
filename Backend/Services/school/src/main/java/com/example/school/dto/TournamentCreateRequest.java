package com.example.school.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TournamentCreateRequest {
    private String tournamentTitle;
    private String tournamentDescription;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String gradeLevel; // Gentle Bloom, Rising Star, Bright Light
    private List<String> selectedGames; // ["Dance Doodle", "Gaze Game", "Gesture Game", "Mirror Posture Game", "Repeat With Me Game"]
}

