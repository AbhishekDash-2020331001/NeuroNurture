package com.example.gesture_game;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GestureGameService {
    
    @Autowired
    private GestureGameRepository repository;
    
    // Save a new game record
    public GestureGame saveGameRecord(GestureGameRequest request) {
        GestureGame gameRecord = new GestureGame();
        gameRecord.setSessionId(request.getSessionId());
        gameRecord.setDateTime(request.getDateTime() != null ? request.getDateTime() : java.time.LocalDateTime.now());
        gameRecord.setChildId(request.getChildId());
        gameRecord.setAge(request.getAge());
        gameRecord.setThumbs_up(request.getThumbs_up());
        gameRecord.setThumbs_down(request.getThumbs_down());
        gameRecord.setVictory(request.getVictory());
        gameRecord.setButterfly(request.getButterfly());
        gameRecord.setSpectacle(request.getSpectacle());
        gameRecord.setHeart(request.getHeart());
        gameRecord.setPointing_up(request.getPointing_up());
        gameRecord.setIloveyou(request.getIloveyou());
        gameRecord.setDua(request.getDua());
        gameRecord.setClosed_fist(request.getClosed_fist());
        gameRecord.setOpen_palm(request.getOpen_palm());
        gameRecord.setVideoURL(request.getVideoURL());
        gameRecord.setIsTrainingAllowed(request.getIsTrainingAllowed());
        gameRecord.setSuspectedASD(request.getSuspectedASD());
        gameRecord.setIsASD(request.getIsASD());
        
        return repository.save(gameRecord);
    }
    
    // Get all records
    public List<GestureGame> getAllRecords() {
        return repository.findAll();
    }
    
    // Get record by ID
    public Optional<GestureGame> getRecordById(Long id) {
        return repository.findById(id);
    }
    
    // Get records by session ID
    public List<GestureGame> getRecordsBySessionId(String sessionId) {
        return repository.findBySessionId(sessionId);
    }
    
    // Get records by child ID
    public List<GestureGame> getRecordsByChildId(String childId) {
        return repository.findByChildId(childId);
    }
    
    // Get training data (where isTrainingAllowed = true)
    public List<GestureGame> getTrainingData() {
        return repository.getTrainingData();
    }
    
    // Get records by suspected ASD status
    public List<GestureGame> getRecordsBySuspectedASD(Boolean suspectedASD) {
        return repository.findBySuspectedASD(suspectedASD);
    }
    
    // Get game history by child ID
    public List<GestureGame> getGameHistoryByChildId(String childId) {
        return repository.findGameHistoryByChildId(childId);
    }
    
    // Get average completion times for all gestures
    public List<Object[]> getAverageCompletionTimes() {
        return repository.getAverageCompletionTimes();
    }
    
    // Get records where gestures were completed
    public List<GestureGame> getCompletedGestures() {
        return repository.getCompletedGestures();
    }
    
    // Update ASD prediction (for ML model)
    public GestureGame updateASDPrediction(Long id, Boolean isASD) {
        Optional<GestureGame> optionalRecord = repository.findById(id);
        if (optionalRecord.isPresent()) {
            GestureGame record = optionalRecord.get();
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
