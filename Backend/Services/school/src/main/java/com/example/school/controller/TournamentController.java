package com.example.school.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.dto.TournamentCreateRequest;
import com.example.school.dto.TournamentResponse;
import com.example.school.service.TournamentService;

@RestController
@RequestMapping("/api/school/tournaments")
@CrossOrigin(origins = "*")
public class TournamentController {
    
    @Autowired
    private TournamentService tournamentService;
    
    /**
     * Create tournaments for a specific grade
     */
    @PostMapping("/create")
    public ResponseEntity<List<TournamentResponse>> createTournaments(
            @RequestBody TournamentCreateRequest request,
            @RequestParam Long schoolId) {
        try {
            List<TournamentResponse> tournaments = tournamentService.createTournaments(request, schoolId);
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            System.err.println("Error creating tournaments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all tournaments for a school
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<TournamentResponse>> getTournamentsBySchool(@PathVariable Long schoolId) {
        try {
            List<TournamentResponse> tournaments = tournamentService.getTournamentsBySchool(schoolId);
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            System.err.println("Error fetching tournaments by school: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tournaments for a specific child
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<TournamentResponse>> getTournamentsByChild(@PathVariable Long childId) {
        try {
            List<TournamentResponse> tournaments = tournamentService.getTournamentsByChild(childId);
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            System.err.println("Error fetching tournaments by child: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tournaments by school and child
     */
    @GetMapping("/school/{schoolId}/child/{childId}")
    public ResponseEntity<List<TournamentResponse>> getTournamentsBySchoolAndChild(
            @PathVariable Long schoolId,
            @PathVariable Long childId) {
        try {
            List<TournamentResponse> tournaments = tournamentService.getTournamentsBySchoolAndChild(schoolId, childId);
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            System.err.println("Error fetching tournaments by school and child: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tournaments by grade level
     */
    @GetMapping("/school/{schoolId}/grade/{gradeLevel}")
    public ResponseEntity<List<TournamentResponse>> getTournamentsByGrade(
            @PathVariable Long schoolId,
            @PathVariable String gradeLevel) {
        try {
            List<TournamentResponse> tournaments = tournamentService.getTournamentsByGrade(schoolId, gradeLevel);
            return ResponseEntity.ok(tournaments);
        } catch (Exception e) {
            System.err.println("Error fetching tournaments by grade: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update tournament status
     */
    @PutMapping("/{tournamentId}/status")
    public ResponseEntity<TournamentResponse> updateTournamentStatus(
            @PathVariable Long tournamentId,
            @RequestParam String status) {
        try {
            TournamentResponse tournament = tournamentService.updateTournamentStatus(tournamentId, status);
            return ResponseEntity.ok(tournament);
        } catch (Exception e) {
            System.err.println("Error updating tournament status: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete a tournament
     */
    @DeleteMapping("/{tournamentId}")
    public ResponseEntity<Void> deleteTournament(@PathVariable Long tournamentId) {
        try {
            tournamentService.deleteTournament(tournamentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error deleting tournament: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tournament by ID
     */
    @GetMapping("/{tournamentId}")
    public ResponseEntity<TournamentResponse> getTournamentById(@PathVariable Long tournamentId) {
        try {
            TournamentResponse tournament = tournamentService.getTournamentById(tournamentId);
            if (tournament != null) {
                return ResponseEntity.ok(tournament);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error getting tournament by ID: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tournament details with leaderboard and statistics
     */
    @GetMapping("/{tournamentId}/details")
    public ResponseEntity<Map<String, Object>> getTournamentDetails(@PathVariable Long tournamentId) {
        try {
            System.err.println("=== TOURNAMENT DETAILS ENDPOINT CALLED ===");
            System.err.println("Tournament ID: " + tournamentId);
            
            Map<String, Object> tournamentDetails = tournamentService.getTournamentDetails(tournamentId);
            
            System.err.println("Tournament details generated successfully");
            return ResponseEntity.ok(tournamentDetails);
        } catch (Exception e) {
            System.err.println("Error getting tournament details: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Health check for tournament service
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Tournament Service is running!");
    }

    /**
     * Get all sessions for a specific child from all game services
     */
    @GetMapping("/child/{childId}/sessions")
    public ResponseEntity<Map<String, Object>> getChildSessions(@PathVariable String childId) {
        try {
            Map<String, Object> result = tournamentService.getChildSessionsFromAllGames(childId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch child sessions: " + e.getMessage()));
        }
    }
}

