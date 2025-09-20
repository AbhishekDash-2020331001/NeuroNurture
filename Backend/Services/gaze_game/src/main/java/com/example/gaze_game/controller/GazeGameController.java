package com.example.gaze_game.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gaze_game.dto.GazeGameRequest;
import com.example.gaze_game.entity.GazeGame;
import com.example.gaze_game.service.GazeGameService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/gaze-game")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001", "http://localhost:8090", "http://localhost:5173"})
@Slf4j
public class GazeGameController {
    
    @Autowired
    private GazeGameService gazeGameService;
    
    /**
     * Save a new gaze game session
     */
    @PostMapping("/save")
    public ResponseEntity<?> saveGazeGame(@RequestBody GazeGameRequest request) {
        try {
            log.info("Received request to save gaze game session for child ID: {}", request.getChildId());
            
            // Validate required fields
            if (request.getChildId() == null || request.getChildId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Child ID is required");
            }
            
            if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Session ID is required");
            }
            

            
            GazeGame savedGame = gazeGameService.saveGazeGame(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedGame);
            
        } catch (Exception e) {
            log.error("Error saving gaze game session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save gaze game session: " + e.getMessage());
        }
    }
    
    /**
     * Get all games for a specific child
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<?> getGamesByChildId(@PathVariable String childId) {
        try {
            log.info("Retrieving games for child ID: {}", childId);
            List<GazeGame> games = gazeGameService.getGamesByChildId(childId);
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            log.error("Error retrieving games for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve games for child: " + e.getMessage());
        }
    }
    
    /**
     * Get paginated games for a specific child
     */
    @GetMapping("/child/{childId}/paginated")
    public ResponseEntity<?> getGamesByChildIdPaginated(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("Retrieving paginated games for child ID: {} (page: {}, size: {})", childId, page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<GazeGame> games = gazeGameService.getGamesByChildIdPaginated(childId, pageable);
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            log.error("Error retrieving paginated games for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve paginated games for child: " + e.getMessage());
        }
    }
    
    /**
     * Get game by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getGameById(@PathVariable Long id) {
        try {
            log.info("Retrieving game with ID: {}", id);
            Optional<GazeGame> game = gazeGameService.getGameById(id);
            if (game.isPresent()) {
                return ResponseEntity.ok(game.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving game with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve game: " + e.getMessage());
        }
    }
    
    /**
     * Get games by session ID
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getGamesBySessionId(@PathVariable String sessionId) {
        try {
            log.info("Retrieving games for session ID: {}", sessionId);
            List<GazeGame> games = gazeGameService.getGamesBySessionId(sessionId);
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            log.error("Error retrieving games for session ID {}: {}", sessionId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve games for session: " + e.getMessage());
        }
    }
    
    /**
     * Get recent games for a child
     */
    @GetMapping("/child/{childId}/recent")
    public ResponseEntity<?> getRecentGamesByChildId(@PathVariable String childId) {
        try {
            log.info("Retrieving recent games for child ID: {}", childId);
            List<GazeGame> games = gazeGameService.getRecentGamesByChildId(childId);
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            log.error("Error retrieving recent games for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve recent games for child: " + e.getMessage());
        }
    }
    

    
    /**
     * Get round averages for a child
     */
    @GetMapping("/child/{childId}/round-averages")
    public ResponseEntity<?> getRoundAveragesByChild(@PathVariable String childId) {
        try {
            log.info("Retrieving round averages for child ID: {}", childId);
            List<Object[]> averages = gazeGameService.getRoundAveragesByChild(childId);
            return ResponseEntity.ok(averages);
        } catch (Exception e) {
            log.error("Error retrieving round averages for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve round averages: " + e.getMessage());
        }
    }
    
    /**
     * Get best performance for a child
     */
    @GetMapping("/child/{childId}/best-performance")
    public ResponseEntity<?> getBestPerformanceByChild(@PathVariable String childId) {
        try {
            log.info("Retrieving best performance for child ID: {}", childId);
            List<Object[]> performance = gazeGameService.getBestPerformanceByChild(childId);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            log.error("Error retrieving best performance for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve best performance: " + e.getMessage());
        }
    }
    
    /**
     * Get training data
     */
    @GetMapping("/training-data")
    public ResponseEntity<?> getTrainingData() {
        try {
            log.info("Retrieving training data");
            List<GazeGame> trainingData = gazeGameService.getTrainingData();
            return ResponseEntity.ok(trainingData);
        } catch (Exception e) {
            log.error("Error retrieving training data: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve training data: " + e.getMessage());
        }
    }
    

    
    /**
     * Get today's games count
     */
    @GetMapping("/stats/today")
    public ResponseEntity<?> getTodayGamesCount() {
        try {
            log.info("Retrieving today's games count");
            Long count = gazeGameService.getTodayGamesCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error retrieving today's games count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve today's games count: " + e.getMessage());
        }
    }
    
    /**
     * Get this week's games count
     */
    @GetMapping("/stats/this-week")
    public ResponseEntity<?> getThisWeekGamesCount() {
        try {
            log.info("Retrieving this week's games count");
            Long count = gazeGameService.getThisWeekGamesCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error retrieving this week's games count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve this week's games count: " + e.getMessage());
        }
    }
    
    /**
     * Get this month's games count
     */
    @GetMapping("/stats/this-month")
    public ResponseEntity<?> getThisMonthGamesCount() {
        try {
            log.info("Retrieving this month's games count");
            Long count = gazeGameService.getThisMonthGamesCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error retrieving this month's games count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve this month's games count: " + e.getMessage());
        }
    }
    
    /**
     * Count games by child ID
     */
    @GetMapping("/child/{childId}/count")
    public ResponseEntity<?> countGamesByChildId(@PathVariable String childId) {
        try {
            log.info("Counting games for child ID: {}", childId);
            Long count = gazeGameService.countGamesByChildId(childId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error counting games for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to count games for child: " + e.getMessage());
        }
    }
    
    /**
     * Get statistics for a child
     */
    @GetMapping("/child/{childId}/statistics")
    public ResponseEntity<?> getChildStatistics(@PathVariable String childId) {
        try {
            log.info("Retrieving statistics for child ID: {}", childId);
            Object statistics = gazeGameService.getChildStatistics(childId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error retrieving statistics for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve statistics: " + e.getMessage());
        }
    }
    
    /**
     * Get performance analysis for a child
     */
    @GetMapping("/child/{childId}/performance-analysis")
    public ResponseEntity<?> getPerformanceAnalysis(@PathVariable String childId) {
        try {
            log.info("Retrieving performance analysis for child ID: {}", childId);
            Object analysis = gazeGameService.getPerformanceAnalysis(childId);
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            log.error("Error retrieving performance analysis for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve performance analysis: " + e.getMessage());
        }
    }
    
    /**
     * Get performance summary for a child
     */
    @GetMapping("/child/{childId}/performance-summary")
    public ResponseEntity<?> getPerformanceSummary(@PathVariable String childId) {
        try {
            log.info("Retrieving performance summary for child ID: {}", childId);
            Object summary = gazeGameService.getPerformanceSummary(childId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error retrieving performance summary for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve performance summary: " + e.getMessage());
        }
    }
    
    /**
     * Get game history for a child with pagination
     */
    @GetMapping("/child/{childId}/history")
    public ResponseEntity<?> getGameHistory(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("Retrieving game history for child ID: {} (page: {}, size: {})", childId, page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<GazeGame> history = gazeGameService.getGameHistory(childId, pageable);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error retrieving game history for child ID {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve game history: " + e.getMessage());
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Gaze Game Service is running!");
    }
    
    /**
     * Get sessions by task ID and child ID
     */
    @GetMapping("/sessions/task/{taskId}/child/{childId}")
    public ResponseEntity<?> getSessionsByTaskAndChild(@PathVariable String taskId, @PathVariable String childId) {
        try {
            log.info("Retrieving sessions for task ID: {} and child ID: {}", taskId, childId);
            List<GazeGame> sessions = gazeGameService.getSessionsByTaskAndChild(taskId, childId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Error retrieving sessions for task ID {} and child ID {}: {}", taskId, childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve sessions: " + e.getMessage());
        }
    }
    
    /**
     * Get sessions by tournament ID and child ID
     */
    @GetMapping("/sessions/tournament/{tournamentId}/child/{childId}")
    public ResponseEntity<?> getSessionsByTournamentAndChild(@PathVariable Long tournamentId, @PathVariable String childId) {
        try {
            log.info("Retrieving sessions for tournament ID: {} and child ID: {}", tournamentId, childId);
            List<GazeGame> sessions = gazeGameService.getSessionsByTournamentAndChild(tournamentId, childId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Error retrieving sessions for tournament ID {} and child ID {}: {}", tournamentId, childId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve sessions: " + e.getMessage());
        }
    }
    
    /**
     * Get all sessions by tournament ID
     */
    @GetMapping("/sessions/tournament/{tournamentId}")
    public ResponseEntity<?> getSessionsByTournament(@PathVariable Long tournamentId) {
        try {
            log.info("Retrieving all sessions for tournament ID: {}", tournamentId);
            List<GazeGame> sessions = gazeGameService.getSessionsByTournament(tournamentId);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            log.error("Error retrieving sessions for tournament ID {}: {}", tournamentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to retrieve sessions: " + e.getMessage());
        }
    }
    
    /**
     * Delete all sessions by task ID
     */
    @DeleteMapping("/sessions/task/{taskId}")
    public ResponseEntity<Void> deleteSessionsByTaskId(@PathVariable String taskId) {
        try {
            log.info("Deleting all sessions for task ID: {}", taskId);
            gazeGameService.deleteSessionsByTaskId(taskId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting sessions for task ID {}: {}", taskId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get latest session data for a child (for ALI assessment)
     */
    @GetMapping("/child/{childId}/latest-session")
    public ResponseEntity<Map<String, Object>> getLatestSessionForChild(@PathVariable String childId) {
        try {
            GazeGame latestSession = gazeGameService.getLatestSessionForChild(childId);
            if (latestSession != null) {
                // Return the entire database row as a map
                Map<String, Object> sessionData = new java.util.HashMap<>();
                sessionData.put("id", latestSession.getId());
                sessionData.put("sessionId", latestSession.getSessionId());
                sessionData.put("dateTime", latestSession.getDateTime());
                sessionData.put("childId", latestSession.getChildId());
                sessionData.put("age", latestSession.getAge());
                sessionData.put("schoolTaskId", latestSession.getSchoolTaskId());
                sessionData.put("tournamentId", latestSession.getTournamentId());
                sessionData.put("round1Count", latestSession.getRound1Count());
                sessionData.put("round2Count", latestSession.getRound2Count());
                sessionData.put("round3Count", latestSession.getRound3Count());
                sessionData.put("isTrainingAllowed", latestSession.getIsTrainingAllowed());
                sessionData.put("suspectedASD", latestSession.getSuspectedASD());
                sessionData.put("isASD", latestSession.getIsASD());
                return ResponseEntity.ok(sessionData);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error getting latest session for child {}: {}", childId, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
}
