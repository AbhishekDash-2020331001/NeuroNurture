package com.example.gaze_game.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.gaze_game.entity.GazeGame;

@Repository
public interface GazeGameRepository extends JpaRepository<GazeGame, Long> {
    
    // Find all records by session ID
    List<GazeGame> findBySessionId(String sessionId);
    
    // Find all records by child ID
    List<GazeGame> findByChildId(String childId);
    
    // Find paginated records by child ID, ordered by date
    Page<GazeGame> findByChildIdOrderByDateTimeDesc(String childId, Pageable pageable);
    
    // Find all records by child ID, ordered by date
    List<GazeGame> findByChildIdOrderByDateTimeDesc(String childId);
    
    // Find all records where training is allowed
    List<GazeGame> findByIsTrainingAllowedTrue();
    
    // Find all records by suspected ASD status
    List<GazeGame> findBySuspectedASD(Boolean suspectedASD);
    
    // Custom query to get game history by child
    @Query("SELECT g FROM GazeGame g WHERE g.childId = :childId ORDER BY g.dateTime DESC")
    List<GazeGame> findGameHistoryByChildId(@Param("childId") String childId);
    
    // Custom query to get round-specific averages
    @Query("SELECT AVG(g.round1Count), AVG(g.round2Count), AVG(g.round3Count) FROM GazeGame g")
    List<Object[]> getRoundAverages();
    
    // Custom query to get round-specific averages for a specific child
    @Query("SELECT AVG(g.round1Count), AVG(g.round2Count), AVG(g.round3Count) FROM GazeGame g WHERE g.childId = :childId")
    List<Object[]> getRoundAveragesByChild(@Param("childId") String childId);
    
    // Custom query to get recent games by child ID
    @Query("SELECT g FROM GazeGame g WHERE g.childId = :childId ORDER BY g.dateTime DESC LIMIT 5")
    List<GazeGame> getRecentGamesByChildId(@Param("childId") String childId);
    
    // Custom query to get best performance by child
    @Query("SELECT MAX(g.round1Count), MAX(g.round2Count), MAX(g.round3Count) FROM GazeGame g WHERE g.childId = :childId")
    List<Object[]> getBestPerformanceByChild(@Param("childId") String childId);
    
    // Custom query to get worst performance by child
    @Query("SELECT MIN(g.round1Count), MIN(g.round2Count), MIN(g.round3Count) FROM GazeGame g WHERE g.childId = :childId")
    List<Object[]> getWorstPerformanceByChild(@Param("childId") String childId);
    
    // Custom query to count games by child ID
    @Query("SELECT COUNT(g) FROM GazeGame g WHERE g.childId = :childId")
    Long countGamesByChildId(@Param("childId") String childId);
    
    // Custom query to get training data (where isTrainingAllowed = true)
    @Query("SELECT g FROM GazeGame g WHERE g.isTrainingAllowed = true")
    List<GazeGame> getTrainingData();
    
    // Custom query to get total games played today
    @Query(value = "SELECT COUNT(*) FROM gaze_game WHERE DATE(date_time) = CURRENT_DATE", nativeQuery = true)
    Long getTodayGamesCount();
    
    // Custom query to get total games played this week
    @Query(value = "SELECT COUNT(*) FROM gaze_game WHERE date_time >= CURRENT_DATE - INTERVAL '7 days'", nativeQuery = true)
    Long getThisWeekGamesCount();
    
    // Custom query to get total games played this month
    @Query(value = "SELECT COUNT(*) FROM gaze_game WHERE date_time >= CURRENT_DATE - INTERVAL '30 days'", nativeQuery = true)
    Long getThisMonthGamesCount();
    
    // Find by school task ID and child ID
    List<GazeGame> findBySchoolTaskIdAndChildId(String schoolTaskId, String childId);
    
    // Find by tournament ID and child ID
    List<GazeGame> findByTournamentIdAndChildId(Long tournamentId, String childId);
    
    // Find all sessions by tournament ID
    List<GazeGame> findByTournamentId(Long tournamentId);
    
    // Delete all sessions by school task ID
    void deleteBySchoolTaskId(String schoolTaskId);
}
