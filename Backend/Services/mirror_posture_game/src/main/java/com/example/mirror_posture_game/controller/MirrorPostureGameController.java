package com.example.mirror_posture_game.controller;

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

import com.example.mirror_posture_game.dto.MirrorPostureGameRequest;
import com.example.mirror_posture_game.entity.MirrorPostureGame;
import com.example.mirror_posture_game.service.MirrorPostureGameService;

@RestController
@RequestMapping("/api/mirror-posture-game")
@CrossOrigin(origins = "*")
public class MirrorPostureGameController {
    
    @Autowired
    private MirrorPostureGameService service;
    
    // Save a new game record
    @PostMapping("/save")
    public ResponseEntity<MirrorPostureGame> saveGameRecord(@RequestBody MirrorPostureGameRequest request) {
        try {
            MirrorPostureGame savedRecord = service.saveGameRecord(request);
            return ResponseEntity.ok(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get all records
    @GetMapping("/all")
    public ResponseEntity<List<MirrorPostureGame>> getAllRecords() {
        List<MirrorPostureGame> records = service.getAllRecords();
        return ResponseEntity.ok(records);
    }
    
    // Get record by ID
    @GetMapping("/{id}")
    public ResponseEntity<MirrorPostureGame> getRecordById(@PathVariable Long id) {
        Optional<MirrorPostureGame> record = service.getRecordById(id);
        return record.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    // Get records by session ID
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<MirrorPostureGame>> getRecordsBySessionId(@PathVariable String sessionId) {
        List<MirrorPostureGame> records = service.getRecordsBySessionId(sessionId);
        return ResponseEntity.ok(records);
    }
    
    // Get records by child ID
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<MirrorPostureGame>> getRecordsByChildId(@PathVariable String childId) {
        List<MirrorPostureGame> records = service.getRecordsByChildId(childId);
        return ResponseEntity.ok(records);
    }
    
    // Get sessions by task ID and child ID
    @GetMapping("/sessions/task/{taskId}/child/{childId}")
    public ResponseEntity<List<MirrorPostureGame>> getSessionsByTaskAndChild(@PathVariable String taskId, @PathVariable String childId) {
        List<MirrorPostureGame> sessions = service.getSessionsByTaskAndChild(taskId, childId);
        return ResponseEntity.ok(sessions);
    }
    
    // Get sessions by tournament ID and child ID
    @GetMapping("/sessions/tournament/{tournamentId}/child/{childId}")
    public ResponseEntity<List<MirrorPostureGame>> getSessionsByTournamentAndChild(@PathVariable Long tournamentId, @PathVariable String childId) {
        List<MirrorPostureGame> sessions = service.getSessionsByTournamentAndChild(tournamentId, childId);
        return ResponseEntity.ok(sessions);
    }
    
    // Get all sessions by tournament ID
    @GetMapping("/sessions/tournament/{tournamentId}")
    public ResponseEntity<List<MirrorPostureGame>> getSessionsByTournament(@PathVariable Long tournamentId) {
        List<MirrorPostureGame> sessions = service.getSessionsByTournament(tournamentId);
        return ResponseEntity.ok(sessions);
    }
    
    // Delete all sessions by task ID
    @DeleteMapping("/sessions/task/{taskId}")
    public ResponseEntity<Void> deleteSessionsByTaskId(@PathVariable String taskId) {
        service.deleteSessionsByTaskId(taskId);
        return ResponseEntity.ok().build();
    }
    
    // Get training data
    @GetMapping("/training-data")
    public ResponseEntity<List<MirrorPostureGame>> getTrainingData() {
        List<MirrorPostureGame> trainingData = service.getTrainingData();
        return ResponseEntity.ok(trainingData);
    }
    
    // Get records by suspected ASD status
    @GetMapping("/suspected-asd/{suspectedASD}")
    public ResponseEntity<List<MirrorPostureGame>> getRecordsBySuspectedASD(@PathVariable Boolean suspectedASD) {
        List<MirrorPostureGame> records = service.getRecordsBySuspectedASD(suspectedASD);
        return ResponseEntity.ok(records);
    }
    
    // Get game history by child ID
    @GetMapping("/history/{childId}")
    public ResponseEntity<List<MirrorPostureGame>> getGameHistoryByChildId(@PathVariable String childId) {
        List<MirrorPostureGame> history = service.getGameHistoryByChildId(childId);
        return ResponseEntity.ok(history);
    }
    
    // Get paginated game history by child ID
    @GetMapping("/child/{childId}/history")
    public ResponseEntity<Page<MirrorPostureGame>> getPaginatedGameHistoryByChildId(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MirrorPostureGame> history = service.getPaginatedGameHistoryByChildId(childId, pageable);
        return ResponseEntity.ok(history);
    }
    
    // Get comprehensive child statistics
    @GetMapping("/child/{childId}/statistics")
    public ResponseEntity<Map<String, Object>> getChildStatistics(@PathVariable String childId) {
        Map<String, Object> statistics = service.getChildStatistics(childId);
        return ResponseEntity.ok(statistics);
    }
    
    // Get posture performance analysis for a child
    @GetMapping("/child/{childId}/posture-analysis")
    public ResponseEntity<Map<String, Object>> getPostureAnalysis(@PathVariable String childId) {
        Map<String, Object> analysis = service.getPostureAnalysis(childId);
        return ResponseEntity.ok(analysis);
    }
    
    // Get improvement trends for a child
    @GetMapping("/child/{childId}/improvement-trends")
    public ResponseEntity<Map<String, Object>> getImprovementTrends(@PathVariable String childId) {
        Map<String, Object> trends = service.getImprovementTrends(childId);
        return ResponseEntity.ok(trends);
    }
    
    // Get best and worst performing postures for a child
    @GetMapping("/child/{childId}/performance-summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(@PathVariable String childId) {
        Map<String, Object> summary = service.getPerformanceSummary(childId);
        return ResponseEntity.ok(summary);
    }
    
    // Get average completion times for all postures
    @GetMapping("/statistics/average-completion-times")
    public ResponseEntity<List<Object[]>> getAverageCompletionTimes() {
        List<Object[]> statistics = service.getAverageCompletionTimes();
        return ResponseEntity.ok(statistics);
    }
    
    // Get completed postures
    @GetMapping("/completed-postures")
    public ResponseEntity<List<MirrorPostureGame>> getCompletedPostures() {
        List<MirrorPostureGame> completedPostures = service.getCompletedPostures();
        return ResponseEntity.ok(completedPostures);
    }
    
    // Update ASD prediction
    @PutMapping("/{id}/asd-prediction")
    public ResponseEntity<MirrorPostureGame> updateASDPrediction(@PathVariable Long id, @RequestBody Boolean asd) {
        MirrorPostureGame updatedRecord = service.updateASDPrediction(id, asd);
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
        return ResponseEntity.ok("Mirror Posture Game Service is running!");
    }
    
    // Get latest session data for a child (for ALI assessment)
    @GetMapping("/child/{childId}/latest-session")
    public ResponseEntity<Map<String, Object>> getLatestSessionForChild(@PathVariable String childId) {
        try {
            MirrorPostureGame latestSession = service.getLatestSessionForChild(childId);
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
                sessionData.put("kiss", latestSession.getKiss());
                sessionData.put("looking_sideways", latestSession.getLookingSideways());
                sessionData.put("mouth_open", latestSession.getMouthOpen());
                sessionData.put("showing_teeth", latestSession.getShowingTeeth());
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