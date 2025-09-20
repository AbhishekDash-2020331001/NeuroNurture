package com.example.mirror_posture_game.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.mirror_posture_game.entity.MirrorPostureGame;

@Repository
public interface MirrorPostureGameRepository extends JpaRepository<MirrorPostureGame, Long> {
    
    // Find all records by session ID
    List<MirrorPostureGame> findBySessionId(String sessionId);
    
    // Find all records by child ID
    List<MirrorPostureGame> findByChildId(String childId);
    
    // Find by school task ID and child ID
    List<MirrorPostureGame> findBySchoolTaskIdAndChildId(String schoolTaskId, String childId);
    
    // Find by tournament ID and child ID
    List<MirrorPostureGame> findByTournamentIdAndChildId(Long tournamentId, String childId);
    
    // Find all sessions by tournament ID
    List<MirrorPostureGame> findByTournamentId(Long tournamentId);
    
    // Delete all sessions by school task ID
    void deleteBySchoolTaskId(String schoolTaskId);
    
    // Find paginated records by child ID, ordered by date
    Page<MirrorPostureGame> findByChildIdOrderByDateTimeDesc(String childId, Pageable pageable);
    
    // Find all records by child ID, ordered by date
    List<MirrorPostureGame> findByChildIdOrderByDateTimeDesc(String childId);
    
    // Find all records where training is allowed
    List<MirrorPostureGame> findByIsTrainingAllowedTrue();
    
    // Find all records by suspected ASD status
    List<MirrorPostureGame> findBySuspectedASD(Boolean suspectedASD);
    
    // Custom query to get statistics by child
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.childId = :childId ORDER BY m.dateTime DESC")
    List<MirrorPostureGame> findGameHistoryByChildId(@Param("childId") String childId);
    
    // Custom query to get average completion times for all postures
    @Query("SELECT AVG(m.lookingSideways), AVG(m.mouthOpen), AVG(m.showingTeeth), AVG(m.kiss) FROM MirrorPostureGame m")
    List<Object[]> getAverageCompletionTimes();
    
    // Custom query to get average completion times for a specific child
    @Query("SELECT AVG(m.lookingSideways), AVG(m.mouthOpen), AVG(m.showingTeeth), AVG(m.kiss) FROM MirrorPostureGame m WHERE m.childId = :childId")
    List<Object[]> getAverageCompletionTimesByChild(@Param("childId") String childId);
    
    // Custom query to get posture completion counts for a specific child
    @Query("SELECT COUNT(CASE WHEN m.lookingSideways IS NOT NULL THEN 1 END), COUNT(CASE WHEN m.mouthOpen IS NOT NULL THEN 1 END), COUNT(CASE WHEN m.showingTeeth IS NOT NULL THEN 1 END), COUNT(CASE WHEN m.kiss IS NOT NULL THEN 1 END) FROM MirrorPostureGame m WHERE m.childId = :childId")
    List<Object[]> getPostureCompletionCountsByChild(@Param("childId") String childId);
    
    // Custom query to get recent games by child ID
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.childId = :childId ORDER BY m.dateTime DESC LIMIT 2")
    List<MirrorPostureGame> getRecentGamesByChildId(@Param("childId") String childId);
    
    // Custom query to get best performance by child
    @Query("SELECT MIN(m.lookingSideways), MIN(m.mouthOpen), MIN(m.showingTeeth), MIN(m.kiss) FROM MirrorPostureGame m WHERE m.childId = :childId AND m.lookingSideways IS NOT NULL AND m.mouthOpen IS NOT NULL AND m.showingTeeth IS NOT NULL AND m.kiss IS NOT NULL")
    List<Object[]> getBestPerformanceByChild(@Param("childId") String childId);
    
    // Custom query to get worst performance by child
    @Query("SELECT MAX(m.lookingSideways), MAX(m.mouthOpen), MAX(m.showingTeeth), MAX(m.kiss) FROM MirrorPostureGame m WHERE m.childId = :childId AND m.lookingSideways IS NOT NULL AND m.mouthOpen IS NOT NULL AND m.showingTeeth IS NOT NULL AND m.kiss IS NOT NULL")
    List<Object[]> getWorstPerformanceByChild(@Param("childId") String childId);
    
    // Custom query to count games by child ID
    @Query("SELECT COUNT(m) FROM MirrorPostureGame m WHERE m.childId = :childId")
    Long countGamesByChildId(@Param("childId") String childId);
    
    // Custom query to get records where specific posture was completed
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.lookingSideways IS NOT NULL OR m.mouthOpen IS NOT NULL OR m.showingTeeth IS NOT NULL OR m.kiss IS NOT NULL")
    List<MirrorPostureGame> getCompletedPostures();
    
    // Custom query to get training data (where isTrainingAllowed = true)
    @Query("SELECT m FROM MirrorPostureGame m WHERE m.isTrainingAllowed = true")
    List<MirrorPostureGame> getTrainingData();
} 