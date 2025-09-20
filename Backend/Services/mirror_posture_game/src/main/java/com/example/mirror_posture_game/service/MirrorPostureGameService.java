package com.example.mirror_posture_game.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.mirror_posture_game.dto.MirrorPostureGameRequest;
import com.example.mirror_posture_game.entity.MirrorPostureGame;
import com.example.mirror_posture_game.repository.MirrorPostureGameRepository;

@Service
public class MirrorPostureGameService {
    
    @Autowired
    private MirrorPostureGameRepository repository;
    
    // Save a new game record
    public MirrorPostureGame saveGameRecord(MirrorPostureGameRequest request) {
        MirrorPostureGame gameRecord = new MirrorPostureGame();
        gameRecord.setSessionId(request.getSessionId());
        gameRecord.setDateTime(request.getDateTime() != null ? request.getDateTime() : java.time.LocalDateTime.now());
        gameRecord.setChildId(request.getChildId());
        gameRecord.setAge(request.getAge());
        gameRecord.setSchoolTaskId(request.getSchoolTaskId());
        gameRecord.setTournamentId(request.getTournamentId());
        gameRecord.setLookingSideways(request.getLookingSideways());
        gameRecord.setMouthOpen(request.getMouthOpen());
        gameRecord.setShowingTeeth(request.getShowingTeeth());
        gameRecord.setKiss(request.getKiss());
        gameRecord.setVideoURL(request.getVideoURL());
        gameRecord.setIsTrainingAllowed(request.getIsTrainingAllowed());
        gameRecord.setSuspectedASD(request.getSuspectedASD());
        gameRecord.setIsASD(request.getIsASD());
        
        return repository.save(gameRecord);
    }
    
    // Get all records
    public List<MirrorPostureGame> getAllRecords() {
        return repository.findAll();
    }
    
    // Get record by ID
    public Optional<MirrorPostureGame> getRecordById(Long id) {
        return repository.findById(id);
    }
    
    // Get records by session ID
    public List<MirrorPostureGame> getRecordsBySessionId(String sessionId) {
        return repository.findBySessionId(sessionId);
    }
    
    // Get records by child ID
    public List<MirrorPostureGame> getRecordsByChildId(String childId) {
        return repository.findByChildId(childId);
    }
    
    // Get sessions by task ID and child ID
    public List<MirrorPostureGame> getSessionsByTaskAndChild(String taskId, String childId) {
        return repository.findBySchoolTaskIdAndChildId(taskId, childId);
    }
    
    // Get sessions by tournament ID and child ID
    public List<MirrorPostureGame> getSessionsByTournamentAndChild(Long tournamentId, String childId) {
        return repository.findByTournamentIdAndChildId(tournamentId, childId);
    }
    
    // Get all sessions by tournament ID
    public List<MirrorPostureGame> getSessionsByTournament(Long tournamentId) {
        return repository.findByTournamentId(tournamentId);
    }
    
    // Delete all sessions by task ID
    public void deleteSessionsByTaskId(String taskId) {
        repository.deleteBySchoolTaskId(taskId);
    }
    
    // Get training data (where isTrainingAllowed = true)
    public List<MirrorPostureGame> getTrainingData() {
        return repository.getTrainingData();
    }
    
    // Get records by suspected ASD status
    public List<MirrorPostureGame> getRecordsBySuspectedASD(Boolean suspectedASD) {
        return repository.findBySuspectedASD(suspectedASD);
    }
    
    // Get game history by child ID
    public List<MirrorPostureGame> getGameHistoryByChildId(String childId) {
        return repository.findGameHistoryByChildId(childId);
    }
    
    // Get average completion times for all postures
    public List<Object[]> getAverageCompletionTimes() {
        return repository.getAverageCompletionTimes();
    }
    
    // Get records where postures were completed
    public List<MirrorPostureGame> getCompletedPostures() {
        return repository.getCompletedPostures();
    }
    
    // Update ASD prediction (for ML model)
    public MirrorPostureGame updateASDPrediction(Long id, Boolean isASD) {
        Optional<MirrorPostureGame> optionalRecord = repository.findById(id);
        if (optionalRecord.isPresent()) {
            MirrorPostureGame record = optionalRecord.get();
            record.setIsASD(isASD);
            return repository.save(record);
        }
        return null;
    }
    
    // Delete record by ID
    public void deleteRecord(Long id) {
        repository.deleteById(id);
    }
    
    // Get paginated game history by child ID
    public Page<MirrorPostureGame> getPaginatedGameHistoryByChildId(String childId, Pageable pageable) {
        return repository.findByChildIdOrderByDateTimeDesc(childId, pageable);
    }
    
    // Get comprehensive child statistics
    public Map<String, Object> getChildStatistics(String childId) {
        Map<String, Object> statistics = new HashMap<>();
        
        Long totalGames = repository.countGamesByChildId(childId);
        List<Object[]> avgTimes = repository.getAverageCompletionTimesByChild(childId);
        List<Object[]> completionCounts = repository.getPostureCompletionCountsByChild(childId);
        
        statistics.put("totalGames", totalGames);
        
        Map<String, Double> averageCompletionTimes = new HashMap<>();
        Map<String, Long> postureCompletionCounts = new HashMap<>();
        
        if (!avgTimes.isEmpty() && avgTimes.get(0) != null) {
            Object[] avgData = avgTimes.get(0);
            // Use lookingSideways field for the consolidated "Looking Sideways" posture
            averageCompletionTimes.put("Looking Sideways 👀", avgData[0] != null ? ((Number) avgData[0]).doubleValue() : 0.0);
            averageCompletionTimes.put("Mouth Open 😮", avgData[1] != null ? ((Number) avgData[1]).doubleValue() : 0.0);
            averageCompletionTimes.put("Showing Teeth 😁", avgData[2] != null ? ((Number) avgData[2]).doubleValue() : 0.0);
            averageCompletionTimes.put("Kiss 💋", avgData[3] != null ? ((Number) avgData[3]).doubleValue() : 0.0);
        }
        
        if (!completionCounts.isEmpty() && completionCounts.get(0) != null) {
            Object[] countData = completionCounts.get(0);
            // Use lookingSideways field for the consolidated "Looking Sideways" posture
            postureCompletionCounts.put("Looking Sideways 👀", ((Number) countData[0]).longValue());
            postureCompletionCounts.put("Mouth Open 😮", ((Number) countData[1]).longValue());
            postureCompletionCounts.put("Showing Teeth 😁", ((Number) countData[2]).longValue());
            postureCompletionCounts.put("Kiss 💋", ((Number) countData[3]).longValue());
        }
        
        statistics.put("averageCompletionTimes", averageCompletionTimes);
        statistics.put("postureCompletionCounts", postureCompletionCounts);
        
        return statistics;
    }
    
    // Get posture performance analysis for a child
    public Map<String, Object> getPostureAnalysis(String childId) {
        Map<String, Object> analysis = new HashMap<>();
        
        List<Object[]> bestPerformance = repository.getBestPerformanceByChild(childId);
        List<Object[]> worstPerformance = repository.getWorstPerformanceByChild(childId);
        
        Map<String, Double> bestPerformanceMap = new HashMap<>();
        Map<String, Double> worstPerformanceMap = new HashMap<>();
        Map<String, Double> consistencyScore = new HashMap<>();
        
        if (!bestPerformance.isEmpty() && bestPerformance.get(0) != null) {
            Object[] bestData = bestPerformance.get(0);
            // Use lookingSideways field for the consolidated "Looking Sideways" posture
            bestPerformanceMap.put("Looking Sideways 👀", bestData[0] != null ? ((Number) bestData[0]).doubleValue() : 0.0);
            bestPerformanceMap.put("Mouth Open 😮", bestData[1] != null ? ((Number) bestData[1]).doubleValue() : 0.0);
            bestPerformanceMap.put("Showing Teeth 😁", bestData[2] != null ? ((Number) bestData[2]).doubleValue() : 0.0);
            bestPerformanceMap.put("Kiss 💋", bestData[3] != null ? ((Number) bestData[3]).doubleValue() : 0.0);
        }
        
        if (!worstPerformance.isEmpty() && worstPerformance.get(0) != null) {
            Object[] worstData = worstPerformance.get(0);
            // Use lookingSideways field for the consolidated "Looking Sideways" posture
            worstPerformanceMap.put("Looking Sideways 👀", worstData[0] != null ? ((Number) worstData[0]).doubleValue() : 0.0);
            worstPerformanceMap.put("Mouth Open 😮", worstData[1] != null ? ((Number) worstData[1]).doubleValue() : 0.0);
            worstPerformanceMap.put("Showing Teeth 😁", worstData[2] != null ? ((Number) worstData[2]).doubleValue() : 0.0);
            worstPerformanceMap.put("Kiss 💋", worstData[3] != null ? ((Number) worstData[3]).doubleValue() : 0.0);
        }
        
        // Calculate consistency scores (lower variance = higher consistency)
        String[] postures = {"Looking Sideways 👀", "Mouth Open 😮", "Showing Teeth 😁", "Kiss 💋"};
        for (String posture : postures) {
            double best = bestPerformanceMap.getOrDefault(posture, 0.0);
            double worst = worstPerformanceMap.getOrDefault(posture, 0.0);
            double consistency = best > 0 && worst > 0 ? (best / worst) * 100 : 0.0;
            consistencyScore.put(posture, Math.min(consistency, 100.0));
        }
        
        analysis.put("bestPerformance", bestPerformanceMap);
        analysis.put("worstPerformance", worstPerformanceMap);
        analysis.put("consistencyScore", consistencyScore);
        
        return analysis;
    }
    
    // Get improvement trends for a child
    public Map<String, Object> getImprovementTrends(String childId) {
        Map<String, Object> trends = new HashMap<>();
        
        List<MirrorPostureGame> recentGames = repository.getRecentGamesByChildId(childId);
        Map<String, Double> overallTrend = new HashMap<>();
        
        if (recentGames.size() >= 2) {
            MirrorPostureGame latest = recentGames.get(0);
            MirrorPostureGame previous = recentGames.get(1);
            
            String[] postures = {"Looking Sideways 👀", "Mouth Open 😮", "Showing Teeth 😁", "Kiss 💋"};
            Integer[] latestTimes = {latest.getLookingSideways(), latest.getMouthOpen(), latest.getShowingTeeth(), latest.getKiss()};
            Integer[] previousTimes = {previous.getLookingSideways(), previous.getMouthOpen(), previous.getShowingTeeth(), previous.getKiss()};
            
            for (int i = 0; i < postures.length; i++) {
                if (latestTimes[i] != null && previousTimes[i] != null) {
                    double improvement = ((double) (previousTimes[i] - latestTimes[i]) / previousTimes[i]) * 100;
                    overallTrend.put(postures[i], improvement);
                } else {
                    overallTrend.put(postures[i], 0.0);
                }
            }
        }
        
        trends.put("overallTrend", overallTrend);
        return trends;
    }
    
    // Get performance summary for a child
    public Map<String, Object> getPerformanceSummary(String childId) {
        Map<String, Object> summary = new HashMap<>();
        
        List<Object[]> bestPerformance = repository.getBestPerformanceByChild(childId);
        List<Object[]> worstPerformance = repository.getWorstPerformanceByChild(childId);
        
        if (!bestPerformance.isEmpty() && bestPerformance.get(0) != null) {
            Object[] bestData = bestPerformance.get(0);
            String[] postures = {"Looking Sideways 👀", "Mouth Open 😮", "Showing Teeth 😁", "Kiss 💋"};
            Double[] times = {
                bestData[0] != null ? ((Number) bestData[0]).doubleValue() : 0.0,
                bestData[1] != null ? ((Number) bestData[1]).doubleValue() : 0.0,
                bestData[2] != null ? ((Number) bestData[2]).doubleValue() : 0.0,
                bestData[3] != null ? ((Number) bestData[3]).doubleValue() : 0.0
            };
            
            int bestIndex = 0;
            double bestTime = Double.MAX_VALUE;
            for (int i = 0; i < times.length; i++) {
                if (times[i] > 0 && times[i] < bestTime) {
                    bestTime = times[i];
                    bestIndex = i;
                }
            }
            
            if (bestTime < Double.MAX_VALUE) {
                summary.put("bestPosture", postures[bestIndex]);
                summary.put("bestTime", bestTime);
            }
        }
        
        if (!worstPerformance.isEmpty() && worstPerformance.get(0) != null) {
            Object[] worstData = worstPerformance.get(0);
            String[] postures = {"Looking Sideways 👀", "Mouth Open 😮", "Showing Teeth 😁", "Kiss 💋"};
            Double[] times = {
                worstData[0] != null ? ((Number) worstData[0]).doubleValue() : 0.0,
                worstData[1] != null ? ((Number) worstData[1]).doubleValue() : 0.0,
                worstData[2] != null ? ((Number) worstData[2]).doubleValue() : 0.0,
                worstData[3] != null ? ((Number) worstData[3]).doubleValue() : 0.0
            };
            
            int worstIndex = 0;
            double worstTime = 0.0;
            for (int i = 0; i < times.length; i++) {
                if (times[i] > worstTime) {
                    worstTime = times[i];
                    worstIndex = i;
                }
            }
            
            if (worstTime > 0) {
                summary.put("worstPosture", postures[worstIndex]);
                summary.put("worstTime", worstTime);
            }
        }
        
        return summary;
    }
    
    /**
     * Get latest session for a child (for ALI assessment)
     */
    public MirrorPostureGame getLatestSessionForChild(String childId) {
        List<MirrorPostureGame> sessions = repository.findByChildIdOrderByDateTimeDesc(childId);
        return sessions.isEmpty() ? null : sessions.get(0);
    }
} 