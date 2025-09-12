package com.example.school.service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.school.dto.TaskResponse.ChildAssignment;
import com.example.school.dto.TournamentCreateRequest;
import com.example.school.dto.TournamentResponse;
import com.example.school.entity.SchoolTournament;
import com.example.school.repository.SchoolTournamentRepository;

@Service
public class TournamentService {
    
    @Autowired
    private SchoolTournamentRepository tournamentRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    // Game bit mapping (same as TaskService)
    private static final Map<String, Integer> GAME_BIT_MAPPING = new HashMap<>();
    private static final Map<Integer, String> BIT_TO_GAME_MAPPING = new HashMap<>();
    
    static {
        GAME_BIT_MAPPING.put("Dance Doodle", 1);        // 2^0 = 1
        GAME_BIT_MAPPING.put("Gaze Game", 2);           // 2^1 = 2
        GAME_BIT_MAPPING.put("Gesture Game", 4);        // 2^2 = 4
        GAME_BIT_MAPPING.put("Mirror Posture Game", 8); // 2^3 = 8
        GAME_BIT_MAPPING.put("Repeat With Me Game", 16); // 2^4 = 16
        
        // Reverse mapping
        for (Map.Entry<String, Integer> entry : GAME_BIT_MAPPING.entrySet()) {
            BIT_TO_GAME_MAPPING.put(entry.getValue(), entry.getKey());
        }
    }
    
    /**
     * Create tournaments for all children in a specific grade
     */
    @Transactional
    public List<TournamentResponse> createTournaments(TournamentCreateRequest request, Long schoolId) {
        // Calculate game ID using bit mapping
        Integer gameId = calculateGameId(request.getSelectedGames());
        
        // Generate a unique tournament_id for this tournament assignment
        // Concatenate timestamp with school_id to ensure uniqueness across schools
        Long tournamentId = Long.parseLong(System.currentTimeMillis() + "" + schoolId);
        
        // Get all children from the specified grade in this school
        List<Long> childIds = getChildrenByGrade(schoolId, request.getGradeLevel());
        
        if (childIds.isEmpty()) {
            throw new RuntimeException("No children found for grade: " + request.getGradeLevel());
        }
        
        List<SchoolTournament> tournaments = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Create a tournament for each child with the same tournament_id
        for (Long childId : childIds) {
            SchoolTournament tournament = new SchoolTournament();
            tournament.setTournamentId(tournamentId); // Same tournament_id for all children
            tournament.setSchoolId(schoolId);
            tournament.setChildId(childId);
            tournament.setGameId(gameId);
            tournament.setTournamentTitle(request.getTournamentTitle());
            tournament.setTournamentDescription(request.getTournamentDescription());
            tournament.setGradeLevel(request.getGradeLevel());
            tournament.setStartTime(request.getStartTime());
            tournament.setEndTime(request.getEndTime());
            tournament.setStatus("ASSIGNED");
            tournament.setCreatedAt(now);
            tournament.setUpdatedAt(now);
            
            tournaments.add(tournament);
        }
        
        // Save all tournaments
        List<SchoolTournament> savedTournaments = tournamentRepository.saveAll(tournaments);
        
        // Group the saved tournaments and return grouped response
        return groupTournamentsByContent(savedTournaments);
    }
    
    /**
     * Get all tournaments for a school (grouped by tournament content)
     */
    public List<TournamentResponse> getTournamentsBySchool(Long schoolId) {
        List<SchoolTournament> tournaments = tournamentRepository.findBySchoolId(schoolId);
        return groupTournamentsByContent(tournaments);
    }
    
    /**
     * Get tournaments for a specific child
     */
    public List<TournamentResponse> getTournamentsByChild(Long childId) {
        List<SchoolTournament> tournaments = tournamentRepository.findByChildId(childId);
        return tournaments.stream()
                .map(this::convertToTournamentResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tournaments by school and child
     */
    public List<TournamentResponse> getTournamentsBySchoolAndChild(Long schoolId, Long childId) {
        List<SchoolTournament> tournaments = tournamentRepository.findBySchoolIdAndChildId(schoolId, childId);
        return tournaments.stream()
                .map(this::convertToTournamentResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tournaments by grade level
     */
    public List<TournamentResponse> getTournamentsByGrade(Long schoolId, String gradeLevel) {
        List<SchoolTournament> tournaments = tournamentRepository.findBySchoolIdAndGradeLevel(schoolId, gradeLevel);
        return groupTournamentsByContent(tournaments);
    }
    
    /**
     * Update tournament status
     */
    public TournamentResponse updateTournamentStatus(Long tournamentId, String status) {
        SchoolTournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));
        
        tournament.setStatus(status);
        tournament.setUpdatedAt(LocalDateTime.now());
        
        SchoolTournament updatedTournament = tournamentRepository.save(tournament);
        return convertToTournamentResponse(updatedTournament);
    }
    
    /**
     * Delete a tournament by tournament_id (removes all entries for this tournament_id and associated game sessions)
     */
    @Transactional
    public void deleteTournament(Long tournamentId) {
        try {
            // First, delete all game sessions associated with this tournament
            deleteGameSessionsForTournament(tournamentId);
            
            // Then delete all school_tournament entries
            tournamentRepository.deleteByTournamentId(tournamentId);
            
            System.err.println("Successfully deleted tournament " + tournamentId + " and all associated game sessions");
        } catch (Exception e) {
            System.err.println("Error deleting tournament " + tournamentId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete tournament and associated data", e);
        }
    }
    
    /**
     * Delete game sessions for a specific tournament from all game services
     */
    private void deleteGameSessionsForTournament(Long tournamentId) {
        try {
            // Game service URLs
            String[] gameServices = {
                "http://localhost:8087", // Dance Doodle
                "http://localhost:8086", // Gaze Game
                "http://localhost:8084", // Gesture Game
                "http://localhost:8083", // Mirror Posture Game
                "http://localhost:8089"  // Repeat With Me Game
            };
            
            // Delete sessions from each game service
            for (String serviceUrl : gameServices) {
                try {
                    String deleteUrl = serviceUrl + "/sessions/tournament/" + tournamentId;
                    System.err.println("Deleting sessions from: " + deleteUrl);
                    
                    ResponseEntity<String> response = restTemplate.exchange(
                        deleteUrl,
                        HttpMethod.DELETE,
                        null,
                        String.class
                    );
                    
                    if (response.getStatusCode().is2xxSuccessful()) {
                        System.err.println("Successfully deleted sessions from " + serviceUrl);
                    } else {
                        System.err.println("Failed to delete sessions from " + serviceUrl + ", status: " + response.getStatusCode());
                    }
                } catch (Exception e) {
                    System.err.println("Error deleting sessions from " + serviceUrl + ": " + e.getMessage());
                    // Continue with other services even if one fails
                }
            }
        } catch (Exception e) {
            System.err.println("Error in deleteGameSessionsForTournament: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    /**
     * Get children by grade level from parent service
     */
    private List<Long> getChildrenByGrade(Long schoolId, String gradeLevel) {
        try {
            // Use the existing endpoint to get all children for the school
            String url = "http://localhost:8082/api/parents/schools/" + schoolId + "/children";
            System.err.println("Fetching children from: " + url);
            
            ResponseEntity<Object[]> response = restTemplate.getForEntity(url, Object[].class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Long> childIds = new ArrayList<>();
                Object[] children = response.getBody();
                
                for (Object childObj : children) {
                    if (childObj instanceof Map) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> childMap = (Map<String, Object>) childObj;
                        
                        // Check if the child's grade matches the requested grade
                        String childGrade = (String) childMap.get("grade");
                        if (gradeLevel.equals(childGrade)) {
                            Long childId = ((Number) childMap.get("id")).longValue();
                            childIds.add(childId);
                        }
                    }
                }
                
                System.err.println("Found " + childIds.size() + " children for grade " + gradeLevel);
                return childIds;
            } else {
                System.err.println("Failed to fetch children, status: " + response.getStatusCode());
                return new ArrayList<>();
            }
        } catch (Exception e) {
            System.err.println("Error fetching children by grade: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    /**
     * Calculate game ID using bit mapping
     */
    private Integer calculateGameId(List<String> selectedGames) {
        int gameId = 0;
        for (String game : selectedGames) {
            Integer bitValue = GAME_BIT_MAPPING.get(game);
            if (bitValue != null) {
                gameId |= bitValue; // Set the bit
            }
        }
        return gameId;
    }
    
    /**
     * Convert game ID back to list of selected games
     */
    private List<String> getSelectedGamesFromGameId(Integer gameId) {
        List<String> selectedGames = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : BIT_TO_GAME_MAPPING.entrySet()) {
            if ((gameId & entry.getKey()) != 0) {
                selectedGames.add(entry.getValue());
            }
        }
        return selectedGames;
    }
    
    /**
     * Convert SchoolTournament entity to TournamentResponse DTO
     */
    private TournamentResponse convertToTournamentResponse(SchoolTournament tournament) {
        TournamentResponse response = new TournamentResponse();
        response.setTournamentId(tournament.getTournamentId());
        response.setSchoolId(tournament.getSchoolId());
        response.setChildId(tournament.getChildId());
        response.setGameId(tournament.getGameId());
        response.setSelectedGames(getSelectedGamesFromGameId(tournament.getGameId()));
        response.setTournamentTitle(tournament.getTournamentTitle());
        response.setTournamentDescription(tournament.getTournamentDescription());
        response.setGradeLevel(tournament.getGradeLevel());
        response.setStartTime(tournament.getStartTime());
        response.setEndTime(tournament.getEndTime());
        response.setStatus(tournament.getStatus());
        response.setCreatedAt(tournament.getCreatedAt());
        response.setUpdatedAt(tournament.getUpdatedAt());
        return response;
    }
    
    /**
     * Group tournaments by content (same tournament_id) and return grouped response
     */
    private List<TournamentResponse> groupTournamentsByContent(List<SchoolTournament> tournaments) {
        Map<Long, List<SchoolTournament>> groupedByTournamentId = tournaments.stream()
                .collect(Collectors.groupingBy(SchoolTournament::getTournamentId));
        
        List<TournamentResponse> groupedResponses = new ArrayList<>();
        
        for (Map.Entry<Long, List<SchoolTournament>> entry : groupedByTournamentId.entrySet()) {
            List<SchoolTournament> tournamentGroup = entry.getValue();
            SchoolTournament firstTournament = tournamentGroup.get(0);
            
            TournamentResponse response = new TournamentResponse();
            response.setTournamentId(firstTournament.getTournamentId());
            response.setSchoolId(firstTournament.getSchoolId());
            response.setGameId(firstTournament.getGameId());
            response.setSelectedGames(getSelectedGamesFromGameId(firstTournament.getGameId()));
            response.setTournamentTitle(firstTournament.getTournamentTitle());
            response.setTournamentDescription(firstTournament.getTournamentDescription());
            response.setGradeLevel(firstTournament.getGradeLevel());
            response.setStartTime(firstTournament.getStartTime());
            response.setEndTime(firstTournament.getEndTime());
            response.setStatus(firstTournament.getStatus());
            response.setCreatedAt(firstTournament.getCreatedAt());
            response.setUpdatedAt(firstTournament.getUpdatedAt());
            
            // Add child assignments
            List<ChildAssignment> assignments = tournamentGroup.stream()
                    .map(t -> {
                        ChildAssignment assignment = new ChildAssignment();
                        assignment.setChildId(t.getChildId());
                        assignment.setStatus(t.getStatus());
                        assignment.setLastUpdated(t.getUpdatedAt());
                        return assignment;
                    })
                    .collect(Collectors.toList());
            
            response.setAssignedChildren(assignments);
            response.setTotalAssigned(assignments.size());
            response.setCompletedCount((int) assignments.stream()
                    .filter(a -> "COMPLETED".equals(a.getStatus()))
                    .count());
            
            groupedResponses.add(response);
        }
        
        return groupedResponses;
    }
    
    /**
     * Get tournament details with leaderboard and statistics
     */
    public Map<String, Object> getTournamentDetails(Long tournamentId) {
        try {
            System.err.println("=== FETCHING TOURNAMENT DETAILS ===");
            System.err.println("Tournament ID: " + tournamentId);
            
            // Get tournament basic info
            TournamentResponse tournament = getTournamentById(tournamentId);
            if (tournament == null) {
                System.err.println("Tournament not found, creating fallback data");
                return createFallbackTournamentDetails(tournamentId);
            }
            
            System.err.println("Tournament found: " + tournament.getTournamentTitle());
            
            // Get leaderboard data (with error handling)
            List<Map<String, Object>> leaderboard;
            try {
                leaderboard = getTournamentLeaderboard(tournamentId);
                System.err.println("Leaderboard generated with " + leaderboard.size() + " entries");
            } catch (Exception e) {
                System.err.println("Error getting leaderboard, using empty list: " + e.getMessage());
                leaderboard = new ArrayList<>();
            }
            
            // Get tournament statistics
            Map<String, Object> statistics = getTournamentStatistics(tournamentId);
            
            // Combine all data
            Map<String, Object> details = new HashMap<>();
            details.put("tournament", tournament);
            details.put("leaderboard", leaderboard);
            details.put("statistics", statistics);
            
            System.err.println("✅ Tournament details fetched successfully for tournament: " + tournamentId);
            return details;
            
        } catch (Exception e) {
            System.err.println("❌ Error getting tournament details: " + e.getMessage());
            e.printStackTrace();
            // Return fallback data instead of throwing
            return createFallbackTournamentDetails(tournamentId);
        }
    }
    
    /**
     * Create fallback tournament details when the main method fails
     */
    private Map<String, Object> createFallbackTournamentDetails(Long tournamentId) {
        System.err.println("Creating fallback tournament details for ID: " + tournamentId);
        
        Map<String, Object> details = new HashMap<>();
        
        // Create basic tournament info
        Map<String, Object> tournament = new HashMap<>();
        tournament.put("tournamentId", tournamentId);
        tournament.put("tournamentTitle", "Tournament " + tournamentId);
        tournament.put("tournamentDescription", "Tournament details are being loaded...");
        tournament.put("gradeLevel", "All Grades");
        tournament.put("startTime", "2024-01-01T00:00:00");
        tournament.put("endTime", "2024-12-31T23:59:59");
        tournament.put("status", "ACTIVE");
        tournament.put("selectedGames", new String[]{"dance-doodle", "gaze-game", "gesture-game"});
        
        // Create basic statistics
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalParticipants", 0);
        statistics.put("completedParticipants", 0);
        statistics.put("completionRate", 0.0);
        statistics.put("games", new String[]{"dance-doodle", "gaze-game", "gesture-game"});
        statistics.put("gradeLevel", "All Grades");
        statistics.put("startTime", "2024-01-01T00:00:00");
        statistics.put("endTime", "2024-12-31T23:59:59");
        statistics.put("status", "ACTIVE");
        
        details.put("tournament", tournament);
        details.put("leaderboard", new ArrayList<>());
        details.put("statistics", statistics);
        
        return details;
    }
    
    /**
     * Get tournament by ID from database
     */
    public TournamentResponse getTournamentById(Long tournamentId) {
        try {
            System.err.println("Fetching tournament from database, tournamentId: " + tournamentId);
            
            // Get the first tournament with this tournament_id (they all have the same details)
            List<SchoolTournament> tournaments = tournamentRepository.findByTournamentId(tournamentId);
            if (tournaments.isEmpty()) {
                System.err.println("Tournament not found in database for tournamentId: " + tournamentId);
                return null;
            }
            
            SchoolTournament tournament = tournaments.get(0); // Get the first one
            
            System.err.println("Tournament found: " + tournament.getTournamentTitle());
            
            // Convert to TournamentResponse
            TournamentResponse response = new TournamentResponse();
            response.setTournamentId(tournament.getTournamentId());
            response.setSchoolId(tournament.getSchoolId());
            response.setGameId(tournament.getGameId());
            response.setSelectedGames(Arrays.asList(convertGameBitsToStrings(tournament.getGameId())));
            response.setTournamentTitle(tournament.getTournamentTitle());
            response.setTournamentDescription(tournament.getTournamentDescription());
            response.setGradeLevel(tournament.getGradeLevel());
            response.setStartTime(tournament.getStartTime());
            response.setEndTime(tournament.getEndTime());
            response.setStatus(tournament.getStatus());
            response.setCreatedAt(tournament.getCreatedAt());
            response.setUpdatedAt(tournament.getUpdatedAt());
            
            return response;
        } catch (Exception e) {
            System.err.println("Error fetching tournament by ID: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Convert game bits to string array
     */
    private String[] convertGameBitsToStrings(Integer gameBits) {
        if (gameBits == null || gameBits == 0) {
            return new String[0];
        }
        
        List<String> games = new ArrayList<>();
        for (Map.Entry<Integer, String> entry : BIT_TO_GAME_MAPPING.entrySet()) {
            if ((gameBits & entry.getKey()) != 0) {
                games.add(entry.getValue().toLowerCase().replace(" ", "-"));
            }
        }
        return games.toArray(new String[0]);
    }
    
    /**
     * Get tournament leaderboard
     */
    private List<Map<String, Object>> getTournamentLeaderboard(Long tournamentId) {
        try {
            System.err.println("Fetching game-wise leaderboard for tournament: " + tournamentId);
            
            // Get all game sessions for this tournament from all game services
            String[] gameServices = {
                "http://localhost:8087/api/dance-doodle", // Dance Doodle
                "http://localhost:8086/api/gaze-game", // Gaze Game
                "http://localhost:8084/api/gesture-game", // Gesture Game
                "http://localhost:8083/api/mirror-posture-game", // Mirror Posture Game
                "http://localhost:8089/api/repeat-with-me-game"  // Repeat With Me Game
            };
            
            // Map to store child performance by game
            Map<String, Map<String, Object>> childGameStats = new HashMap<>();
            
            for (String serviceUrl : gameServices) {
                try {
                    String url = serviceUrl + "/sessions/tournament/" + tournamentId;
                    System.err.println("Fetching tournament sessions from: " + url);
                    
                    ResponseEntity<Object[]> response = restTemplate.getForEntity(url, Object[].class);
                    
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Object[] sessions = response.getBody();
                        String gameType = getGameTypeFromUrl(serviceUrl);
                        
                        for (Object sessionObj : sessions) {
                            if (sessionObj instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> session = (Map<String, Object>) sessionObj;
                                
                                String childId = String.valueOf(session.get("childId"));
                                String key = childId + "_" + gameType;
                                
                                // Initialize child-game stats if not exists
                                if (!childGameStats.containsKey(key)) {
                                    childGameStats.put(key, new HashMap<>());
                                    childGameStats.get(key).put("childId", childId);
                                    childGameStats.get(key).put("gameType", gameType);
                                    childGameStats.get(key).put("sessionsPlayed", 0);
                                    childGameStats.get(key).put("bestScore", 0.0);
                                    childGameStats.get(key).put("averageScore", 0.0);
                                    childGameStats.get(key).put("totalScore", 0.0);
                                }
                                
                                // Update child-game stats
                                Map<String, Object> childGameStat = childGameStats.get(key);
                                int sessionsPlayed = (Integer) childGameStat.get("sessionsPlayed") + 1;
                                childGameStat.put("sessionsPlayed", sessionsPlayed);
                                
                                // Calculate score based on game type
                                double score = calculateGameScore(session, gameType);
                                double totalScore = (Double) childGameStat.get("totalScore") + score;
                                childGameStat.put("totalScore", totalScore);
                                
                                // Update best score (for time-based games, lower is better)
                                double currentBest = (Double) childGameStat.get("bestScore");
                                if (sessionsPlayed == 1 || isBetterScore(score, currentBest, gameType)) {
                                    childGameStat.put("bestScore", score);
                                }
                                
                                // Calculate average score
                                double averageScore = totalScore / sessionsPlayed;
                                childGameStat.put("averageScore", averageScore);
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching sessions from " + serviceUrl + ": " + e.getMessage());
                    // Continue with other services
                }
            }
            
            // Convert to list and sort by best performance for each game
            List<Map<String, Object>> leaderboard = new ArrayList<>(childGameStats.values());
            
            // Sort by game type, then by best score (considering game-specific scoring)
            leaderboard.sort((a, b) -> {
                String gameA = (String) a.get("gameType");
                String gameB = (String) b.get("gameType");
                
                // First sort by game type
                int gameComparison = gameA.compareTo(gameB);
                if (gameComparison != 0) {
                    return gameComparison;
                }
                
                // Then sort by best score (considering if lower is better for time-based games)
                double bestScoreA = (Double) a.get("bestScore");
                double bestScoreB = (Double) b.get("bestScore");
                
                if (isTimeBasedGame(gameA)) {
                    // For time-based games, lower time is better
                    return Double.compare(bestScoreA, bestScoreB);
                } else {
                    // For score-based games, higher score is better
                    return Double.compare(bestScoreB, bestScoreA);
                }
            });
            
            // Add ranks and child names
            int currentRank = 1;
            String currentGame = null;
            
            for (Map<String, Object> entry : leaderboard) {
                String gameType = (String) entry.get("gameType");
                
                // Reset rank for new game
                if (!gameType.equals(currentGame)) {
                    currentRank = 1;
                    currentGame = gameType;
                }
                
                entry.put("rank", currentRank++);
                
                // Get child name from parent service
                String childName = getChildName(Long.valueOf((String) entry.get("childId")));
                entry.put("name", childName != null ? childName : "Child " + entry.get("childId"));
                entry.put("avatar", "👤"); // Default avatar
                
                // Add game-specific display info
                entry.put("gameDisplayName", getGameDisplayName(gameType));
                entry.put("performanceMetric", getPerformanceMetricName(gameType));
            }
            
            System.err.println("Game-wise leaderboard generated with " + leaderboard.size() + " entries");
            return leaderboard;
            
        } catch (Exception e) {
            System.err.println("Error getting tournament leaderboard: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    /**
     * Get tournament statistics
     */
    private Map<String, Object> getTournamentStatistics(Long tournamentId) {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Get all tournaments with this tournament_id
            List<SchoolTournament> tournaments = tournamentRepository.findByTournamentId(tournamentId);
            
            if (!tournaments.isEmpty()) {
                SchoolTournament firstTournament = tournaments.get(0);
                
                // Calculate real statistics
                int totalParticipants = tournaments.size();
                int completedParticipants = (int) tournaments.stream()
                    .filter(t -> "COMPLETED".equals(t.getStatus()))
                    .count();
                
                stats.put("totalParticipants", totalParticipants);
                stats.put("completedParticipants", completedParticipants);
                stats.put("games", Arrays.asList(convertGameBitsToStrings(firstTournament.getGameId())));
                stats.put("gradeLevel", firstTournament.getGradeLevel());
                stats.put("startTime", firstTournament.getStartTime().toString());
                stats.put("endTime", firstTournament.getEndTime().toString());
                stats.put("status", firstTournament.getStatus());
                
                // Calculate completion rate
                double completionRate = totalParticipants > 0 ? (double) completedParticipants / totalParticipants * 100 : 0.0;
                stats.put("completionRate", completionRate);
            } else {
                // Fallback statistics
                stats.put("totalParticipants", 0);
                stats.put("completedParticipants", 0);
                stats.put("completionRate", 0.0);
                stats.put("games", new String[]{"dance-doodle", "gaze-game", "gesture-game"});
                stats.put("gradeLevel", "All Grades");
                stats.put("startTime", "2024-01-01T00:00:00");
                stats.put("endTime", "2024-12-31T23:59:59");
                stats.put("status", "ACTIVE");
            }
            
            return stats;
            
        } catch (Exception e) {
            System.err.println("Error getting tournament statistics: " + e.getMessage());
            e.printStackTrace();
            return new HashMap<>();
        }
    }
    
    /**
     * Check if a score is better than the current best score for a specific game type
     */
    private boolean isBetterScore(double newScore, double currentBest, String gameType) {
        if (isTimeBasedGame(gameType)) {
            // For time-based games, lower time is better
            return newScore < currentBest;
        } else {
            // For score-based games, higher score is better
            return newScore > currentBest;
        }
    }
    
    /**
     * Check if a game is time-based (lower is better)
     */
    private boolean isTimeBasedGame(String gameType) {
        return "dance-doodle".equals(gameType) || 
               "mirror-posture-game".equals(gameType) || 
               "gesture-game".equals(gameType);
    }
    
    /**
     * Get display name for game type
     */
    private String getGameDisplayName(String gameType) {
        switch (gameType) {
            case "dance-doodle": return "Dance Doodle";
            case "gaze-game": return "Gaze Game";
            case "gesture-game": return "Gesture Game";
            case "mirror-posture-game": return "Mirror Posture Game";
            case "repeat-with-me-game": return "Repeat With Me Game";
            default: return gameType;
        }
    }
    
    /**
     * Get performance metric name for game type
     */
    private String getPerformanceMetricName(String gameType) {
        switch (gameType) {
            case "dance-doodle":
            case "mirror-posture-game":
            case "gesture-game":
                return "Completion Time (seconds)";
            case "gaze-game":
                return "Balloons Popped";
            case "repeat-with-me-game":
                return "Similarity Score";
            default:
                return "Score";
        }
    }
    
    /**
     * Get game type from service URL
     */
    private String getGameTypeFromUrl(String serviceUrl) {
        if (serviceUrl.contains("dance-doodle")) return "dance-doodle";
        if (serviceUrl.contains("gaze-game")) return "gaze-game";
        if (serviceUrl.contains("gesture-game")) return "gesture-game";
        if (serviceUrl.contains("mirror-posture-game")) return "mirror-posture-game";
        if (serviceUrl.contains("repeat-with-me-game")) return "repeat-with-me-game";
        return "unknown";
    }
    
    /**
     * Calculate game score based on game type
     */
    private double calculateGameScore(Map<String, Object> session, String gameType) {
        try {
            switch (gameType) {
                case "mirror-posture-game":
                    // Sum of 4 posture completion times
                    double lookingSideways = getDoubleValue(session, "lookingSideways");
                    double mouthOpen = getDoubleValue(session, "mouthOpen");
                    double showingTeeth = getDoubleValue(session, "showingTeeth");
                    double kiss = getDoubleValue(session, "kiss");
                    return lookingSideways + mouthOpen + showingTeeth + kiss;
                    
                case "gesture-game":
                    // Sum of 11 gesture completion times
                    double thumbs_up = getDoubleValue(session, "thumbs_up");
                    double thumbs_down = getDoubleValue(session, "thumbs_down");
                    double victory = getDoubleValue(session, "victory");
                    double butterfly = getDoubleValue(session, "butterfly");
                    double spectacle = getDoubleValue(session, "spectacle");
                    double heart = getDoubleValue(session, "heart");
                    double pointing_up = getDoubleValue(session, "pointing_up");
                    double iloveyou = getDoubleValue(session, "iloveyou");
                    double dua = getDoubleValue(session, "dua");
                    double closed_fist = getDoubleValue(session, "closed_fist");
                    double open_palm = getDoubleValue(session, "open_palm");
                    return thumbs_up + thumbs_down + victory + butterfly + spectacle + heart + 
                           pointing_up + iloveyou + dua + closed_fist + open_palm;
                    
                case "repeat-with-me-game":
                    // Average of all 12 round scores
                    double round1Score = getDoubleValue(session, "round1Score");
                    double round2Score = getDoubleValue(session, "round2Score");
                    double round3Score = getDoubleValue(session, "round3Score");
                    double round4Score = getDoubleValue(session, "round4Score");
                    double round5Score = getDoubleValue(session, "round5Score");
                    double round6Score = getDoubleValue(session, "round6Score");
                    double round7Score = getDoubleValue(session, "round7Score");
                    double round8Score = getDoubleValue(session, "round8Score");
                    double round9Score = getDoubleValue(session, "round9Score");
                    double round10Score = getDoubleValue(session, "round10Score");
                    double round11Score = getDoubleValue(session, "round11Score");
                    double round12Score = getDoubleValue(session, "round12Score");
                    
                    int roundsPlayed = 0;
                    double totalScore = 0;
                    
                    if (round1Score > 0) { totalScore += round1Score; roundsPlayed++; }
                    if (round2Score > 0) { totalScore += round2Score; roundsPlayed++; }
                    if (round3Score > 0) { totalScore += round3Score; roundsPlayed++; }
                    if (round4Score > 0) { totalScore += round4Score; roundsPlayed++; }
                    if (round5Score > 0) { totalScore += round5Score; roundsPlayed++; }
                    if (round6Score > 0) { totalScore += round6Score; roundsPlayed++; }
                    if (round7Score > 0) { totalScore += round7Score; roundsPlayed++; }
                    if (round8Score > 0) { totalScore += round8Score; roundsPlayed++; }
                    if (round9Score > 0) { totalScore += round9Score; roundsPlayed++; }
                    if (round10Score > 0) { totalScore += round10Score; roundsPlayed++; }
                    if (round11Score > 0) { totalScore += round11Score; roundsPlayed++; }
                    if (round12Score > 0) { totalScore += round12Score; roundsPlayed++; }
                    
                    return roundsPlayed > 0 ? totalScore / roundsPlayed : 0.0;
                    
                case "gaze-game":
                    // Sum of 3 rounds balloon pop counts
                    double round1Count = getDoubleValue(session, "round1Count");
                    double round2Count = getDoubleValue(session, "round2Count");
                    double round3Count = getDoubleValue(session, "round3Count");
                    return round1Count + round2Count + round3Count;
                    
                case "dance-doodle":
                    // Sum of 7 dance pose completion times
                    double cool_arms = getDoubleValue(session, "cool_arms");
                    double open_wings = getDoubleValue(session, "open_wings");
                    double silly_boxer = getDoubleValue(session, "silly_boxer");
                    double happy_stand = getDoubleValue(session, "happy_stand");
                    double crossy_play = getDoubleValue(session, "crossy_play");
                    double shh_fun = getDoubleValue(session, "shh_fun");
                    double stretch = getDoubleValue(session, "stretch");
                    return cool_arms + open_wings + silly_boxer + happy_stand + crossy_play + shh_fun + stretch;
            }
            return 0.0;
        } catch (Exception e) {
            System.err.println("Error calculating game score: " + e.getMessage());
            return 0.0;
        }
    }
    
    /**
     * Helper method to safely get double value from session data
     */
    private double getDoubleValue(Map<String, Object> session, String key) {
        Object value = session.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }
    
    /**
     * Get child name from parent service
     */
    private String getChildName(Long childId) {
        try {
            String url = "http://localhost:8082/api/parents/children/" + childId;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> child = (Map<String, Object>) response.getBody();
                return (String) child.get("name");
            }
        } catch (Exception e) {
            System.err.println("Error fetching child name for ID " + childId + ": " + e.getMessage());
        }
        return "Child " + childId; // Fallback name
    }

    /**
     * Get all sessions for a specific child from all game services
     */
    public Map<String, Object> getChildSessionsFromAllGames(String childId) {
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> allSessions = new ArrayList<>();
        
        // Game service URLs
        String[] gameServices = {
            "http://localhost:8083/api/mirror-posture-game",
            "http://localhost:8084/api/gesture-game", 
            "http://localhost:8085/api/gaze-game",
            "http://localhost:8086/api/repeat-with-me-game",
            "http://localhost:8087/api/dance-doodle"
        };
        
        String[] gameTypes = {
            "mirror-posture-game",
            "gesture-game",
            "gaze-game", 
            "repeat-with-me-game",
            "dance-doodle"
        };
        
        for (int i = 0; i < gameServices.length; i++) {
            try {
                String url = gameServices[i] + "/child/" + childId;
                ResponseEntity<List> response = restTemplate.getForEntity(url, List.class);
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    List<Map<String, Object>> sessions = response.getBody();
                    for (Map<String, Object> session : sessions) {
                        session.put("gameType", gameTypes[i]);
                        session.put("isCompleted", isSessionCompleted(session, gameTypes[i]));
                        allSessions.add(session);
                    }
                }
            } catch (Exception e) {
                System.err.println("Error fetching sessions from " + gameTypes[i] + ": " + e.getMessage());
            }
        }
        
        // Calculate statistics
        int totalSessions = allSessions.size();
        int completedSessions = (int) allSessions.stream().filter(session -> 
            Boolean.TRUE.equals(session.get("isCompleted"))).count();
        
        // Calculate last played date
        LocalDateTime lastPlayed = allSessions.stream()
            .map(session -> {
                Object dateTime = session.get("dateTime");
                if (dateTime instanceof String) {
                    try {
                        return LocalDateTime.parse((String) dateTime);
                    } catch (Exception e) {
                        return null;
                    }
                }
                return null;
            })
            .filter(Objects::nonNull)
            .max(LocalDateTime::compareTo)
            .orElse(null);
        
        long lastPlayedDaysAgo = 0;
        if (lastPlayed != null) {
            lastPlayedDaysAgo = ChronoUnit.DAYS.between(lastPlayed, LocalDateTime.now());
        }
        
        // Calculate session completion rate
        double completionRate = totalSessions > 0 ? (double) completedSessions / totalSessions * 100 : 0;
        
        // Calculate game session counts
        Map<String, Integer> gameSessionCounts = new HashMap<>();
        Map<String, Integer> completedSessionCounts = new HashMap<>();
        
        for (Map<String, Object> session : allSessions) {
            String gameType = (String) session.get("gameType");
            gameSessionCounts.put(gameType, gameSessionCounts.getOrDefault(gameType, 0) + 1);
            if (Boolean.TRUE.equals(session.get("isCompleted"))) {
                completedSessionCounts.put(gameType, completedSessionCounts.getOrDefault(gameType, 0) + 1);
            }
        }
        
        // Find most and least played games
        String mostPlayedGame = gameSessionCounts.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(entry -> getGameDisplayName(entry.getKey()))
            .orElse("None");
            
        String leastPlayedGame = gameSessionCounts.entrySet().stream()
            .min(Map.Entry.comparingByValue())
            .map(entry -> getGameDisplayName(entry.getKey()))
            .orElse("None");
        
        result.put("totalGameSessions", totalSessions);
        result.put("lastPlayedDaysAgo", lastPlayedDaysAgo);
        result.put("sessionCompletionRate", Math.round(completionRate));
        result.put("mostPlayedGame", mostPlayedGame);
        result.put("leastPlayedGame", leastPlayedGame);
        result.put("gameSessionCounts", gameSessionCounts);
        result.put("completedSessionCounts", completedSessionCounts);
        result.put("sessions", allSessions);
        
        return result;
    }
    
    /**
     * Check if a session is completed based on game type
     */
    private boolean isSessionCompleted(Map<String, Object> session, String gameType) {
        switch (gameType) {
            case "mirror-posture-game":
                return session.get("lookingSideways") != null && 
                       session.get("mouthOpen") != null && 
                       session.get("showingTeeth") != null && 
                       session.get("kiss") != null;

            case "gesture-game":
                return session.get("thumbs_up") != null && 
                       session.get("thumbs_down") != null && 
                       session.get("victory") != null && 
                       session.get("butterfly") != null && 
                       session.get("spectacle") != null && 
                       session.get("heart") != null && 
                       session.get("pointing_up") != null && 
                       session.get("iloveyou") != null && 
                       session.get("dua") != null && 
                       session.get("closed_fist") != null && 
                       session.get("open_palm") != null;

            case "gaze-game":
                return session.get("round1Count") != null && 
                       session.get("round2Count") != null && 
                       session.get("round3Count") != null;

            case "repeat-with-me-game":
                return session.get("round1Score") != null && 
                       session.get("round2Score") != null && 
                       session.get("round3Score") != null && 
                       session.get("round4Score") != null && 
                       session.get("round5Score") != null &&
                       session.get("round6Score") != null &&
                       session.get("round7Score") != null &&
                       session.get("round8Score") != null &&
                       session.get("round9Score") != null &&
                       session.get("round10Score") != null &&
                       session.get("round11Score") != null &&
                       session.get("round12Score") != null;

            case "dance-doodle":
                return session.get("cool_arms") != null && 
                       session.get("open_wings") != null && 
                       session.get("silly_boxer") != null && 
                       session.get("happy_stand") != null && 
                       session.get("crossy_play") != null && 
                       session.get("shh_fun") != null && 
                       session.get("stretch") != null;

            default:
                return false;
        }
    }
}
