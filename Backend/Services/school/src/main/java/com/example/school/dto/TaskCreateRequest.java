package com.example.school.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateRequest {
    private String taskTitle;
    private String taskDescription;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private List<Long> childIds;
    private List<String> selectedGames; // ["Dance Doodle", "Gaze Game", "Gesture Game", "Mirror Posture Game", "Repeat With Me Game"]
}
