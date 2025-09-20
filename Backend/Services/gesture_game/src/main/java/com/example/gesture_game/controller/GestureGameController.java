package com.example.gesture_game.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gesture_game.dto.GestureGameRequest;
import com.example.gesture_game.entity.GestureGame;
import com.example.gesture_game.service.GestureGameService;

@RestController
@RequestMapping("/api/gesture-game")
@CrossOrigin(origins = "*")
public class GestureGameController {
    
    @Autowired
    private GestureGameService service;
    
    // Save a new game record
    @PostMapping("/save")
    public ResponseEntity<GestureGame> saveGameRecord(@RequestBody GestureGameRequest request) {
        try {
            GestureGame savedRecord = service.saveGameRecord(request);
            return ResponseEntity.ok(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get all records
    @GetMapping("/all")
    public ResponseEntity<List<GestureGame>> getAllRecords() {
        List<GestureGame> records = service.getAllRecords();
        return ResponseEntity.ok(records);
    }
    
    // Get record by ID
    @GetMapping("/{id}")
    public ResponseEntity<GestureGame> getRecordById(@PathVariable Long id) {
        Optional<GestureGame> record = service.getRecordById(id);
        return record.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    // Get records by session ID
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<GestureGame>> getRecordsBySessionId(@PathVariable String sessionId) {
        List<GestureGame> records = service.getRecordsBySessionId(sessionId);
        return ResponseEntity.ok(records);
    }
    
    // Get records by child ID
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<GestureGame>> getRecordsByChildId(@PathVariable String childId) {
        List<GestureGame> records = service.getRecordsByChildId(childId);
        return ResponseEntity.ok(records);
    }
    
    // Get sessions by task ID and child ID
    @GetMapping("/sessions/task/{taskId}/child/{childId}")
    public ResponseEntity<List<GestureGame>> getSessionsByTaskAndChild(@PathVariable String taskId, @PathVariable String childId) {
        List<GestureGame> sessions = service.getSessionsByTaskAndChild(taskId, childId);
        return ResponseEntity.ok(sessions);
    }
    
    // Get sessions by tournament ID and child ID
    @GetMapping("/sessions/tournament/{tournamentId}/child/{childId}")
    public ResponseEntity<List<GestureGame>> getSessionsByTournamentAndChild(@PathVariable Long tournamentId, @PathVariable String childId) {
        List<GestureGame> sessions = service.getSessionsByTournamentAndChild(tournamentId, childId);
        return ResponseEntity.ok(sessions);
    }
    
    // Get all sessions by tournament ID
    @GetMapping("/sessions/tournament/{tournamentId}")
    public ResponseEntity<List<GestureGame>> getSessionsByTournament(@PathVariable Long tournamentId) {
        List<GestureGame> sessions = service.getSessionsByTournament(tournamentId);
        return ResponseEntity.ok(sessions);
    }
    
    // Delete all sessions by task ID
    @DeleteMapping("/sessions/task/{taskId}")
    public ResponseEntity<Void> deleteSessionsByTaskId(@PathVariable String taskId) {
        service.deleteSessionsByTaskId(taskId);
        return ResponseEntity.ok().build();
    }
    
    // Get paginated game history by child ID
    @GetMapping("/child/{childId}/history")
    public ResponseEntity<Page<GestureGame>> getPaginatedGameHistoryByChildId(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GestureGame> history = service.getPaginatedGameHistoryByChildId(childId, pageable);
        return ResponseEntity.ok(history);
    }
    
    // Get comprehensive child statistics
    @GetMapping("/child/{childId}/statistics")
    public ResponseEntity<Map<String, Object>> getChildStatistics(@PathVariable String childId) {
        Map<String, Object> statistics = service.getChildStatistics(childId);
        return ResponseEntity.ok(statistics);
    }
    
    // Get gesture performance analysis for a child
    @GetMapping("/child/{childId}/gesture-analysis")
    public ResponseEntity<Map<String, Object>> getGestureAnalysis(@PathVariable String childId) {
        Map<String, Object> analysis = service.getGestureAnalysis(childId);
        return ResponseEntity.ok(analysis);
    }
    
    // Get improvement trends for a child
    @GetMapping("/child/{childId}/improvement-trends")
    public ResponseEntity<Map<String, Object>> getImprovementTrends(@PathVariable String childId) {
        Map<String, Object> trends = service.getImprovementTrends(childId);
        return ResponseEntity.ok(trends);
    }
    
    // Get best and worst performing gestures for a child
    @GetMapping("/child/{childId}/performance-summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(@PathVariable String childId) {
        Map<String, Object> summary = service.getPerformanceSummary(childId);
        return ResponseEntity.ok(summary);
    }
    
    // Get training data
    @GetMapping("/training-data")
    public ResponseEntity<List<GestureGame>> getTrainingData() {
        List<GestureGame> trainingData = service.getTrainingData();
        return ResponseEntity.ok(trainingData);
    }
    
    // Get records by suspected ASD status
    @GetMapping("/suspected-asd/{suspectedASD}")
    public ResponseEntity<List<GestureGame>> getRecordsBySuspectedASD(@PathVariable Boolean suspectedASD) {
        List<GestureGame> records = service.getRecordsBySuspectedASD(suspectedASD);
        return ResponseEntity.ok(records);
    }
    
    // Get game history by child ID
    @GetMapping("/history/{childId}")
    public ResponseEntity<List<GestureGame>> getGameHistoryByChildId(@PathVariable String childId) {
        List<GestureGame> history = service.getGameHistoryByChildId(childId);
        return ResponseEntity.ok(history);
    }
    
    // Get average completion times for all gestures
    @GetMapping("/statistics/average-completion-times")
    public ResponseEntity<List<Object[]>> getAverageCompletionTimes() {
        List<Object[]> statistics = service.getAverageCompletionTimes();
        return ResponseEntity.ok(statistics);
    }
    
    // Get completed gestures
    @GetMapping("/completed-gestures")
    public ResponseEntity<List<GestureGame>> getCompletedGestures() {
        List<GestureGame> completedGestures = service.getCompletedGestures();
        return ResponseEntity.ok(completedGestures);
    }
    
    // Update ASD prediction
    @PutMapping("/{id}/asd-prediction")
    public ResponseEntity<GestureGame> updateASDPrediction(@PathVariable Long id, @RequestBody Boolean asd) {
        GestureGame updatedRecord = service.updateASDPrediction(id, asd);
        if (updatedRecord != null) {
            return ResponseEntity.ok(updatedRecord);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Delete record by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        service.deleteRecord(id);
        return ResponseEntity.ok().build();
    }
    
    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Gesture Game Service is running!");
    }
    
    // Get latest session data for a child (for ALI assessment)
    @GetMapping("/child/{childId}/latest-session")
    public ResponseEntity<Map<String, Object>> getLatestSessionForChild(@PathVariable String childId) {
        try {
            GestureGame latestSession = service.getLatestSessionForChild(childId);
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
                sessionData.put("thumbs_up", latestSession.getThumbs_up());
                sessionData.put("thumbs_down", latestSession.getThumbs_down());
                sessionData.put("victory", latestSession.getVictory());
                sessionData.put("butterfly", latestSession.getButterfly());
                sessionData.put("spectacle", latestSession.getSpectacle());
                sessionData.put("heart", latestSession.getHeart());
                sessionData.put("pointing_up", latestSession.getPointing_up());
                sessionData.put("iloveyou", latestSession.getIloveyou());
                sessionData.put("dua", latestSession.getDua());
                sessionData.put("closed_fist", latestSession.getClosed_fist());
                sessionData.put("open_palm", latestSession.getOpen_palm());
                sessionData.put("videoURL", latestSession.getVideoURL());
                sessionData.put("isTrainingAllowed", latestSession.getIsTrainingAllowed());
                sessionData.put("suspectedASD", latestSession.getSuspectedASD());
                sessionData.put("isASD", latestSession.getIsASD());
                return ResponseEntity.ok(sessionData);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
