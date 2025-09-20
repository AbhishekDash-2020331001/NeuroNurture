package com.example.gaze_game.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.gaze_game.dto.GazeGameRequest;
import com.example.gaze_game.entity.GazeGame;
import com.example.gaze_game.repository.GazeGameRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GazeGameService {
    
    @Autowired
    private GazeGameRepository gazeGameRepository;
    
    /**
     * Save a new gaze game session
     */
    public GazeGame saveGazeGame(GazeGameRequest request) {
        try {
            GazeGame gazeGame = new GazeGame();
            
            // Set basic information
            gazeGame.setSessionId(request.getSessionId());
            gazeGame.setChildId(request.getChildId());
            gazeGame.setAge(request.getAge());
            gazeGame.setSchoolTaskId(request.getSchoolTaskId());
            gazeGame.setTournamentId(request.getTournamentId());
            gazeGame.setDateTime(LocalDateTime.now());
            
            // Set round-specific data
            gazeGame.setRound1Count(request.getRound1Count());
            gazeGame.setRound2Count(request.getRound2Count());
            gazeGame.setRound3Count(request.getRound3Count());
            
            // Set consent and medical data
            gazeGame.setIsTrainingAllowed(request.getIsTrainingAllowed());
            gazeGame.setSuspectedASD(request.getSuspectedASD());
            
            GazeGame savedGame = gazeGameRepository.save(gazeGame);
            log.info("Gaze game session saved successfully with ID: {}", savedGame.getId());
            return savedGame;
            
        } catch (Exception e) {
            log.error("Error saving gaze game session: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save gaze game session", e);
        }
    }
    
    /**
     * Get all games for a specific child
     */
    public List<GazeGame> getGamesByChildId(String childId) {
        try {
            List<GazeGame> games = gazeGameRepository.findByChildId(childId);
            log.info("Retrieved {} games for child ID: {}", games.size(), childId);
            return games;
        } catch (Exception e) {
            log.error("Error retrieving games for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve games for child", e);
        }
    }
    
    /**
     * Get paginated games for a specific child
     */
    public Page<GazeGame> getGamesByChildIdPaginated(String childId, Pageable pageable) {
        try {
            Page<GazeGame> games = gazeGameRepository.findByChildIdOrderByDateTimeDesc(childId, pageable);
            log.info("Retrieved {} games for child ID: {} (page {})", games.getContent().size(), childId, pageable.getPageNumber());
            return games;
        } catch (Exception e) {
            log.error("Error retrieving paginated games for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve paginated games for child", e);
        }
    }
    
    /**
     * Get game by ID
     */
    public Optional<GazeGame> getGameById(Long id) {
        try {
            Optional<GazeGame> game = gazeGameRepository.findById(id);
            if (game.isPresent()) {
                log.info("Retrieved game with ID: {}", id);
            } else {
                log.warn("Game with ID {} not found", id);
            }
            return game;
        } catch (Exception e) {
            log.error("Error retrieving game with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve game", e);
        }
    }
    
    /**
     * Get games by session ID
     */
    public List<GazeGame> getGamesBySessionId(String sessionId) {
        try {
            List<GazeGame> games = gazeGameRepository.findBySessionId(sessionId);
            log.info("Retrieved {} games for session ID: {}", games.size(), sessionId);
            return games;
        } catch (Exception e) {
            log.error("Error retrieving games for session ID {}: {}", sessionId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve games for session", e);
        }
    }
    
    /**
     * Get recent games for a child
     */
    public List<GazeGame> getRecentGamesByChildId(String childId) {
        try {
            List<GazeGame> games = gazeGameRepository.getRecentGamesByChildId(childId);
            log.info("Retrieved {} recent games for child ID: {}", games.size(), childId);
            return games;
        } catch (Exception e) {
            log.error("Error retrieving recent games for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve recent games for child", e);
        }
    }
    

    
    /**
     * Get round averages for a child
     */
    public List<Object[]> getRoundAveragesByChild(String childId) {
        try {
            List<Object[]> averages = gazeGameRepository.getRoundAveragesByChild(childId);
            log.info("Retrieved round averages for child ID: {}", childId);
            return averages;
        } catch (Exception e) {
            log.error("Error retrieving round averages for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve round averages", e);
        }
    }
    
    /**
     * Get best performance for a child
     */
    public List<Object[]> getBestPerformanceByChild(String childId) {
        try {
            List<Object[]> performance = gazeGameRepository.getBestPerformanceByChild(childId);
            log.info("Retrieved best performance for child ID: {}", childId);
            return performance;
        } catch (Exception e) {
            log.error("Error retrieving best performance for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve best performance", e);
        }
    }
    
    /**
     * Get training data (where isTrainingAllowed = true)
     */
    public List<GazeGame> getTrainingData() {
        try {
            List<GazeGame> trainingData = gazeGameRepository.getTrainingData();
            log.info("Retrieved {} training data records", trainingData.size());
            return trainingData;
        } catch (Exception e) {
            log.error("Error retrieving training data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve training data", e);
        }
    }
    

    
    /**
     * Get today's games count
     */
    public Long getTodayGamesCount() {
        try {
            Long count = gazeGameRepository.getTodayGamesCount();
            log.info("Today's games count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error retrieving today's games count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve today's games count", e);
        }
    }
    
    /**
     * Get this week's games count
     */
    public Long getThisWeekGamesCount() {
        try {
            Long count = gazeGameRepository.getThisWeekGamesCount();
            log.info("This week's games count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error retrieving this week's games count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve this week's games count", e);
        }
    }
    
    /**
     * Get this month's games count
     */
    public Long getThisMonthGamesCount() {
        try {
            Long count = gazeGameRepository.getThisMonthGamesCount();
            log.info("This month's games count: {}", count);
            return count;
        } catch (Exception e) {
            log.error("Error retrieving this month's games count: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve this month's games count", e);
        }
    }
    
    /**
     * Count games by child ID
     */
    public Long countGamesByChildId(String childId) {
        try {
            Long count = gazeGameRepository.countGamesByChildId(childId);
            log.info("Total games count for child ID {}: {}", childId, count);
            return count;
        } catch (Exception e) {
            log.error("Error counting games for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to count games for child", e);
        }
    }
    
    /**
     * Get statistics for a child
     */
    public Object getChildStatistics(String childId) {
        try {
            List<GazeGame> games = gazeGameRepository.findByChildId(childId);
            
            if (games.isEmpty()) {
                return Map.of(
                    "totalGames", 0,
                    "averageBalloonsPerRound", Map.of("Round 1", 0.0, "Round 2", 0.0, "Round 3", 0.0),
                    "totalBalloonsPopped", 0,
                    "daysSinceLastGame", 0
                );
            }
            
            // Calculate total games
            int totalGames = games.size();
            
            // Calculate total balloons popped
            int totalBalloonsPopped = games.stream()
                .mapToInt(game -> game.getRound1Count() + game.getRound2Count() + game.getRound3Count())
                .sum();
            
            // Calculate average balloons per round
            double avgRound1 = games.stream().mapToInt(GazeGame::getRound1Count).average().orElse(0.0);
            double avgRound2 = games.stream().mapToInt(GazeGame::getRound2Count).average().orElse(0.0);
            double avgRound3 = games.stream().mapToInt(GazeGame::getRound3Count).average().orElse(0.0);
            
            // Calculate days since last game
            GazeGame lastGame = games.stream()
                .max((g1, g2) -> g1.getDateTime().compareTo(g2.getDateTime()))
                .orElse(null);
            
            int daysSinceLastGame = 0;
            if (lastGame != null) {
                daysSinceLastGame = (int) java.time.Duration.between(lastGame.getDateTime(), LocalDateTime.now()).toDays();
            }
            
            Map<String, Object> statistics = Map.of(
                "totalGames", totalGames,
                "averageBalloonsPerRound", Map.of(
                    "Round 1", Math.round(avgRound1 * 100.0) / 100.0,
                    "Round 2", Math.round(avgRound2 * 100.0) / 100.0,
                    "Round 3", Math.round(avgRound3 * 100.0) / 100.0
                ),
                "totalBalloonsPopped", totalBalloonsPopped,
                "daysSinceLastGame", daysSinceLastGame
            );
            
            log.info("Retrieved statistics for child ID {}: {}", childId, statistics);
            return statistics;
            
        } catch (Exception e) {
            log.error("Error retrieving statistics for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve statistics", e);
        }
    }
    
    /**
     * Get performance analysis for a child
     */
    public Object getPerformanceAnalysis(String childId) {
        try {
            List<GazeGame> games = gazeGameRepository.findByChildId(childId);
            
            if (games.isEmpty()) {
                return Map.of(
                    "bestRound", "Round 1",
                    "worstRound", "Round 1",
                    "consistencyScore", 0.0,
                    "improvementTrend", 0.0
                );
            }
            
            // Calculate average balloons per round
            double avgRound1 = games.stream().mapToInt(GazeGame::getRound1Count).average().orElse(0.0);
            double avgRound2 = games.stream().mapToInt(GazeGame::getRound2Count).average().orElse(0.0);
            double avgRound3 = games.stream().mapToInt(GazeGame::getRound3Count).average().orElse(0.0);
            
            // Determine best and worst rounds
            String bestRound = "Round 1";
            String worstRound = "Round 1";
            double bestScore = avgRound1;
            double worstScore = avgRound1;
            
            if (avgRound2 > bestScore) {
                bestRound = "Round 2";
                bestScore = avgRound2;
            }
            if (avgRound3 > bestScore) {
                bestRound = "Round 3";
                bestScore = avgRound3;
            }
            
            if (avgRound2 < worstScore) {
                worstRound = "Round 2";
                worstScore = avgRound2;
            }
            if (avgRound3 < worstScore) {
                worstRound = "Round 3";
                worstScore = avgRound3;
            }
            
            // Calculate consistency score (standard deviation of round averages)
            double mean = (avgRound1 + avgRound2 + avgRound3) / 3.0;
            double variance = Math.pow(avgRound1 - mean, 2) + Math.pow(avgRound2 - mean, 2) + Math.pow(avgRound3 - mean, 2);
            double stdDev = Math.sqrt(variance / 3.0);
            double consistencyScore = Math.max(0, 100 - (stdDev * 10)); // Higher score = more consistent
            
            // Calculate improvement trend (comparing first half vs second half of games)
            int midPoint = games.size() / 2;
            List<GazeGame> firstHalf = games.subList(0, midPoint);
            List<GazeGame> secondHalf = games.subList(midPoint, games.size());
            
            double firstHalfAvg = firstHalf.stream()
                .mapToInt(game -> game.getRound1Count() + game.getRound2Count() + game.getRound3Count())
                .average().orElse(0.0);
            
            double secondHalfAvg = secondHalf.stream()
                .mapToInt(game -> game.getRound1Count() + game.getRound2Count() + game.getRound3Count())
                .average().orElse(0.0);
            
            double improvementTrend = firstHalfAvg > 0 ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100 : 0;
            
            Map<String, Object> analysis = Map.of(
                "bestRound", bestRound,
                "worstRound", worstRound,
                "consistencyScore", Math.round(consistencyScore * 100.0) / 100.0,
                "improvementTrend", Math.round(improvementTrend * 100.0) / 100.0
            );
            
            log.info("Retrieved performance analysis for child ID {}: {}", childId, analysis);
            return analysis;
            
        } catch (Exception e) {
            log.error("Error retrieving performance analysis for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve performance analysis", e);
        }
    }
    
    /**
     * Get performance summary for a child
     */
    public Object getPerformanceSummary(String childId) {
        try {
            List<GazeGame> games = gazeGameRepository.findByChildId(childId);
            
            if (games.isEmpty()) {
                return Map.of(
                    "bestSession", 0,
                    "totalBalloons", 0,
                    "averagePerGame", 0.0
                );
            }
            
            // Calculate total balloons
            int totalBalloons = games.stream()
                .mapToInt(game -> game.getRound1Count() + game.getRound2Count() + game.getRound3Count())
                .sum();
            
            // Calculate average per game
            double averagePerGame = (double) totalBalloons / games.size();
            
            // Find best session (highest total balloons)
            int bestSession = games.stream()
                .mapToInt(game -> game.getRound1Count() + game.getRound2Count() + game.getRound3Count())
                .max()
                .orElse(0);
            
            Map<String, Object> summary = Map.of(
                "bestSession", bestSession,
                "totalBalloons", totalBalloons,
                "averagePerGame", Math.round(averagePerGame * 100.0) / 100.0
            );
            
            log.info("Retrieved performance summary for child ID {}: {}", childId, summary);
            return summary;
            
        } catch (Exception e) {
            log.error("Error retrieving performance summary for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve performance summary", e);
        }
    }
    
    /**
     * Get game history for a child with pagination
     */
    public Page<GazeGame> getGameHistory(String childId, Pageable pageable) {
        try {
            Page<GazeGame> history = gazeGameRepository.findByChildIdOrderByDateTimeDesc(childId, pageable);
            log.info("Retrieved game history for child ID {}: {} records", childId, history.getContent().size());
            return history;
        } catch (Exception e) {
            log.error("Error retrieving game history for child ID {}: {}", childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve game history", e);
        }
    }
    
    /**
     * Get sessions by task ID and child ID
     */
    public List<GazeGame> getSessionsByTaskAndChild(String taskId, String childId) {
        try {
            List<GazeGame> sessions = gazeGameRepository.findBySchoolTaskIdAndChildId(taskId, childId);
            log.info("Retrieved {} sessions for task ID {} and child ID {}", sessions.size(), taskId, childId);
            return sessions;
        } catch (Exception e) {
            log.error("Error retrieving sessions for task ID {} and child ID {}: {}", taskId, childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve sessions", e);
        }
    }
    
    /**
     * Get sessions by tournament ID and child ID
     */
    public List<GazeGame> getSessionsByTournamentAndChild(Long tournamentId, String childId) {
        try {
            List<GazeGame> sessions = gazeGameRepository.findByTournamentIdAndChildId(tournamentId, childId);
            log.info("Retrieved {} sessions for tournament ID {} and child ID {}", sessions.size(), tournamentId, childId);
            return sessions;
        } catch (Exception e) {
            log.error("Error retrieving sessions for tournament ID {} and child ID {}: {}", tournamentId, childId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve sessions", e);
        }
    }
    
    /**
     * Get all sessions by tournament ID
     */
    public List<GazeGame> getSessionsByTournament(Long tournamentId) {
        try {
            List<GazeGame> sessions = gazeGameRepository.findByTournamentId(tournamentId);
            log.info("Retrieved {} sessions for tournament ID {}", sessions.size(), tournamentId);
            return sessions;
        } catch (Exception e) {
            log.error("Error retrieving sessions for tournament ID {}: {}", tournamentId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve sessions", e);
        }
    }
    
    /**
     * Delete all sessions by task ID
     */
    public void deleteSessionsByTaskId(String taskId) {
        try {
            gazeGameRepository.deleteBySchoolTaskId(taskId);
            log.info("Successfully deleted all sessions for task ID: {}", taskId);
        } catch (Exception e) {
            log.error("Error deleting sessions for task ID {}: {}", taskId, e.getMessage(), e);
            throw new RuntimeException("Failed to delete sessions", e);
        }
    }
    
    /**
     * Get latest session for a child (for ALI assessment)
     */
    public GazeGame getLatestSessionForChild(String childId) {
        List<GazeGame> sessions = gazeGameRepository.findByChildIdOrderByDateTimeDesc(childId);
        return sessions.isEmpty() ? null : sessions.get(0);
    }
}
