package com.example.school.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.school.entity.SchoolTournament;

@Repository
public interface SchoolTournamentRepository extends JpaRepository<SchoolTournament, Long> {
    
    // Find all tournaments for a specific school
    List<SchoolTournament> findBySchoolId(Long schoolId);
    
    // Find all tournaments for a specific child
    List<SchoolTournament> findByChildId(Long childId);
    
    // Find tournaments by school and child
    List<SchoolTournament> findBySchoolIdAndChildId(Long schoolId, Long childId);
    
    // Find tournaments by status
    List<SchoolTournament> findBySchoolIdAndStatus(Long schoolId, String status);
    
    // Find tournaments by child and status
    List<SchoolTournament> findByChildIdAndStatus(Long childId, String status);
    
    // Find tournaments by tournament_id
    List<SchoolTournament> findByTournamentId(Long tournamentId);
    
    // Find tournaments by school and tournament_id
    List<SchoolTournament> findBySchoolIdAndTournamentId(Long schoolId, Long tournamentId);
    
    // Find tournaments by grade level
    List<SchoolTournament> findBySchoolIdAndGradeLevel(Long schoolId, String gradeLevel);
    
    // Find tournaments by school, grade level and status
    List<SchoolTournament> findBySchoolIdAndGradeLevelAndStatus(Long schoolId, String gradeLevel, String status);
    
    // Delete all tournaments by tournament_id
    void deleteByTournamentId(Long tournamentId);
    
    // Note: Bit-mapped game queries are handled in the service layer
    // since HQL doesn't support bitwise operations directly
}

