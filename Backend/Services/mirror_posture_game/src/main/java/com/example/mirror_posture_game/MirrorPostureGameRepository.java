package com.example.mirror_posture_game;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MirrorPostureGameRepository extends JpaRepository<MirrorPostureGame, Long> {
    
    // Find all records by session ID
    List<MirrorPostureGame> findBySessionId(String sessionId);
    
    // Find all records by child ID
    List<MirrorPostureGame> findByChildId(String childId);
    
    // Find all records where training is allowed
    List<MirrorPostureGame> findByIsTrainingAllowedTrue();
    
    // Find all records by suspected ASD status
    List<MirrorPostureGame> findBySuspectedASD(Boolean suspectedASD);
    
    // Custom query to get statistics by child
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.childId = :childId ORDER BY m.dateTime DESC")
    List<MirrorPostureGame> findGameHistoryByChildId(@Param("childId") String childId);
    
    // Custom query to get average completion times for all postures
    @Query("SELECT AVG(m.lookingLeft), AVG(m.lookingRight), AVG(m.mouthOpen), AVG(m.showingTeeth), AVG(m.kiss) FROM MirrorPostureGame m")
    List<Object[]> getAverageCompletionTimes();
    
    // Custom query to get records where specific posture was completed
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.lookingLeft IS NOT NULL OR m.lookingRight IS NOT NULL OR m.mouthOpen IS NOT NULL OR m.showingTeeth IS NOT NULL OR m.kiss IS NOT NULL")
    List<MirrorPostureGame> getCompletedPostures();
    
    // Custom query to get training data (where isTrainingAllowed = true)
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.isTrainingAllowed = true")
    List<MirrorPostureGame> getTrainingData();
} 