package com.example.dance_doodle.service;

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

import com.example.dance_doodle.dto.DanceDoodleGameRequest;
import com.example.dance_doodle.entity.DanceDoodleGame;
import com.example.dance_doodle.repository.DanceDoodleGameRepository;

@Service
public class DanceDoodleGameService {
    
    @Autowired
    private DanceDoodleGameRepository repository;
    
    // Save a new game record
    public DanceDoodleGame saveGameRecord(DanceDoodleGameRequest request) {
        DanceDoodleGame game = new DanceDoodleGame();
        game.setSessionId(request.getSessionId());
        game.setDateTime(request.getDateTime() != null ? request.getDateTime() : LocalDateTime.now());
        game.setChildId(request.getChildId());
        game.setAge(request.getAge());
        game.setSchoolTaskId(request.getSchoolTaskId());
        game.setTournamentId(request.getTournamentId());
        game.setCool_arms(request.getCool_arms());
        game.setOpen_wings(request.getOpen_wings());
        game.setSilly_boxer(request.getSilly_boxer());
        game.setHappy_stand(request.getHappy_stand());
        game.setCrossy_play(request.getCrossy_play());
        game.setShh_fun(request.getShh_fun());
        game.setStretch(request.getStretch());
        game.setVideoURL(request.getVideoURL());
        game.setIsTrainingAllowed(request.getIsTrainingAllowed());
        game.setSuspectedASD(request.getSuspectedASD());
        game.setIsASD(request.getIsASD());
        
        return repository.save(game);
    }
    
    // Get all records
    public List<DanceDoodleGame> getAllRecords() {
        return repository.findAll();
    }
    
    // Get record by ID
    public Optional<DanceDoodleGame> getRecordById(Long id) {
        return repository.findById(id);
    }
    
    // Get records by session ID
    public List<DanceDoodleGame> getRecordsBySessionId(String sessionId) {
        return repository.findBySessionId(sessionId);
    }
    
    // Get records by child ID
    public List<DanceDoodleGame> getRecordsByChildId(String childId) {
        return repository.findByChildId(childId);
    }
    
    // Get paginated game history by child ID
    public Page<DanceDoodleGame> getPaginatedGameHistoryByChildId(String childId, Pageable pageable) {
        return repository.findByChildIdOrderByDateTimeDesc(childId, pageable);
    }
    
    // Get game history by child ID
    public List<DanceDoodleGame> getGameHistoryByChildId(String childId) {
        return repository.findByChildIdOrderByDateTimeDesc(childId);
    }
    
    // Get training data
    public List<DanceDoodleGame> getTrainingData() {
        return repository.findByIsTrainingAllowedTrue();
    }
    
    // Get records by suspected ASD status
    public List<DanceDoodleGame> getRecordsBySuspectedASD(Boolean suspectedASD) {
        return repository.findBySuspectedASD(suspectedASD);
    }
    
    // Get completed games
    public List<DanceDoodleGame> getCompletedGames() {
        return repository.findCompletedGames();
    }
    
    // Get average completion times
    public List<Object[]> getAverageCompletionTimes() {
        return repository.getAverageCompletionTimes();
    }
    
    // Update ASD prediction
    public DanceDoodleGame updateASDPrediction(Long id, Boolean asd) {
        Optional<DanceDoodleGame> optionalGame = repository.findById(id);
        if (optionalGame.isPresent()) {
            DanceDoodleGame game = optionalGame.get();
            game.setIsASD(asd);
            return repository.save(game);
        }
        return null;
    }
    
    // Delete record by ID
    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
    
    // Get comprehensive child statistics
    public Map<String, Object> getChildStatistics(String childId) {
        List<Object[]> results = repository.getChildStatistics(childId);
        Map<String, Object> statistics = new HashMap<>();
        
        if (!results.isEmpty()) {
            Object[] result = results.get(0);
            
            statistics.put("totalGames", result[0]);
            Map<String, Object> averageTimes = new HashMap<>();
            averageTimes.put("cool_arms", result[1]);
            averageTimes.put("open_wings", result[2]);
            averageTimes.put("silly_boxer", result[3]);
            averageTimes.put("happy_stand", result[4]);
            averageTimes.put("crossy_play", result[5]);
            averageTimes.put("shh_fun", result[6]);
            averageTimes.put("stretch", result[7]);
            statistics.put("averageCompletionTimes", averageTimes);
            
            Map<String, Object> completionCounts = new HashMap<>();
            completionCounts.put("cool_arms", result[8]);
            completionCounts.put("open_wings", result[9]);
            completionCounts.put("silly_boxer", result[10]);
            completionCounts.put("happy_stand", result[11]);
            completionCounts.put("crossy_play", result[12]);
            completionCounts.put("shh_fun", result[13]);
            completionCounts.put("stretch", result[14]);
            statistics.put("poseCompletionCounts", completionCounts);
            
            // Calculate days since last game
            List<DanceDoodleGame> childGames = repository.findByChildIdOrderByDateTimeDesc(childId);
            if (!childGames.isEmpty()) {
                long daysSinceLastGame = ChronoUnit.DAYS.between(childGames.get(0).getDateTime(), LocalDateTime.now());
                statistics.put("daysSinceLastGame", daysSinceLastGame);
            }
        } else {
            statistics.put("totalGames", 0);
            statistics.put("averageCompletionTimes", new HashMap<>());
            statistics.put("poseCompletionCounts", new HashMap<>());
            statistics.put("daysSinceLastGame", 0);
        }
        
        return statistics;
    }
    
    // Get pose performance analysis for a child
    public Map<String, Object> getPoseAnalysis(String childId) {
        List<DanceDoodleGame> childGames = repository.findByChildIdOrderByDateTimeDesc(childId);
        Map<String, Object> analysis = new HashMap<>();
        
        if (childGames.isEmpty()) {
            analysis.put("bestPerformance", new HashMap<>());
            analysis.put("worstPerformance", new HashMap<>());
            analysis.put("consistencyScore", new HashMap<>());
            return analysis;
        }
        
        // Calculate best and worst performance for each pose
        Map<String, Integer> bestPerformance = new HashMap<>();
        Map<String, Integer> worstPerformance = new HashMap<>();
        Map<String, Double> consistencyScore = new HashMap<>();
        
        String[] poses = {"cool_arms", "open_wings", "silly_boxer", "happy_stand", 
                         "crossy_play", "shh_fun", "stretch"};
        
        for (String pose : poses) {
            List<Integer> times = childGames.stream()
                .map(game -> getPoseTime(game, pose))
                .filter(time -> time != null)
                .toList();
            
            if (!times.isEmpty()) {
                bestPerformance.put(pose, times.stream().mapToInt(Integer::intValue).min().orElse(0));
                worstPerformance.put(pose, times.stream().mapToInt(Integer::intValue).max().orElse(0));
                
                // Calculate consistency (lower standard deviation = higher consistency)
                double avg = times.stream().mapToInt(Integer::intValue).average().orElse(0);
                double variance = times.stream()
                    .mapToDouble(time -> Math.pow(time - avg, 2))
                    .average().orElse(0);
                double stdDev = Math.sqrt(variance);
                consistencyScore.put(pose, Math.max(0, 100 - stdDev)); // Higher score = more consistent
            }
        }
        
        analysis.put("bestPerformance", bestPerformance);
        analysis.put("worstPerformance", worstPerformance);
        analysis.put("consistencyScore", consistencyScore);
        
        return analysis;
    }
    
    // Get improvement trends for a child
    public Map<String, Object> getImprovementTrends(String childId) {
        List<DanceDoodleGame> childGames = repository.findByChildIdOrderByDateTimeDesc(childId);
        Map<String, Object> trends = new HashMap<>();
        
        if (childGames.size() < 2) {
            trends.put("overallTrend", new HashMap<>());
            return trends;
        }
        
        // Compare latest game with previous game
        DanceDoodleGame latestGame = childGames.get(0);
        DanceDoodleGame previousGame = childGames.get(1);
        
        Map<String, String> poseImprovement = new HashMap<>();
        String[] poses = {"cool_arms", "open_wings", "silly_boxer", "happy_stand", 
                         "crossy_play", "shh_fun", "stretch"};
        
        for (String pose : poses) {
            Integer latestTime = getPoseTime(latestGame, pose);
            Integer previousTime = getPoseTime(previousGame, pose);
            
            if (latestTime != null && previousTime != null) {
                if (latestTime < previousTime) {
                    poseImprovement.put(pose, "Improved");
                } else if (latestTime > previousTime) {
                    poseImprovement.put(pose, "Declined");
                } else {
                    poseImprovement.put(pose, "Same");
                }
            }
        }
        
        Map<String, Object> recentImprovement = new HashMap<>();
        recentImprovement.put("latestGameDate", latestGame.getDateTime().toString());
        recentImprovement.put("previousGameDate", previousGame.getDateTime().toString());
        recentImprovement.put("poseImprovement", poseImprovement);
        trends.put("recentImprovement", recentImprovement);
        
        // Calculate overall trend
        Map<String, Double> overallTrend = new HashMap<>();
        for (String pose : poses) {
            List<Integer> times = childGames.stream()
                .map(game -> getPoseTime(game, pose))
                .filter(time -> time != null)
                .toList();
            
            if (times.size() >= 2) {
                double firstHalf = times.subList(0, times.size() / 2).stream()
                    .mapToInt(Integer::intValue).average().orElse(0);
                double secondHalf = times.subList(times.size() / 2, times.size()).stream()
                    .mapToInt(Integer::intValue).average().orElse(0);
                overallTrend.put(pose, secondHalf - firstHalf); // Negative = improvement
            }
        }
        
        trends.put("overallTrend", overallTrend);
        
        return trends;
    }
    
    // Get best and worst performing poses for a child
    public Map<String, Object> getPerformanceSummary(String childId) {
        List<DanceDoodleGame> childGames = repository.findByChildIdOrderByDateTimeDesc(childId);
        Map<String, Object> summary = new HashMap<>();
        
        if (childGames.isEmpty()) {
            summary.put("bestPose", "No data yet");
            summary.put("bestTime", 0);
            summary.put("worstPose", "No data yet");
            summary.put("worstTime", 0);
            summary.put("totalCompletedPoses", 0);
            return summary;
        }
        
        // Find best and worst performing poses
        String bestPose = null;
        Integer bestTime = Integer.MAX_VALUE;
        String worstPose = null;
        Integer worstTime = 0;
        int totalCompleted = 0;
        
        String[] poses = {"cool_arms", "open_wings", "silly_boxer", "happy_stand", 
                         "crossy_play", "shh_fun", "stretch"};
        
        for (String pose : poses) {
            List<Integer> times = childGames.stream()
                .map(game -> getPoseTime(game, pose))
                .filter(time -> time != null)
                .toList();
            
            if (!times.isEmpty()) {
                totalCompleted += times.size();
                Integer avgTime = (int) times.stream().mapToInt(Integer::intValue).average().orElse(0);
                
                if (avgTime < bestTime) {
                    bestTime = avgTime;
                    bestPose = pose;
                }
                
                if (avgTime > worstTime) {
                    worstTime = avgTime;
                    worstPose = pose;
                }
            }
        }
        
        summary.put("bestPose", bestPose != null ? bestPose : "No data yet");
        summary.put("bestTime", bestTime != Integer.MAX_VALUE ? bestTime : 0);
        summary.put("worstPose", worstPose != null ? worstPose : "No data yet");
        summary.put("worstTime", worstTime);
        summary.put("totalCompletedPoses", totalCompleted);
        
        return summary;
    }
    
    // Helper method to get pose time from game object
    private Integer getPoseTime(DanceDoodleGame game, String pose) {
        return switch (pose) {
            case "cool_arms" -> game.getCool_arms();
            case "open_wings" -> game.getOpen_wings();
            case "silly_boxer" -> game.getSilly_boxer();
            case "happy_stand" -> game.getHappy_stand();
            case "crossy_play" -> game.getCrossy_play();
            case "shh_fun" -> game.getShh_fun();
            case "stretch" -> game.getStretch();
            default -> null;
        };
    }
    
    // Get sessions by task ID and child ID
    public List<DanceDoodleGame> getSessionsByTaskAndChild(String taskId, String childId) {
        return repository.findBySchoolTaskIdAndChildId(taskId, childId);
    }
    
    // Get sessions by tournament ID and child ID
    public List<DanceDoodleGame> getSessionsByTournamentAndChild(Long tournamentId, String childId) {
        return repository.findByTournamentIdAndChildId(tournamentId, childId);
    }
    
    // Get all sessions by tournament ID
    public List<DanceDoodleGame> getSessionsByTournament(Long tournamentId) {
        return repository.findByTournamentId(tournamentId);
    }
    
    // Delete all sessions by task ID
    public void deleteSessionsByTaskId(String taskId) {
        repository.deleteBySchoolTaskId(taskId);
    }
    
    // Get latest session for a child (for ALI assessment)
    public DanceDoodleGame getLatestSessionForChild(String childId) {
        List<DanceDoodleGame> sessions = repository.findByChildIdOrderByDateTimeDesc(childId);
        return sessions.isEmpty() ? null : sessions.get(0);
    }
}

