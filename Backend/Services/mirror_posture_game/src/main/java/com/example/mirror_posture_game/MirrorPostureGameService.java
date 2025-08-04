package com.example.mirror_posture_game;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        gameRecord.setLookingLeft(request.getLookingLeft());
        gameRecord.setLookingRight(request.getLookingRight());
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
} 