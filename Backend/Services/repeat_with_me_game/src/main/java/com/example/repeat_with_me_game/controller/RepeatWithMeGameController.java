package com.example.repeat_with_me_game.controller;

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

import com.example.repeat_with_me_game.dto.RepeatWithMeGameRequest;
import com.example.repeat_with_me_game.entity.RepeatWithMeGame;
import com.example.repeat_with_me_game.service.RepeatWithMeGameService;

@RestController
@RequestMapping("/api/repeat-with-me-game")
@CrossOrigin(origins = "*")
public class RepeatWithMeGameController {
    
    @Autowired
    private RepeatWithMeGameService service;
    
    // Save a new game record
    @PostMapping("/save")
    public ResponseEntity<RepeatWithMeGame> saveGameRecord(@RequestBody RepeatWithMeGameRequest request) {
        try {
            RepeatWithMeGame savedRecord = service.saveGameRecord(request);
            return ResponseEntity.ok(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get all records
    @GetMapping("/all")
    public ResponseEntity<List<RepeatWithMeGame>> getAllRecords() {
        List<RepeatWithMeGame> records = service.getAllRecords();
        return ResponseEntity.ok(records);
    }
    
    // Get record by ID
    @GetMapping("/{id}")
    public ResponseEntity<RepeatWithMeGame> getRecordById(@PathVariable Long id) {
        Optional<RepeatWithMeGame> record = service.getRecordById(id);
        return record.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    // Get records by session ID
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<RepeatWithMeGame>> getRecordsBySessionId(@PathVariable String sessionId) {
        List<RepeatWithMeGame> records = service.getRecordsBySessionId(sessionId);
        return ResponseEntity.ok(records);
    }
    
    // Get records by child ID
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<RepeatWithMeGame>> getRecordsByChildId(@PathVariable String childId) {
        List<RepeatWithMeGame> records = service.getRecordsByChildId(childId);
        return ResponseEntity.ok(records);
    }
    
    // Get sessions by task ID and child ID
    @GetMapping("/sessions/task/{taskId}/child/{childId}")
    public ResponseEntity<List<RepeatWithMeGame>> getSessionsByTaskAndChild(@PathVariable String taskId, @PathVariable String childId) {
        List<RepeatWithMeGame> sessions = service.getSessionsByTaskAndChild(taskId, childId);
        return ResponseEntity.ok(sessions);
    }
    
    // Get sessions by tournament ID and child ID
    @GetMapping("/sessions/tournament/{tournamentId}/child/{childId}")
    public ResponseEntity<List<RepeatWithMeGame>> getSessionsByTournamentAndChild(@PathVariable Long tournamentId, @PathVariable String childId) {
        List<RepeatWithMeGame> sessions = service.getSessionsByTournamentAndChild(tournamentId, childId);
        return ResponseEntity.ok(sessions);
    }
    
    // Get all sessions by tournament ID
    @GetMapping("/sessions/tournament/{tournamentId}")
    public ResponseEntity<List<RepeatWithMeGame>> getSessionsByTournament(@PathVariable Long tournamentId) {
        List<RepeatWithMeGame> sessions = service.getSessionsByTournament(tournamentId);
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
    public ResponseEntity<List<RepeatWithMeGame>> getTrainingData() {
        List<RepeatWithMeGame> trainingData = service.getTrainingData();
        return ResponseEntity.ok(trainingData);
    }
    
    // Get records by suspected ASD status
    @GetMapping("/suspected-asd/{suspectedASD}")
    public ResponseEntity<List<RepeatWithMeGame>> getRecordsBySuspectedASD(@PathVariable Boolean suspectedASD) {
        List<RepeatWithMeGame> records = service.getRecordsBySuspectedASD(suspectedASD);
        return ResponseEntity.ok(records);
    }
    
    // Get game history by child ID
    @GetMapping("/history/{childId}")
    public ResponseEntity<List<RepeatWithMeGame>> getGameHistoryByChildId(@PathVariable String childId) {
        List<RepeatWithMeGame> history = service.getGameHistoryByChildId(childId);
        return ResponseEntity.ok(history);
    }
    
    // Get paginated game history by child ID
    @GetMapping("/child/{childId}/history")
    public ResponseEntity<Page<RepeatWithMeGame>> getPaginatedGameHistoryByChildId(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RepeatWithMeGame> history = service.getPaginatedGameHistoryByChildId(childId, pageable);
        return ResponseEntity.ok(history);
    }
    
    // Get comprehensive child statistics
    @GetMapping("/child/{childId}/statistics")
    public ResponseEntity<Map<String, Object>> getChildStatistics(@PathVariable String childId) {
        Map<String, Object> statistics = service.getChildStatistics(childId);
        return ResponseEntity.ok(statistics);
    }
    
    // Get performance analysis for a child
    @GetMapping("/child/{childId}/performance-analysis")
    public ResponseEntity<Map<String, Object>> getPerformanceAnalysis(@PathVariable String childId) {
        Map<String, Object> analysis = service.getPerformanceAnalysis(childId);
        return ResponseEntity.ok(analysis);
    }
    
    // Get improvement trends for a child
    @GetMapping("/child/{childId}/improvement-trends")
    public ResponseEntity<Map<String, Object>> getImprovementTrends(@PathVariable String childId) {
        Map<String, Object> trends = service.getImprovementTrends(childId);
        return ResponseEntity.ok(trends);
    }
    
    // Get performance summary for a child
    @GetMapping("/child/{childId}/performance-summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(@PathVariable String childId) {
        Map<String, Object> summary = service.getPerformanceSummary(childId);
        return ResponseEntity.ok(summary);
    }
    
    // Update ASD prediction
    @PutMapping("/{id}/asd-prediction")
    public ResponseEntity<RepeatWithMeGame> updateASDPrediction(@PathVariable Long id, @RequestBody Boolean asd) {
        RepeatWithMeGame updatedRecord = service.updateASDPrediction(id, asd);
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
        return ResponseEntity.ok("Repeat with Me Game Service is running!");
    }
    
    // Get latest session data for a child (for ALI assessment)
    @GetMapping("/child/{childId}/latest-session")
    public ResponseEntity<Map<String, Object>> getLatestSessionForChild(@PathVariable String childId) {
        try {
            RepeatWithMeGame latestSession = service.getLatestSessionForChild(childId);
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
                sessionData.put("averageScore", latestSession.getAverageScore());
                sessionData.put("completedRounds", latestSession.getCompletedRounds());
                sessionData.put("round1score", latestSession.getRound1Score());
                sessionData.put("round2score", latestSession.getRound2Score());
                sessionData.put("round3score", latestSession.getRound3Score());
                sessionData.put("round4score", latestSession.getRound4Score());
                sessionData.put("round5score", latestSession.getRound5Score());
                sessionData.put("round6score", latestSession.getRound6Score());
                sessionData.put("round7score", latestSession.getRound7Score());
                sessionData.put("round8score", latestSession.getRound8Score());
                sessionData.put("round9score", latestSession.getRound9Score());
                sessionData.put("round10score", latestSession.getRound10Score());
                sessionData.put("round11score", latestSession.getRound11Score());
                sessionData.put("round12score", latestSession.getRound12Score());
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
