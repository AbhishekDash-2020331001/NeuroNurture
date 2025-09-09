package com.example.school.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskPerformanceDto {
    private String childId;
    private String childName;
    private String grade;
    private String parentName;
    private List<GamePerformanceDto> games;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GamePerformanceDto {
        private String gameId;
        private String gameName;
        private boolean completed;
        private Double bestScore;
        private Integer playCount;
        private String lastPlayed;
        private List<ScoreHistoryDto> scoreHistory;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreHistoryDto {
        private Double score;
        private String date;
        private String time;
    }
}
