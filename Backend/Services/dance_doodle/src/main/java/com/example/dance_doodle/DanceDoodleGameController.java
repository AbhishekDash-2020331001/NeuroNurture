package com.example.dance_doodle;

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

@RestController
@RequestMapping("/api/dance-doodle")
@CrossOrigin(origins = "*")
public class DanceDoodleGameController {
    
    @Autowired
    private DanceDoodleGameService service;
    
    // Save a new game record
    @PostMapping("/save")
    public ResponseEntity<DanceDoodleGame> saveGameRecord(@RequestBody DanceDoodleGameRequest request) {
        try {
            DanceDoodleGame savedRecord = service.saveGameRecord(request);
            return ResponseEntity.ok(savedRecord);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Get all records
    @GetMapping("/all")
    public ResponseEntity<List<DanceDoodleGame>> getAllRecords() {
        List<DanceDoodleGame> records = service.getAllRecords();
        return ResponseEntity.ok(records);
    }
    
    // Get record by ID
    @GetMapping("/{id}")
    public ResponseEntity<DanceDoodleGame> getRecordById(@PathVariable Long id) {
        Optional<DanceDoodleGame> record = service.getRecordById(id);
        return record.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }
    
    // Get records by session ID
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<DanceDoodleGame>> getRecordsBySessionId(@PathVariable String sessionId) {
        List<DanceDoodleGame> records = service.getRecordsBySessionId(sessionId);
        return ResponseEntity.ok(records);
    }
    
    // Get records by child ID
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<DanceDoodleGame>> getRecordsByChildId(@PathVariable String childId) {
        List<DanceDoodleGame> records = service.getRecordsByChildId(childId);
        return ResponseEntity.ok(records);
    }
    
    // Get paginated game history by child ID
    @GetMapping("/child/{childId}/history")
    public ResponseEntity<Page<DanceDoodleGame>> getPaginatedGameHistoryByChildId(
            @PathVariable String childId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DanceDoodleGame> history = service.getPaginatedGameHistoryByChildId(childId, pageable);
        return ResponseEntity.ok(history);
    }
    
    // Get comprehensive child statistics
    @GetMapping("/child/{childId}/statistics")
    public ResponseEntity<Map<String, Object>> getChildStatistics(@PathVariable String childId) {
        Map<String, Object> statistics = service.getChildStatistics(childId);
        return ResponseEntity.ok(statistics);
    }
    
    // Get pose performance analysis for a child
    @GetMapping("/child/{childId}/pose-analysis")
    public ResponseEntity<Map<String, Object>> getPoseAnalysis(@PathVariable String childId) {
        Map<String, Object> analysis = service.getPoseAnalysis(childId);
        return ResponseEntity.ok(analysis);
    }
    
    // Get improvement trends for a child
    @GetMapping("/child/{childId}/improvement-trends")
    public ResponseEntity<Map<String, Object>> getImprovementTrends(@PathVariable String childId) {
        Map<String, Object> trends = service.getImprovementTrends(childId);
        return ResponseEntity.ok(trends);
    }
    
    // Get best and worst performing poses for a child
    @GetMapping("/child/{childId}/performance-summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(@PathVariable String childId) {
        Map<String, Object> summary = service.getPerformanceSummary(childId);
        return ResponseEntity.ok(summary);
    }
    
    // Get training data
    @GetMapping("/training-data")
    public ResponseEntity<List<DanceDoodleGame>> getTrainingData() {
        List<DanceDoodleGame> trainingData = service.getTrainingData();
        return ResponseEntity.ok(trainingData);
    }
    
    // Get records by suspected ASD status
    @GetMapping("/suspected-asd/{suspectedASD}")
    public ResponseEntity<List<DanceDoodleGame>> getRecordsBySuspectedASD(@PathVariable Boolean suspectedASD) {
        List<DanceDoodleGame> records = service.getRecordsBySuspectedASD(suspectedASD);
        return ResponseEntity.ok(records);
    }
    
    // Get game history by child ID
    @GetMapping("/history/{childId}")
    public ResponseEntity<List<DanceDoodleGame>> getGameHistoryByChildId(@PathVariable String childId) {
        List<DanceDoodleGame> history = service.getGameHistoryByChildId(childId);
        return ResponseEntity.ok(history);
    }
    
    // Get average completion times for all poses
    @GetMapping("/statistics/average-completion-times")
    public ResponseEntity<List<Object[]>> getAverageCompletionTimes() {
        List<Object[]> statistics = service.getAverageCompletionTimes();
        return ResponseEntity.ok(statistics);
    }
    
    // Get completed games
    @GetMapping("/completed-games")
    public ResponseEntity<List<DanceDoodleGame>> getCompletedGames() {
        List<DanceDoodleGame> completedGames = service.getCompletedGames();
        return ResponseEntity.ok(completedGames);
    }
    
    // Update ASD prediction
    @PutMapping("/{id}/asd-prediction")
    public ResponseEntity<DanceDoodleGame> updateASDPrediction(@PathVariable Long id, @RequestBody Boolean asd) {
        DanceDoodleGame updatedRecord = service.updateASDPrediction(id, asd);
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
        return ResponseEntity.ok("Dance Doodle Game Service is running!");
    }
}

