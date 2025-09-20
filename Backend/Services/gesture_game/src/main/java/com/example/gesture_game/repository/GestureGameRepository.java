package com.example.gesture_game.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.gesture_game.entity.GestureGame;

@Repository
public interface GestureGameRepository extends JpaRepository<GestureGame, Long> {
    
    // Find all records by session ID
    List<GestureGame> findBySessionId(String sessionId);
    
    // Find all records by child ID
    List<GestureGame> findByChildId(String childId);
    
    // Find by school task ID and child ID
    List<GestureGame> findBySchoolTaskIdAndChildId(String schoolTaskId, String childId);
    
    // Find by tournament ID and child ID
    List<GestureGame> findByTournamentIdAndChildId(Long tournamentId, String childId);
    
    // Find all sessions by tournament ID
    List<GestureGame> findByTournamentId(Long tournamentId);
    
    // Delete all sessions by school task ID
    void deleteBySchoolTaskId(String schoolTaskId);
    
    // Find paginated records by child ID, ordered by date
    Page<GestureGame> findByChildIdOrderByDateTimeDesc(String childId, Pageable pageable);
    
    // Find all records by child ID, ordered by date
    List<GestureGame> findByChildIdOrderByDateTimeDesc(String childId);
    
    // Find all records where training is allowed
    List<GestureGame> findByIsTrainingAllowedTrue();
    
    // Find all records by suspected ASD status
    List<GestureGame> findBySuspectedASD(Boolean suspectedASD);
    
    // Custom query to get statistics by child
    @Query("SELECT g FROM GestureGame g WHERE g.childId = :childId ORDER BY g.dateTime DESC")
    List<GestureGame> findGameHistoryByChildId(@Param("childId") String childId);
    
    // Custom query to get average completion times for all gestures
    @Query("SELECT AVG(g.thumbs_up), AVG(g.thumbs_down), AVG(g.victory), AVG(g.butterfly), AVG(g.spectacle), AVG(g.heart), AVG(g.pointing_up), AVG(g.iloveyou), AVG(g.dua), AVG(g.closed_fist), AVG(g.open_palm) FROM GestureGame g")
    List<Object[]> getAverageCompletionTimes();
    
    // Custom query to get average completion times for a specific child
    @Query("SELECT AVG(g.thumbs_up), AVG(g.thumbs_down), AVG(g.victory), AVG(g.butterfly), AVG(g.spectacle), AVG(g.heart), AVG(g.pointing_up), AVG(g.iloveyou), AVG(g.dua), AVG(g.closed_fist), AVG(g.open_palm) FROM GestureGame g WHERE g.childId = :childId")
    List<Object[]> getAverageCompletionTimesByChild(@Param("childId") String childId);
    
    // Custom query to get records where specific gesture was completed
    @Query("SELECT g FROM GestureGame g WHERE g.thumbs_up IS NOT NULL OR g.thumbs_down IS NOT NULL OR g.victory IS NOT NULL OR g.butterfly IS NOT NULL OR g.spectacle IS NOT NULL OR g.heart IS NOT NULL OR g.pointing_up IS NOT NULL OR g.iloveyou IS NOT NULL OR g.dua IS NOT NULL OR g.closed_fist IS NOT NULL OR g.open_palm IS NOT NULL")
    List<GestureGame> getCompletedGestures();
    
    // Custom query to get training data (where isTrainingAllowed = true)
    @Query("SELECT g FROM GestureGame g WHERE g.isTrainingAllowed = true")
    List<GestureGame> getTrainingData();
    
    // Count total games played by child
    @Query("SELECT COUNT(g) FROM GestureGame g WHERE g.childId = :childId")
    Long countGamesByChildId(@Param("childId") String childId);
    
    // Get total completion time for each gesture by child
    @Query("SELECT SUM(g.thumbs_up), SUM(g.thumbs_down), SUM(g.victory), SUM(g.butterfly), SUM(g.spectacle), SUM(g.heart), SUM(g.pointing_up), SUM(g.iloveyou), SUM(g.dua), SUM(g.closed_fist), SUM(g.open_palm) FROM GestureGame g WHERE g.childId = :childId")
    List<Object[]> getTotalCompletionTimesByChild(@Param("childId") String childId);
    
    // Get count of completed gestures by child
    @Query("SELECT COUNT(CASE WHEN g.thumbs_up IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.thumbs_down IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.victory IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.butterfly IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.spectacle IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.heart IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.pointing_up IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.iloveyou IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.dua IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.closed_fist IS NOT NULL THEN 1 END), " +
           "COUNT(CASE WHEN g.open_palm IS NOT NULL THEN 1 END) " +
           "FROM GestureGame g WHERE g.childId = :childId")
    List<Object[]> getGestureCompletionCountsByChild(@Param("childId") String childId);
    
    // Get recent games for trend analysis (last 10 games)
    @Query("SELECT g FROM GestureGame g WHERE g.childId = :childId ORDER BY g.dateTime DESC")
    List<GestureGame> getRecentGamesByChildId(@Param("childId") String childId);
    
    // Get best performance (lowest completion time) for each gesture by child
    @Query("SELECT MIN(g.thumbs_up), MIN(g.thumbs_down), MIN(g.victory), MIN(g.butterfly), MIN(g.spectacle), MIN(g.heart), MIN(g.pointing_up), MIN(g.iloveyou), MIN(g.dua), MIN(g.closed_fist), MIN(g.open_palm) FROM GestureGame g WHERE g.childId = :childId")
    List<Object[]> getBestPerformanceByChild(@Param("childId") String childId);
    
    // Get worst performance (highest completion time) for each gesture by child
    @Query("SELECT MAX(g.thumbs_up), MAX(g.thumbs_down), MAX(g.victory), MAX(g.butterfly), MAX(g.spectacle), MAX(g.heart), MAX(g.pointing_up), MAX(g.iloveyou), MAX(g.dua), MAX(g.closed_fist), MAX(g.open_palm) FROM GestureGame g WHERE g.childId = :childId")
    List<Object[]> getWorstPerformanceByChild(@Param("childId") String childId);
}
