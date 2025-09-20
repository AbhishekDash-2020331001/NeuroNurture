package com.example.gesture_game.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.gesture_game.dto.GestureGameRequest;
import com.example.gesture_game.entity.GestureGame;
import com.example.gesture_game.repository.GestureGameRepository;

@Service
public class GestureGameService {
    
    @Autowired
    private GestureGameRepository repository;
    
    private static final String[] GESTURE_NAMES = {
        "thumbs_up", "thumbs_down", "victory", "butterfly", "spectacle", 
        "heart", "pointing_up", "iloveyou", "dua", "closed_fist", "open_palm"
    };
    
    private static final String[] GESTURE_DISPLAY_NAMES = {
        "Thumbs Up 👍", "Thumbs Down 👎", "Victory ✌️", "Butterfly 🦋", "Spectacle 👓", 
        "Heart ❤️", "Pointing Up ☝️", "I Love You 🤟", "Dua 🙏", "Closed Fist ✊", "Open Palm 🖐️"
    };
    
    public GestureGame saveGameRecord(GestureGameRequest request) {
        GestureGame game = new GestureGame();
        game.setSessionId(request.getSessionId());
        game.setChildId(request.getChildId());
        game.setAge(request.getAge());
        game.setSchoolTaskId(request.getSchoolTaskId());
        game.setTournamentId(request.getTournamentId());
        game.setVideoURL(request.getVideoURL());
        game.setIsTrainingAllowed(request.getIsTrainingAllowed());
        game.setSuspectedASD(request.getSuspectedASD());
        
        // Set gesture completion times
        game.setThumbs_up(request.getThumbs_up());
        game.setThumbs_down(request.getThumbs_down());
        game.setVictory(request.getVictory());
        game.setButterfly(request.getButterfly());
        game.setSpectacle(request.getSpectacle());
        game.setHeart(request.getHeart());
        game.setPointing_up(request.getPointing_up());
        game.setIloveyou(request.getIloveyou());
        game.setDua(request.getDua());
        game.setClosed_fist(request.getClosed_fist());
        game.setOpen_palm(request.getOpen_palm());
        
        return repository.save(game);
    }
    
    public List<GestureGame> getAllRecords() {
        return repository.findAll();
    }
    
    public Optional<GestureGame> getRecordById(Long id) {
        return repository.findById(id);
    }
    
    public List<GestureGame> getRecordsBySessionId(String sessionId) {
        return repository.findBySessionId(sessionId);
    }
    
    public List<GestureGame> getRecordsByChildId(String childId) {
        return repository.findByChildId(childId);
    }
    
    // Get sessions by task ID and child ID
    public List<GestureGame> getSessionsByTaskAndChild(String taskId, String childId) {
        return repository.findBySchoolTaskIdAndChildId(taskId, childId);
    }
    
    // Get sessions by tournament ID and child ID
    public List<GestureGame> getSessionsByTournamentAndChild(Long tournamentId, String childId) {
        return repository.findByTournamentIdAndChildId(tournamentId, childId);
    }
    
    // Get all sessions by tournament ID
    public List<GestureGame> getSessionsByTournament(Long tournamentId) {
        return repository.findByTournamentId(tournamentId);
    }
    
    // Delete all sessions by task ID
    public void deleteSessionsByTaskId(String taskId) {
        repository.deleteBySchoolTaskId(taskId);
    }
    
    public Page<GestureGame> getPaginatedGameHistoryByChildId(String childId, Pageable pageable) {
        return repository.findByChildIdOrderByDateTimeDesc(childId, pageable);
    }
    
    public List<GestureGame> getTrainingData() {
        return repository.getTrainingData();
    }
    
    public List<GestureGame> getRecordsBySuspectedASD(Boolean suspectedASD) {
        return repository.findBySuspectedASD(suspectedASD);
    }
    
    public List<GestureGame> getGameHistoryByChildId(String childId) {
        return repository.findGameHistoryByChildId(childId);
    }
    
    public List<Object[]> getAverageCompletionTimes() {
        return repository.getAverageCompletionTimes();
    }
    
    public List<GestureGame> getCompletedGestures() {
        return repository.getCompletedGestures();
    }
    
    public GestureGame updateASDPrediction(Long id, Boolean asd) {
        Optional<GestureGame> optionalGame = repository.findById(id);
        if (optionalGame.isPresent()) {
            GestureGame game = optionalGame.get();
            game.setIsASD(asd);
            return repository.save(game);
        }
        return null;
    }
    
    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
    
    // Comprehensive child statistics
    public Map<String, Object> getChildStatistics(String childId) {
        Map<String, Object> statistics = new HashMap<>();
        
        // Basic stats
        Long totalGames = repository.countGamesByChildId(childId);
        statistics.put("totalGames", totalGames);
        
        // Average completion times
        List<Object[]> avgTimes = repository.getAverageCompletionTimesByChild(childId);
        if (!avgTimes.isEmpty() && avgTimes.get(0) != null) {
            Object[] times = avgTimes.get(0);
            Map<String, Double> averageTimes = new HashMap<>();
            for (int i = 0; i < GESTURE_NAMES.length && i < times.length; i++) {
                if (times[i] != null) {
                    averageTimes.put(GESTURE_DISPLAY_NAMES[i], ((Number) times[i]).doubleValue());
                }
            }
            statistics.put("averageCompletionTimes", averageTimes);
        }
        
        // Gesture completion counts
        List<Object[]> completionCounts = repository.getGestureCompletionCountsByChild(childId);
        if (!completionCounts.isEmpty() && completionCounts.get(0) != null) {
            Object[] counts = completionCounts.get(0);
            Map<String, Long> gestureCounts = new HashMap<>();
            for (int i = 0; i < GESTURE_NAMES.length && i < counts.length; i++) {
                if (counts[i] != null) {
                    gestureCounts.put(GESTURE_DISPLAY_NAMES[i], ((Number) counts[i]).longValue());
                }
            }
            statistics.put("gestureCompletionCounts", gestureCounts);
        }
        
        // Recent activity
        List<GestureGame> recentGames = repository.getRecentGamesByChildId(childId);
        if (recentGames.size() > 1) {
            LocalDateTime lastGame = recentGames.get(0).getDateTime();
            LocalDateTime secondLastGame = recentGames.get(1).getDateTime();
            long daysBetween = java.time.Duration.between(secondLastGame, lastGame).toDays();
            statistics.put("daysSinceLastGame", daysBetween);
        }
        
        return statistics;
    }
    
    // Gesture performance analysis
    public Map<String, Object> getGestureAnalysis(String childId) {
        Map<String, Object> analysis = new HashMap<>();
        
        // Best performance (lowest times)
        List<Object[]> bestPerformance = repository.getBestPerformanceByChild(childId);
        if (!bestPerformance.isEmpty() && bestPerformance.get(0) != null) {
            Object[] best = bestPerformance.get(0);
            Map<String, Integer> bestTimes = new HashMap<>();
            for (int i = 0; i < GESTURE_NAMES.length && i < best.length; i++) {
                if (best[i] != null) {
                    bestTimes.put(GESTURE_DISPLAY_NAMES[i], ((Number) best[i]).intValue());
                }
            }
            analysis.put("bestPerformance", bestTimes);
        }
        
        // Worst performance (highest times)
        List<Object[]> worstPerformance = repository.getWorstPerformanceByChild(childId);
        if (!worstPerformance.isEmpty() && worstPerformance.get(0) != null) {
            Object[] worst = worstPerformance.get(0);
            Map<String, Integer> worstTimes = new HashMap<>();
            for (int i = 0; i < GESTURE_NAMES.length && i < worst.length; i++) {
                if (worst[i] != null) {
                    worstTimes.put(GESTURE_DISPLAY_NAMES[i], ((Number) worst[i]).intValue());
                }
            }
            analysis.put("worstPerformance", worstTimes);
        }
        
        // Performance consistency
        List<Object[]> avgTimes = repository.getAverageCompletionTimesByChild(childId);
        List<Object[]> bestTimes = repository.getBestPerformanceByChild(childId);
        if (!avgTimes.isEmpty() && !bestTimes.isEmpty() && avgTimes.get(0) != null && bestTimes.get(0) != null) {
            Object[] avg = avgTimes.get(0);
            Object[] best = bestTimes.get(0);
            Map<String, Double> consistency = new HashMap<>();
            for (int i = 0; i < GESTURE_NAMES.length && i < avg.length && i < best.length; i++) {
                if (avg[i] != null && best[i] != null) {
                    double avgTime = ((Number) avg[i]).doubleValue();
                    double bestTime = ((Number) best[i]).doubleValue();
                    double consistencyScore = (bestTime / avgTime) * 100; // Higher is better
                    consistency.put(GESTURE_DISPLAY_NAMES[i], Math.round(consistencyScore * 100.0) / 100.0);
                }
            }
            analysis.put("consistencyScore", consistency);
        }
        
        return analysis;
    }
    
    // Improvement trends
    public Map<String, Object> getImprovementTrends(String childId) {
        Map<String, Object> trends = new HashMap<>();
        
        List<GestureGame> recentGames = repository.getRecentGamesByChildId(childId);
        if (recentGames.size() >= 2) {
            // Compare last 2 games for improvement
            GestureGame latest = recentGames.get(0);
            GestureGame previous = recentGames.get(1);
            
            Map<String, Object> improvement = new HashMap<>();
            improvement.put("latestGameDate", latest.getDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
            improvement.put("previousGameDate", previous.getDateTime().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")));
            
            // Calculate improvement for each gesture
            Map<String, String> gestureImprovement = new HashMap<>();
            for (int i = 0; i < GESTURE_NAMES.length; i++) {
                String gestureName = GESTURE_NAMES[i];
                Integer latestTime = getGestureTime(latest, gestureName);
                Integer previousTime = getGestureTime(previous, gestureName);
                
                if (latestTime != null && previousTime != null) {
                    int difference = previousTime - latestTime;
                    if (difference > 0) {
                        gestureImprovement.put(GESTURE_DISPLAY_NAMES[i], "Improved by " + difference + "s 📈");
                    } else if (difference < 0) {
                        gestureImprovement.put(GESTURE_DISPLAY_NAMES[i], "Slower by " + Math.abs(difference) + "s 📉");
                    } else {
                        gestureImprovement.put(GESTURE_DISPLAY_NAMES[i], "No change ➡️");
                    }
                }
            }
            improvement.put("gestureImprovement", gestureImprovement);
            trends.put("recentImprovement", improvement);
        }
        
        // Overall trend (last 5 games average)
        if (recentGames.size() >= 5) {
            Map<String, Double> overallTrend = calculateOverallTrend(recentGames.subList(0, 5));
            trends.put("overallTrend", overallTrend);
        }
        
        return trends;
    }
    
    // Performance summary
    public Map<String, Object> getPerformanceSummary(String childId) {
        Map<String, Object> summary = new HashMap<>();
        
        // Find best and worst performing gestures
        List<Object[]> avgTimes = repository.getAverageCompletionTimesByChild(childId);
        if (!avgTimes.isEmpty() && avgTimes.get(0) != null) {
            Object[] times = avgTimes.get(0);
            String bestGesture = null;
            String worstGesture = null;
            Double bestTime = Double.MAX_VALUE;
            Double worstTime = 0.0;
            
            for (int i = 0; i < GESTURE_NAMES.length && i < times.length; i++) {
                if (times[i] != null) {
                    double time = ((Number) times[i]).doubleValue();
                    if (time < bestTime) {
                        bestTime = time;
                        bestGesture = GESTURE_DISPLAY_NAMES[i];
                    }
                    if (time > worstTime) {
                        worstTime = time;
                        worstGesture = GESTURE_DISPLAY_NAMES[i];
                    }
                }
            }
            
            if (bestGesture != null) {
                summary.put("bestGesture", bestGesture);
                summary.put("bestTime", bestTime);
            }
            if (worstGesture != null) {
                summary.put("worstGesture", worstGesture);
                summary.put("worstTime", worstTime);
            }
        }
        
        // Total completed gestures
        List<Object[]> completionCounts = repository.getGestureCompletionCountsByChild(childId);
        if (!completionCounts.isEmpty() && completionCounts.get(0) != null) {
            Object[] counts = completionCounts.get(0);
            int totalCompleted = 0;
            for (Object count : counts) {
                if (count != null) {
                    totalCompleted += ((Number) count).intValue();
                }
            }
            summary.put("totalCompletedGestures", totalCompleted);
        }
        
        return summary;
    }
    
    // Helper method to get gesture time from GestureGame object
    private Integer getGestureTime(GestureGame game, String gestureName) {
        switch (gestureName) {
            case "thumbs_up": return game.getThumbs_up();
            case "thumbs_down": return game.getThumbs_down();
            case "victory": return game.getVictory();
            case "butterfly": return game.getButterfly();
            case "spectacle": return game.getSpectacle();
            case "heart": return game.getHeart();
            case "pointing_up": return game.getPointing_up();
            case "iloveyou": return game.getIloveyou();
            case "dua": return game.getDua();
            case "closed_fist": return game.getClosed_fist();
            case "open_palm": return game.getOpen_palm();
            default: return null;
        }
    }
    
    // Helper method to calculate overall trend
    private Map<String, Double> calculateOverallTrend(List<GestureGame> games) {
        Map<String, Double> trend = new HashMap<>();
        
        for (String gestureName : GESTURE_NAMES) {
            List<Double> times = new ArrayList<>();
            for (GestureGame game : games) {
                Integer time = getGestureTime(game, gestureName);
                if (time != null) {
                    times.add(time.doubleValue());
                }
            }
            
            if (times.size() >= 2) {
                // Calculate trend (positive = improving, negative = declining)
                double firstHalf = times.subList(0, times.size() / 2).stream().mapToDouble(Double::doubleValue).average().orElse(0);
                double secondHalf = times.subList(times.size() / 2, times.size()).stream().mapToDouble(Double::doubleValue).average().orElse(0);
                double trendValue = firstHalf - secondHalf; // Positive means improving
                trend.put(GESTURE_DISPLAY_NAMES[getGestureIndex(gestureName)], Math.round(trendValue * 100.0) / 100.0);
            }
        }
        
        return trend;
    }
    
    // Helper method to get gesture index
    private int getGestureIndex(String gestureName) {
        for (int i = 0; i < GESTURE_NAMES.length; i++) {
            if (GESTURE_NAMES[i].equals(gestureName)) {
                return i;
            }
        }
        return 0;
    }
    
    // Get latest session for a child (for ALI assessment)
    public GestureGame getLatestSessionForChild(String childId) {
        List<GestureGame> sessions = repository.findByChildIdOrderByDateTimeDesc(childId);
        return sessions.isEmpty() ? null : sessions.get(0);
    }
}
