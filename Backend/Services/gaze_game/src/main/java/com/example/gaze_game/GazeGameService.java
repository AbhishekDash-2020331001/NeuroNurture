package com.example.gaze_game;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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
}
