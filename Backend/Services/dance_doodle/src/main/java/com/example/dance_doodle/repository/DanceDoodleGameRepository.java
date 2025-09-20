package com.example.dance_doodle.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.dance_doodle.entity.DanceDoodleGame;

@Repository
public interface DanceDoodleGameRepository extends JpaRepository<DanceDoodleGame, Long> {
    
    // Find by session ID
    List<DanceDoodleGame> findBySessionId(String sessionId);
    
    // Find by child ID
    List<DanceDoodleGame> findByChildId(String childId);
    
    // Find by suspected ASD status
    List<DanceDoodleGame> findBySuspectedASD(Boolean suspectedASD);
    
    // Get paginated game history by child ID
    Page<DanceDoodleGame> findByChildIdOrderByDateTimeDesc(String childId, Pageable pageable);
    
    // Get game history by child ID
    List<DanceDoodleGame> findByChildIdOrderByDateTimeDesc(String childId);
    
    // Get training data (where isTrainingAllowed is true)
    List<DanceDoodleGame> findByIsTrainingAllowedTrue();
    
    // Get completed games (where at least one pose was completed)
    @Query("SELECT d FROM DanceDoodleGame d WHERE " +
           "d.cool_arms IS NOT NULL OR d.open_wings IS NOT NULL OR " +
           "d.silly_boxer IS NOT NULL OR d.happy_stand IS NOT NULL OR " +
           "d.crossy_play IS NOT NULL OR d.shh_fun IS NOT NULL OR " +
           "d.stretch IS NOT NULL")
    List<DanceDoodleGame> findCompletedGames();
    
    // Get average completion times for all poses
    @Query("SELECT " +
           "AVG(CASE WHEN d.cool_arms IS NOT NULL THEN d.cool_arms END) as cool_arms_avg, " +
           "AVG(CASE WHEN d.open_wings IS NOT NULL THEN d.open_wings END) as open_wings_avg, " +
           "AVG(CASE WHEN d.silly_boxer IS NOT NULL THEN d.silly_boxer END) as silly_boxer_avg, " +
           "AVG(CASE WHEN d.happy_stand IS NOT NULL THEN d.happy_stand END) as happy_stand_avg, " +
           "AVG(CASE WHEN d.crossy_play IS NOT NULL THEN d.crossy_play END) as crossy_play_avg, " +
           "AVG(CASE WHEN d.shh_fun IS NOT NULL THEN d.shh_fun END) as shh_fun_avg, " +
           "AVG(CASE WHEN d.stretch IS NOT NULL THEN d.stretch END) as stretch_avg " +
           "FROM DanceDoodleGame d")
    List<Object[]> getAverageCompletionTimes();
    
    // Get child statistics
    @Query("SELECT " +
           "COUNT(d) as totalGames, " +
           "AVG(CASE WHEN d.cool_arms IS NOT NULL THEN d.cool_arms END) as cool_arms_avg, " +
           "AVG(CASE WHEN d.open_wings IS NOT NULL THEN d.open_wings END) as open_wings_avg, " +
           "AVG(CASE WHEN d.silly_boxer IS NOT NULL THEN d.silly_boxer END) as silly_boxer_avg, " +
           "AVG(CASE WHEN d.happy_stand IS NOT NULL THEN d.happy_stand END) as happy_stand_avg, " +
           "AVG(CASE WHEN d.crossy_play IS NOT NULL THEN d.crossy_play END) as crossy_play_avg, " +
           "AVG(CASE WHEN d.shh_fun IS NOT NULL THEN d.shh_fun END) as shh_fun_avg, " +
           "AVG(CASE WHEN d.stretch IS NOT NULL THEN d.stretch END) as stretch_avg, " +
           "COUNT(CASE WHEN d.cool_arms IS NOT NULL THEN 1 END) as cool_arms_count, " +
           "COUNT(CASE WHEN d.open_wings IS NOT NULL THEN 1 END) as open_wings_count, " +
           "COUNT(CASE WHEN d.silly_boxer IS NOT NULL THEN 1 END) as silly_boxer_count, " +
           "COUNT(CASE WHEN d.happy_stand IS NOT NULL THEN 1 END) as happy_stand_count, " +
           "COUNT(CASE WHEN d.crossy_play IS NOT NULL THEN 1 END) as crossy_play_count, " +
           "COUNT(CASE WHEN d.shh_fun IS NOT NULL THEN 1 END) as shh_fun_count, " +
           "COUNT(CASE WHEN d.stretch IS NOT NULL THEN 1 END) as stretch_count " +
           "FROM DanceDoodleGame d WHERE d.childId = :childId")
    List<Object[]> getChildStatistics(@Param("childId") String childId);
    
    // Find by school task ID and child ID
    List<DanceDoodleGame> findBySchoolTaskIdAndChildId(String schoolTaskId, String childId);
    
    // Find by tournament ID and child ID
    List<DanceDoodleGame> findByTournamentIdAndChildId(Long tournamentId, String childId);
    
    // Find all sessions by tournament ID
    List<DanceDoodleGame> findByTournamentId(Long tournamentId);
    
    // Delete all sessions by school task ID
    void deleteBySchoolTaskId(String schoolTaskId);
}

