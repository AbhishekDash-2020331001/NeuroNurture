package com.example.repeat_with_me_game.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.repeat_with_me_game.dto.RepeatWithMeGameRequest;
import com.example.repeat_with_me_game.entity.RepeatWithMeGame;
import com.example.repeat_with_me_game.repository.RepeatWithMeGameRepository;

@Service
public class RepeatWithMeGameService {
    
    @Autowired
    private RepeatWithMeGameRepository repository;
    
    public RepeatWithMeGame saveGameRecord(RepeatWithMeGameRequest request) {
        RepeatWithMeGame gameRecord = new RepeatWithMeGame();
        
        gameRecord.setSessionId(request.getSessionId());
        gameRecord.setChildId(request.getChildId());
        gameRecord.setAge(request.getAge());
        gameRecord.setSchoolTaskId(request.getSchoolTaskId());
        gameRecord.setTournamentId(request.getTournamentId());
        
        // Set all 12 round scores
        gameRecord.setRound1Score(request.getRound1Score());
        gameRecord.setRound2Score(request.getRound2Score());
        gameRecord.setRound3Score(request.getRound3Score());
        gameRecord.setRound4Score(request.getRound4Score());
        gameRecord.setRound5Score(request.getRound5Score());
        gameRecord.setRound6Score(request.getRound6Score());
        gameRecord.setRound7Score(request.getRound7Score());
        gameRecord.setRound8Score(request.getRound8Score());
        gameRecord.setRound9Score(request.getRound9Score());
        gameRecord.setRound10Score(request.getRound10Score());
        gameRecord.setRound11Score(request.getRound11Score());
        gameRecord.setRound12Score(request.getRound12Score());
        
        // Set all 12 round target texts
        gameRecord.setRound1TargetText(request.getRound1TargetText());
        gameRecord.setRound1TranscribedText(request.getRound1TranscribedText());
        gameRecord.setRound2TargetText(request.getRound2TargetText());
        gameRecord.setRound2TranscribedText(request.getRound2TranscribedText());
        gameRecord.setRound3TargetText(request.getRound3TargetText());
        gameRecord.setRound3TranscribedText(request.getRound3TranscribedText());
        gameRecord.setRound4TargetText(request.getRound4TargetText());
        gameRecord.setRound4TranscribedText(request.getRound4TranscribedText());
        gameRecord.setRound5TargetText(request.getRound5TargetText());
        gameRecord.setRound5TranscribedText(request.getRound5TranscribedText());
        gameRecord.setRound6TargetText(request.getRound6TargetText());
        gameRecord.setRound6TranscribedText(request.getRound6TranscribedText());
        gameRecord.setRound7TargetText(request.getRound7TargetText());
        gameRecord.setRound7TranscribedText(request.getRound7TranscribedText());
        gameRecord.setRound8TargetText(request.getRound8TargetText());
        gameRecord.setRound8TranscribedText(request.getRound8TranscribedText());
        gameRecord.setRound9TargetText(request.getRound9TargetText());
        gameRecord.setRound9TranscribedText(request.getRound9TranscribedText());
        gameRecord.setRound10TargetText(request.getRound10TargetText());
        gameRecord.setRound10TranscribedText(request.getRound10TranscribedText());
        gameRecord.setRound11TargetText(request.getRound11TargetText());
        gameRecord.setRound11TranscribedText(request.getRound11TranscribedText());
        gameRecord.setRound12TargetText(request.getRound12TargetText());
        gameRecord.setRound12TranscribedText(request.getRound12TranscribedText());
        
        gameRecord.setAverageScore(request.getAverageScore());
        gameRecord.setCompletedRounds(request.getCompletedRounds());
        gameRecord.setIsTrainingAllowed(request.getIsTrainingAllowed());
        gameRecord.setSuspectedASD(request.getSuspectedASD());
        
        return repository.save(gameRecord);
    }
    
    public List<RepeatWithMeGame> getAllRecords() {
        return repository.findAll();
    }
    
    public Optional<RepeatWithMeGame> getRecordById(Long id) {
        return repository.findById(id);
    }
    
    public List<RepeatWithMeGame> getRecordsBySessionId(String sessionId) {
        return repository.findBySessionId(sessionId);
    }
    
    public List<RepeatWithMeGame> getRecordsByChildId(String childId) {
        return repository.findByChildId(childId);
    }
    
    // Get sessions by task ID and child ID
    public List<RepeatWithMeGame> getSessionsByTaskAndChild(String taskId, String childId) {
        return repository.findBySchoolTaskIdAndChildId(taskId, childId);
    }
    
    // Get sessions by tournament ID and child ID
    public List<RepeatWithMeGame> getSessionsByTournamentAndChild(Long tournamentId, String childId) {
        return repository.findByTournamentIdAndChildId(tournamentId, childId);
    }
    
    // Get all sessions by tournament ID
    public List<RepeatWithMeGame> getSessionsByTournament(Long tournamentId) {
        return repository.findByTournamentId(tournamentId);
    }
    
    // Delete all sessions by task ID
    public void deleteSessionsByTaskId(String taskId) {
        repository.deleteBySchoolTaskId(taskId);
    }
    
    public List<RepeatWithMeGame> getTrainingData() {
        return repository.findByIsTrainingAllowedTrue();
    }
    
    public List<RepeatWithMeGame> getRecordsBySuspectedASD(Boolean suspectedASD) {
        return repository.findBySuspectedASD(suspectedASD);
    }
    
    public List<RepeatWithMeGame> getGameHistoryByChildId(String childId) {
        return repository.findByChildIdOrderByDateTimeDesc(childId);
    }
    
    public Page<RepeatWithMeGame> getPaginatedGameHistoryByChildId(String childId, Pageable pageable) {
        return repository.findByChildIdOrderByDateTimeDesc(childId, pageable);
    }
    
    public Map<String, Object> getChildStatistics(String childId) {
        Map<String, Object> statistics = new HashMap<>();
        
        Long totalGames = repository.countByChildId(childId);
        Double averageScore = repository.getAverageScoreByChildId(childId);
        Double bestScore = repository.getBestScoreByChildId(childId);
        Double worstScore = repository.getWorstScoreByChildId(childId);
        
        // Round-specific statistics for all 12 rounds
        Map<String, Double> averageScores = new HashMap<>();
        averageScores.put("Round 1", repository.getAverageRound1Score(childId));
        averageScores.put("Round 2", repository.getAverageRound2Score(childId));
        averageScores.put("Round 3", repository.getAverageRound3Score(childId));
        averageScores.put("Round 4", repository.getAverageRound4Score(childId));
        averageScores.put("Round 5", repository.getAverageRound5Score(childId));
        averageScores.put("Round 6", repository.getAverageRound6Score(childId));
        averageScores.put("Round 7", repository.getAverageRound7Score(childId));
        averageScores.put("Round 8", repository.getAverageRound8Score(childId));
        averageScores.put("Round 9", repository.getAverageRound9Score(childId));
        averageScores.put("Round 10", repository.getAverageRound10Score(childId));
        averageScores.put("Round 11", repository.getAverageRound11Score(childId));
        averageScores.put("Round 12", repository.getAverageRound12Score(childId));
        
        Map<String, Long> roundCompletionCounts = new HashMap<>();
        roundCompletionCounts.put("Round 1", repository.getRound1CompletionCount(childId));
        roundCompletionCounts.put("Round 2", repository.getRound2CompletionCount(childId));
        roundCompletionCounts.put("Round 3", repository.getRound3CompletionCount(childId));
        roundCompletionCounts.put("Round 4", repository.getRound4CompletionCount(childId));
        roundCompletionCounts.put("Round 5", repository.getRound5CompletionCount(childId));
        roundCompletionCounts.put("Round 6", repository.getRound6CompletionCount(childId));
        roundCompletionCounts.put("Round 7", repository.getRound7CompletionCount(childId));
        roundCompletionCounts.put("Round 8", repository.getRound8CompletionCount(childId));
        roundCompletionCounts.put("Round 9", repository.getRound9CompletionCount(childId));
        roundCompletionCounts.put("Round 10", repository.getRound10CompletionCount(childId));
        roundCompletionCounts.put("Round 11", repository.getRound11CompletionCount(childId));
        roundCompletionCounts.put("Round 12", repository.getRound12CompletionCount(childId));
        
        // Calculate days since last game
        List<RepeatWithMeGame> recentGames = repository.findRecentGamesByChildId(childId, Pageable.ofSize(1));
        Long daysSinceLastGame = null;
        if (!recentGames.isEmpty()) {
            daysSinceLastGame = ChronoUnit.DAYS.between(recentGames.get(0).getDateTime(), LocalDateTime.now());
        }
        
        statistics.put("totalGames", totalGames);
        statistics.put("averageScore", averageScore);
        statistics.put("bestScore", bestScore);
        statistics.put("worstScore", worstScore);
        statistics.put("averageScores", averageScores);
        statistics.put("roundCompletionCounts", roundCompletionCounts);
        statistics.put("daysSinceLastGame", daysSinceLastGame);
        
        return statistics;
    }
    
    public Map<String, Object> getPerformanceAnalysis(String childId) {
        Map<String, Object> analysis = new HashMap<>();
        
        List<RepeatWithMeGame> games = repository.findByChildIdOrderByDateTimeDesc(childId);
        
        if (games.isEmpty()) {
            return analysis;
        }
        
        // Calculate improvement trends
        Map<String, Object> trends = new HashMap<>();
        if (games.size() >= 2) {
            Double firstGameScore = games.get(games.size() - 1).getAverageScore();
            Double lastGameScore = games.get(0).getAverageScore();
            Double improvement = lastGameScore - firstGameScore;
            Double improvementPercentage = (improvement / firstGameScore) * 100;
            
            trends.put("overallImprovement", improvement);
            trends.put("improvementPercentage", improvementPercentage);
            trends.put("isImproving", improvement > 0);
        }
        
        // Find best and worst rounds for all 12 rounds
        Map<String, Double> roundAverages = new HashMap<>();
        roundAverages.put("Round 1", repository.getAverageRound1Score(childId));
        roundAverages.put("Round 2", repository.getAverageRound2Score(childId));
        roundAverages.put("Round 3", repository.getAverageRound3Score(childId));
        roundAverages.put("Round 4", repository.getAverageRound4Score(childId));
        roundAverages.put("Round 5", repository.getAverageRound5Score(childId));
        roundAverages.put("Round 6", repository.getAverageRound6Score(childId));
        roundAverages.put("Round 7", repository.getAverageRound7Score(childId));
        roundAverages.put("Round 8", repository.getAverageRound8Score(childId));
        roundAverages.put("Round 9", repository.getAverageRound9Score(childId));
        roundAverages.put("Round 10", repository.getAverageRound10Score(childId));
        roundAverages.put("Round 11", repository.getAverageRound11Score(childId));
        roundAverages.put("Round 12", repository.getAverageRound12Score(childId));
        
        String bestRound = roundAverages.entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
        
        String worstRound = roundAverages.entrySet().stream()
                .filter(entry -> entry.getValue() != null)
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("None");
        
        analysis.put("trends", trends);
        analysis.put("roundAverages", roundAverages);
        analysis.put("bestRound", bestRound);
        analysis.put("worstRound", worstRound);
        
        return analysis;
    }
    
    public Map<String, Object> getImprovementTrends(String childId) {
        Map<String, Object> trends = new HashMap<>();
        
        List<RepeatWithMeGame> games = repository.findByChildIdOrderByDateTimeDesc(childId);
        
        if (games.size() < 2) {
            trends.put("hasEnoughData", false);
            return trends;
        }
        
        trends.put("hasEnoughData", true);
        
        // Calculate trend over last 5 games
        int gamesToAnalyze = Math.min(5, games.size());
        List<RepeatWithMeGame> recentGames = games.subList(0, gamesToAnalyze);
        
        double[] scores = recentGames.stream()
                .mapToDouble(game -> game.getAverageScore() != null ? game.getAverageScore() : 0)
                .toArray();
        
        // Simple linear regression for trend
        double sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        for (int i = 0; i < scores.length; i++) {
            sumX += i;
            sumY += scores[i];
            sumXY += i * scores[i];
            sumX2 += i * i;
        }
        
        double n = scores.length;
        double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        trends.put("trendSlope", slope);
        trends.put("isImproving", slope > 0);
        trends.put("recentScores", scores);
        trends.put("gamesAnalyzed", gamesToAnalyze);
        
        return trends;
    }
    
    public Map<String, Object> getPerformanceSummary(String childId) {
        Map<String, Object> summary = new HashMap<>();
        
        Double averageScore = repository.getAverageScoreByChildId(childId);
        Double bestScore = repository.getBestScoreByChildId(childId);
        Double worstScore = repository.getWorstScoreByChildId(childId);
        Long totalGames = repository.countByChildId(childId);
        
        summary.put("averageScore", averageScore);
        summary.put("bestScore", bestScore);
        summary.put("worstScore", worstScore);
        summary.put("totalGames", totalGames);
        
        // Performance level assessment
        String performanceLevel = "Beginner";
        if (averageScore != null) {
            if (averageScore >= 90) {
                performanceLevel = "Expert";
            } else if (averageScore >= 80) {
                performanceLevel = "Advanced";
            } else if (averageScore >= 70) {
                performanceLevel = "Intermediate";
            } else if (averageScore >= 60) {
                performanceLevel = "Beginner";
            } else {
                performanceLevel = "Novice";
            }
        }
        
        summary.put("performanceLevel", performanceLevel);
        
        return summary;
    }
    
    public RepeatWithMeGame updateASDPrediction(Long id, Boolean asd) {
        Optional<RepeatWithMeGame> record = repository.findById(id);
        if (record.isPresent()) {
            RepeatWithMeGame gameRecord = record.get();
            gameRecord.setIsASD(asd);
            return repository.save(gameRecord);
        }
        return null;
    }
    
    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
    
    /**
     * Get latest session for a child (for ALI assessment)
     */
    public RepeatWithMeGame getLatestSessionForChild(String childId) {
        List<RepeatWithMeGame> sessions = repository.findByChildIdOrderByDateTimeDesc(childId);
        return sessions.isEmpty() ? null : sessions.get(0);
    }
}
