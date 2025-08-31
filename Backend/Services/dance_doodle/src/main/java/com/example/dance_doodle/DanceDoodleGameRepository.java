package com.example.dance_doodle;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
           "d.silly_boxer IS NOT NULL OR d.happy_stand_left IS NOT NULL OR " +
           "d.happy_stand_right IS NOT NULL OR d.crossy_play IS NOT NULL OR " +
           "d.shh_fun IS NOT NULL OR d.stretch_left IS NOT NULL OR " +
           "d.stretch_right IS NOT NULL")
    List<DanceDoodleGame> findCompletedGames();
    
    // Get average completion times for all poses
    @Query("SELECT " +
           "AVG(d.cool_arms) as cool_arms_avg, " +
           "AVG(d.open_wings) as open_wings_avg, " +
           "AVG(d.silly_boxer) as silly_boxer_avg, " +
           "AVG(d.happy_stand_left) as happy_stand_left_avg, " +
           "AVG(d.happy_stand_right) as happy_stand_right_avg, " +
           "AVG(d.crossy_play) as crossy_play_avg, " +
           "AVG(d.shh_fun) as shh_fun_avg, " +
           "AVG(d.stretch_left) as stretch_left_avg, " +
           "AVG(d.stretch_right) as stretch_right_avg " +
           "FROM DanceDoodleGame d " +
           "WHERE d.cool_arms IS NOT NULL OR d.open_wings IS NOT NULL OR " +
           "d.silly_boxer IS NOT NULL OR d.happy_stand_left IS NOT NULL OR " +
           "d.happy_stand_right IS NOT NULL OR d.crossy_play IS NOT NULL OR " +
           "d.shh_fun IS NOT NULL OR d.stretch_left IS NOT NULL OR " +
           "d.stretch_right IS NOT NULL")
    List<Object[]> getAverageCompletionTimes();
    
    // Get child statistics
    @Query("SELECT " +
           "COUNT(d) as totalGames, " +
           "AVG(d.cool_arms) as cool_arms_avg, " +
           "AVG(d.open_wings) as open_wings_avg, " +
           "AVG(d.silly_boxer) as silly_boxer_avg, " +
           "AVG(d.happy_stand_left) as happy_stand_left_avg, " +
           "AVG(d.happy_stand_right) as happy_stand_right_avg, " +
           "AVG(d.crossy_play) as crossy_play_avg, " +
           "AVG(d.shh_fun) as shh_fun_avg, " +
           "AVG(d.stretch_left) as stretch_left_avg, " +
           "AVG(d.stretch_right) as stretch_right_avg, " +
           "COUNT(CASE WHEN d.cool_arms IS NOT NULL THEN 1 END) as cool_arms_count, " +
           "COUNT(CASE WHEN d.open_wings IS NOT NULL THEN 1 END) as open_wings_count, " +
           "COUNT(CASE WHEN d.silly_boxer IS NOT NULL THEN 1 END) as silly_boxer_count, " +
           "COUNT(CASE WHEN d.happy_stand_left IS NOT NULL THEN 1 END) as happy_stand_left_count, " +
           "COUNT(CASE WHEN d.happy_stand_right IS NOT NULL THEN 1 END) as happy_stand_right_count, " +
           "COUNT(CASE WHEN d.crossy_play IS NOT NULL THEN 1 END) as crossy_play_count, " +
           "COUNT(CASE WHEN d.shh_fun IS NOT NULL THEN 1 END) as shh_fun_count, " +
           "COUNT(CASE WHEN d.stretch_left IS NOT NULL THEN 1 END) as stretch_left_count, " +
           "COUNT(CASE WHEN d.stretch_right IS NOT NULL THEN 1 END) as stretch_right_count " +
           "FROM DanceDoodleGame d WHERE d.childId = :childId")
    List<Object[]> getChildStatistics(@Param("childId") String childId);
}

