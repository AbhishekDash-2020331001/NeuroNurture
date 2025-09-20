package com.example.repeat_with_me_game.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.repeat_with_me_game.entity.RepeatWithMeGame;

@Repository
public interface RepeatWithMeGameRepository extends JpaRepository<RepeatWithMeGame, Long> {
    
    List<RepeatWithMeGame> findByChildId(String childId);
    
    // Find by school task ID and child ID
    List<RepeatWithMeGame> findBySchoolTaskIdAndChildId(String schoolTaskId, String childId);
    
    // Find by tournament ID and child ID
    List<RepeatWithMeGame> findByTournamentIdAndChildId(Long tournamentId, String childId);
    
    // Find all sessions by tournament ID
    List<RepeatWithMeGame> findByTournamentId(Long tournamentId);
    
    // Delete all sessions by school task ID
    void deleteBySchoolTaskId(String schoolTaskId);
    
    List<RepeatWithMeGame> findBySessionId(String sessionId);
    
    List<RepeatWithMeGame> findByIsTrainingAllowedTrue();
    
    List<RepeatWithMeGame> findBySuspectedASD(Boolean suspectedASD);
    
    Page<RepeatWithMeGame> findByChildIdOrderByDateTimeDesc(String childId, Pageable pageable);
    
    List<RepeatWithMeGame> findByChildIdOrderByDateTimeDesc(String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId")
    Long countByChildId(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.averageScore) FROM RepeatWithMeGame r WHERE r.childId = :childId")
    Double getAverageScoreByChildId(@Param("childId") String childId);
    
    @Query("SELECT MAX(r.averageScore) FROM RepeatWithMeGame r WHERE r.childId = :childId")
    Double getBestScoreByChildId(@Param("childId") String childId);
    
    @Query("SELECT MIN(r.averageScore) FROM RepeatWithMeGame r WHERE r.childId = :childId")
    Double getWorstScoreByChildId(@Param("childId") String childId);
    
    @Query("SELECT r FROM RepeatWithMeGame r WHERE r.childId = :childId ORDER BY r.dateTime DESC")
    List<RepeatWithMeGame> findRecentGamesByChildId(@Param("childId") String childId, Pageable pageable);
    
    @Query("SELECT AVG(r.round1Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round1Score IS NOT NULL")
    Double getAverageRound1Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round2Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round2Score IS NOT NULL")
    Double getAverageRound2Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round3Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round3Score IS NOT NULL")
    Double getAverageRound3Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round4Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round4Score IS NOT NULL")
    Double getAverageRound4Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round5Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round5Score IS NOT NULL")
    Double getAverageRound5Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round6Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round6Score IS NOT NULL")
    Double getAverageRound6Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round7Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round7Score IS NOT NULL")
    Double getAverageRound7Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round8Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round8Score IS NOT NULL")
    Double getAverageRound8Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round9Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round9Score IS NOT NULL")
    Double getAverageRound9Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round10Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round10Score IS NOT NULL")
    Double getAverageRound10Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round11Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round11Score IS NOT NULL")
    Double getAverageRound11Score(@Param("childId") String childId);
    
    @Query("SELECT AVG(r.round12Score) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round12Score IS NOT NULL")
    Double getAverageRound12Score(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round1Score IS NOT NULL")
    Long getRound1CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round2Score IS NOT NULL")
    Long getRound2CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round3Score IS NOT NULL")
    Long getRound3CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round4Score IS NOT NULL")
    Long getRound4CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round5Score IS NOT NULL")
    Long getRound5CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round6Score IS NOT NULL")
    Long getRound6CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round7Score IS NOT NULL")
    Long getRound7CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round8Score IS NOT NULL")
    Long getRound8CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round9Score IS NOT NULL")
    Long getRound9CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round10Score IS NOT NULL")
    Long getRound10CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round11Score IS NOT NULL")
    Long getRound11CompletionCount(@Param("childId") String childId);
    
    @Query("SELECT COUNT(r) FROM RepeatWithMeGame r WHERE r.childId = :childId AND r.round12Score IS NOT NULL")
    Long getRound12CompletionCount(@Param("childId") String childId);
}
