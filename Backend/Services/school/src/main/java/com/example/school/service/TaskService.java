package com.example.school.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.school.dto.ChildGameStatsDto;
import com.example.school.dto.RecentActivityDto;
import com.example.school.dto.TaskCreateRequest;
import com.example.school.dto.TaskResponse;
import com.example.school.entity.SchoolTask;
import com.example.school.repository.SchoolTaskRepository;

@Service
public class TaskService {
    
    @Autowired
    private SchoolTaskRepository taskRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    // Game mapping for bit operations
    private static final Map<String, Integer> GAME_BIT_MAPPING = new HashMap<>();
    static {
        GAME_BIT_MAPPING.put("Dance Doodle", 1);        // 0th bit (2^0 = 1)
        GAME_BIT_MAPPING.put("Gaze Game", 2);           // 1st bit (2^1 = 2)
        GAME_BIT_MAPPING.put("Gesture Game", 4);         // 2nd bit (2^2 = 4)
        GAME_BIT_MAPPING.put("Mirror Posture Game", 8);  // 3rd bit (2^3 = 8)
        GAME_BIT_MAPPING.put("Repeat With Me Game", 16); // 4th bit (2^4 = 16)
    }
    
    private static final Map<Integer, String> BIT_TO_GAME_MAPPING = new HashMap<>();
    static {
        BIT_TO_GAME_MAPPING.put(1, "Dance Doodle");
        BIT_TO_GAME_MAPPING.put(2, "Gaze Game");
        BIT_TO_GAME_MAPPING.put(4, "Gesture Game");
        BIT_TO_GAME_MAPPING.put(8, "Mirror Posture Game");
        BIT_TO_GAME_MAPPING.put(16, "Repeat With Me Game");
    }
    
    /**
     * Create tasks for multiple children
     */
    public List<TaskResponse> createTasks(TaskCreateRequest request, Long schoolId) {
        // Calculate game ID using bit mapping
        Integer gameId = calculateGameId(request.getSelectedGames());
        
        // Generate a unique task_id for this task assignment
        // Concatenate timestamp with school_id to ensure uniqueness across schools
        Long taskId = Long.parseLong(System.currentTimeMillis() + "" + schoolId);
        
        List<SchoolTask> tasks = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        // Create a task for each child with the same task_id
        for (Long childId : request.getChildIds()) {
            SchoolTask task = new SchoolTask();
            task.setTaskId(taskId); // Same task_id for all children
            task.setSchoolId(schoolId);
            task.setChildId(childId);
            task.setGameId(gameId);
            task.setTaskTitle(request.getTaskTitle());
            task.setTaskDescription(request.getTaskDescription());
            task.setStartTime(request.getStartTime());
            task.setEndTime(request.getEndTime());
            task.setStatus("ASSIGNED");
            task.setCreatedAt(now);
            task.setUpdatedAt(now);
            
            tasks.add(task);
        }
        
        // Save all tasks
        List<SchoolTask> savedTasks = taskRepository.saveAll(tasks);
        
        // Group the saved tasks and return grouped response
        return groupTasksByContent(savedTasks);
    }
    
    /**
     * Get all tasks for a school (grouped by task content)
     */
    public List<TaskResponse> getTasksBySchool(Long schoolId) {
        List<SchoolTask> tasks = taskRepository.findBySchoolId(schoolId);
        return groupTasksByContent(tasks);
    }
    
    /**
     * Get tasks for a specific child
     */
    public List<TaskResponse> getTasksByChild(Long childId) {
        List<SchoolTask> tasks = taskRepository.findByChildId(childId);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get tasks by school and child
     */
    public List<TaskResponse> getTasksBySchoolAndChild(Long schoolId, Long childId) {
        List<SchoolTask> tasks = taskRepository.findBySchoolIdAndChildId(schoolId, childId);
        return tasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Update task status
     */
    public TaskResponse updateTaskStatus(Long taskId, String status) {
        SchoolTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        
        task.setStatus(status);
        task.setUpdatedAt(LocalDateTime.now());
        
        SchoolTask updatedTask = taskRepository.save(task);
        return convertToTaskResponse(updatedTask);
    }
    
    /**
     * Delete a task by task_id (removes all entries for this task_id and associated game sessions)
     */
    @Transactional
    public void deleteTask(Long taskId) {
        try {
            // First, delete all game sessions associated with this task
            deleteGameSessionsForTask(taskId);
            
            // Then delete all school_task entries
            taskRepository.deleteByTaskId(taskId);
            
            System.err.println("Successfully deleted task " + taskId + " and all associated game sessions");
        } catch (Exception e) {
            System.err.println("Error deleting task " + taskId + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to delete task and associated data", e);
        }
    }
    
    /**
     * Delete game sessions for a specific task from all game services
     */
    private void deleteGameSessionsForTask(Long taskId) {
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
                    String deleteUrl = serviceUrl + "/sessions/task/" + taskId;
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
            System.err.println("Error in deleteGameSessionsForTask: " + e.getMessage());
            e.printStackTrace();
            throw e;
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
     * Convert SchoolTask entity to TaskResponse DTO
     */
    private TaskResponse convertToTaskResponse(SchoolTask task) {
        TaskResponse response = new TaskResponse();
        response.setTaskId(task.getTaskId());
        response.setSchoolId(task.getSchoolId());
        response.setChildId(task.getChildId());
        response.setChildName("Child " + task.getChildId()); // TODO: Fetch actual child name from parent service
        response.setGameId(task.getGameId());
        response.setSelectedGames(getSelectedGamesFromGameId(task.getGameId()));
        response.setTaskTitle(task.getTaskTitle());
        response.setTaskDescription(task.getTaskDescription());
        response.setStartTime(task.getStartTime());
        response.setEndTime(task.getEndTime());
        response.setStatus(task.getStatus());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }
    
    /**
     * Get available games
     */
    public List<String> getAvailableGames() {
        return new ArrayList<>(GAME_BIT_MAPPING.keySet());
    }
    
    /**
     * Get game bit mapping for frontend
     */
    public Map<String, Integer> getGameBitMapping() {
        return new HashMap<>(GAME_BIT_MAPPING);
    }
    
    /**
     * Group tasks by task_id (same task assigned to multiple children)
     */
    private List<TaskResponse> groupTasksByContent(List<SchoolTask> tasks) {
        // Group tasks by task_id
        Map<Long, List<SchoolTask>> groupedTasks = tasks.stream()
                .collect(Collectors.groupingBy(SchoolTask::getTaskId));
        
        List<TaskResponse> groupedResponses = new ArrayList<>();
        
        for (Map.Entry<Long, List<SchoolTask>> entry : groupedTasks.entrySet()) {
            List<SchoolTask> taskGroup = entry.getValue();
            SchoolTask firstTask = taskGroup.get(0);
            
            // Create grouped response
            TaskResponse groupedResponse = new TaskResponse();
            groupedResponse.setTaskId(firstTask.getTaskId());
            groupedResponse.setSchoolId(firstTask.getSchoolId());
            groupedResponse.setChildId(null); // No single child for grouped task
            groupedResponse.setChildName(null);
            groupedResponse.setGameId(firstTask.getGameId());
            groupedResponse.setSelectedGames(getSelectedGamesFromGameId(firstTask.getGameId()));
            groupedResponse.setTaskTitle(firstTask.getTaskTitle());
            groupedResponse.setTaskDescription(firstTask.getTaskDescription());
            groupedResponse.setStartTime(firstTask.getStartTime());
            groupedResponse.setEndTime(firstTask.getEndTime());
            groupedResponse.setStatus(firstTask.getStatus());
            groupedResponse.setCreatedAt(firstTask.getCreatedAt());
            groupedResponse.setUpdatedAt(firstTask.getUpdatedAt());
            
            // Add assigned children
            List<TaskResponse.ChildAssignment> assignedChildren = taskGroup.stream()
                    .map(task -> new TaskResponse.ChildAssignment(
                            task.getChildId(),
                            "Child " + task.getChildId(), // TODO: Fetch actual child name
                            task.getStatus(),
                            task.getUpdatedAt()
                    ))
                    .collect(Collectors.toList());
            
            groupedResponse.setAssignedChildren(assignedChildren);
            groupedResponse.setTotalAssigned(taskGroup.size());
            
            // Calculate completion count
            long completedCount = taskGroup.stream()
                    .filter(task -> "COMPLETED".equals(task.getStatus()))
                    .count();
            groupedResponse.setCompletedCount((int) completedCount);
            
            groupedResponses.add(groupedResponse);
        }
        
        return groupedResponses;
    }
    
    /**
     * Find tasks by school and game ID (bit-mapped)
     */
    public List<TaskResponse> getTasksBySchoolAndGame(Long schoolId, Integer gameId) {
        List<SchoolTask> allTasks = taskRepository.findBySchoolId(schoolId);
        List<SchoolTask> filteredTasks = allTasks.stream()
                .filter(task -> (task.getGameId() & gameId) > 0)
                .collect(Collectors.toList());
        
        return filteredTasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Find tasks by child and game ID (bit-mapped)
     */
    public List<TaskResponse> getTasksByChildAndGame(Long childId, Integer gameId) {
        List<SchoolTask> allTasks = taskRepository.findByChildId(childId);
        List<SchoolTask> filteredTasks = allTasks.stream()
                .filter(task -> (task.getGameId() & gameId) > 0)
                .collect(Collectors.toList());
        
        return filteredTasks.stream()
                .map(this::convertToTaskResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get task details including title, description, timeline, and statistics
     */
    public Map<String, Object> getTaskDetails(Long taskId, Long schoolId) {
        try {
            // Get all tasks for this task_id and school_id
            List<SchoolTask> schoolTasks = taskRepository.findBySchoolIdAndTaskId(schoolId, taskId);
            
            if (schoolTasks.isEmpty()) {
                throw new RuntimeException("Task not found");
            }
            
            // Get the first task to extract common details
            SchoolTask firstTask = schoolTasks.get(0);
            
            // Calculate statistics
            int totalAssigned = schoolTasks.size();
            
            // For now, we'll set completed count to 0 since we're not tracking this
            int completedCount = 0;
            
            // Determine task status based on current time
            String status = "active";
            if (completedCount == totalAssigned) {
                status = "completed";
            } else if (firstTask.getEndTime().isBefore(java.time.LocalDateTime.now())) {
                status = "expired";
            }
            
            // Get selected games
            List<String> selectedGames = getSelectedGamesFromGameId(firstTask.getGameId());
            
            // Build response
            Map<String, Object> taskDetails = new HashMap<>();
            taskDetails.put("taskId", firstTask.getTaskId());
            taskDetails.put("title", firstTask.getTaskTitle());
            taskDetails.put("description", firstTask.getTaskDescription());
            taskDetails.put("startDate", firstTask.getStartTime().toString());
            taskDetails.put("endDate", firstTask.getEndTime().toString());
            taskDetails.put("assignedDate", firstTask.getCreatedAt().toString());
            taskDetails.put("status", status);
            taskDetails.put("totalAssigned", totalAssigned);
            taskDetails.put("completedCount", completedCount);
            taskDetails.put("selectedGames", selectedGames);
            
            System.err.println("Task details for task " + taskId + ": " + taskDetails);
            
            return taskDetails;
        } catch (Exception e) {
            System.err.println("Error getting task details: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get task details", e);
        }
    }
    
    public ChildGameStatsDto getChildGameStats(String childId) {
        try {
            String[] gameServices = {
                "http://localhost:8087/api/dance-doodle", // Dance Doodle
                "http://localhost:8086/api/gaze-game", // Gaze Game
                "http://localhost:8084/api/gesture-game", // Gesture Game
                "http://localhost:8083/api/mirror-posture-game", // Mirror Posture Game
                "http://localhost:8089/api/repeat-with-me-game"  // Repeat With Me Game
            };

            int totalSessions = 0;
            java.util.Set<String> uniqueTasks = new java.util.HashSet<>();
            String latestSessionDate = null;

            for (String serviceUrl : gameServices) {
                try {
                    String url = serviceUrl + "/child/" + childId;
                    System.err.println("Fetching child stats from: " + url);
                    ResponseEntity<Object[]> response = restTemplate.getForEntity(url, Object[].class);
                    
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Object[] sessions = response.getBody();
                        if (sessions != null) {
                            totalSessions += sessions.length;
                            
                            for (Object session : sessions) {
                                if (session instanceof Map) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> sessionMap = (Map<String, Object>) session;
                                    System.err.println("Session data: " + sessionMap);
                                    if (sessionMap.containsKey("schoolTaskId") && sessionMap.get("schoolTaskId") != null) {
                                        uniqueTasks.add(sessionMap.get("schoolTaskId").toString());
                                    }
                                    // Try different timestamp field names
                                    String timestamp = null;
                                    if (sessionMap.containsKey("dateTime") && sessionMap.get("dateTime") != null) {
                                        timestamp = sessionMap.get("dateTime").toString();
                                    } else if (sessionMap.containsKey("timestamp") && sessionMap.get("timestamp") != null) {
                                        timestamp = sessionMap.get("timestamp").toString();
                                    } else if (sessionMap.containsKey("createdAt") && sessionMap.get("createdAt") != null) {
                                        timestamp = sessionMap.get("createdAt").toString();
                                    } else if (sessionMap.containsKey("date") && sessionMap.get("date") != null) {
                                        timestamp = sessionMap.get("date").toString();
                                    } else if (sessionMap.containsKey("time") && sessionMap.get("time") != null) {
                                        timestamp = sessionMap.get("time").toString();
                                    }
                                    
                                    if (timestamp != null && !timestamp.isEmpty()) {
                                        System.err.println("Found timestamp: " + timestamp);
                                        if (latestSessionDate == null || timestamp.compareTo(latestSessionDate) > 0) {
                                            latestSessionDate = timestamp;
                                            System.err.println("Updated latest session date to: " + latestSessionDate);
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching sessions from " + serviceUrl + ": " + e.getMessage());
                }
            }

            return new ChildGameStatsDto(totalSessions, uniqueTasks.size(), latestSessionDate);
        } catch (Exception e) {
            System.err.println("Error in getChildGameStats: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get child game stats", e);
        }
    }
    
    public List<RecentActivityDto> getRecentActivity(String childId) {
        try {
            String[] gameServices = {
                "http://localhost:8087/api/dance-doodle", // Dance Doodle
                "http://localhost:8086/api/gaze-game", // Gaze Game
                "http://localhost:8084/api/gesture-game", // Gesture Game
                "http://localhost:8083/api/mirror-posture-game", // Mirror Posture Game
                "http://localhost:8089/api/repeat-with-me-game"  // Repeat With Me Game
            };

            String[] gameNames = {
                "Dance Doodle",
                "Gaze Game", 
                "Gesture Game",
                "Mirror Posture Game",
                "Repeat With Me Game"
            };

            List<RecentActivityDto> allActivities = new ArrayList<>();

            for (int i = 0; i < gameServices.length; i++) {
                try {
                    String url = gameServices[i] + "/child/" + childId;
                    System.err.println("Fetching recent activity from: " + url);
                    ResponseEntity<Object[]> response = restTemplate.getForEntity(url, Object[].class);
                    
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Object[] sessions = response.getBody();
                        if (sessions != null) {
                            // Get the last 3 sessions for this game
                            int sessionsToTake = Math.min(3, sessions.length);
                            for (int j = sessions.length - sessionsToTake; j < sessions.length; j++) {
                                Object session = sessions[j];
                                if (session instanceof Map) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> sessionMap = (Map<String, Object>) session;
                                    
                                    RecentActivityDto activity = new RecentActivityDto();
                                    activity.setGameName(gameNames[i]);
                                    activity.setSessionId(sessionMap.get("sessionId") != null ? sessionMap.get("sessionId").toString() : "N/A");
                                    activity.setTimestamp(sessionMap.get("dateTime") != null ? sessionMap.get("dateTime").toString() : "N/A");
                                    activity.setGameServiceUrl(gameServices[i]);
                                    
                                    // Calculate score based on game type
                                    String score = calculateScore(sessionMap, gameNames[i]);
                                    activity.setScore(score);
                                    
                                    // Determine status
                                    activity.setStatus("completed"); // Assume completed for now
                                    
                                    allActivities.add(activity);
                                }
                            }
                        }
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching recent activity from " + gameServices[i] + ": " + e.getMessage());
                }
            }

            // Sort by timestamp (most recent first) and take only the 3 most recent
            allActivities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
            return allActivities.stream().limit(3).collect(java.util.stream.Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error in getRecentActivity: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to get recent activity", e);
        }
    }
    
    private String calculateScore(Map<String, Object> sessionMap, String gameName) {
        try {
            switch (gameName) {
                case "Dance Doodle":
                    // Calculate average completion time
                    int totalTime = 0;
                    int completedPoses = 0;
                    String[] poses = {"cool_arms", "open_wings", "silly_boxer", "happy_stand", "crossy_play", "shh_fun", "stretch"};
                    for (String pose : poses) {
                        if (sessionMap.containsKey(pose) && sessionMap.get(pose) != null) {
                            totalTime += ((Number) sessionMap.get(pose)).intValue();
                            completedPoses++;
                        }
                    }
                    return completedPoses > 0 ? String.format("%.1fs avg", (double) totalTime / completedPoses) : "N/A";
                    
                case "Gaze Game":
                    // Return total balloons popped
                    if (sessionMap.containsKey("totalBalloonsPopped")) {
                        return sessionMap.get("totalBalloonsPopped").toString() + " balloons";
                    }
                    return "N/A";
                    
                case "Gesture Game":
                    // Calculate average completion time
                    int gestureTotalTime = 0;
                    int completedGestures = 0;
                    String[] gestures = {"thumbs_up", "thumbs_down", "victory", "butterfly", "spectacle", "heart", "pointing_up", "iloveyou", "dua", "closed_fist", "open_palm"};
                    for (String gesture : gestures) {
                        if (sessionMap.containsKey(gesture) && sessionMap.get(gesture) != null) {
                            gestureTotalTime += ((Number) sessionMap.get(gesture)).intValue();
                            completedGestures++;
                        }
                    }
                    return completedGestures > 0 ? String.format("%.1fs avg", (double) gestureTotalTime / completedGestures) : "N/A";
                    
                case "Mirror Posture Game":
                    // Calculate average completion time
                    int postureTotalTime = 0;
                    int completedPostures = 0;
                    String[] postures = {"lookingSideways", "mouthOpen", "showingTeeth", "kiss"};
                    for (String posture : postures) {
                        if (sessionMap.containsKey(posture) && sessionMap.get(posture) != null) {
                            postureTotalTime += ((Number) sessionMap.get(posture)).intValue();
                            completedPostures++;
                        }
                    }
                    return completedPostures > 0 ? String.format("%.1fs avg", (double) postureTotalTime / completedPostures) : "N/A";
                    
                case "Repeat With Me Game":
                    // Return average score
                    if (sessionMap.containsKey("averageScore")) {
                        return String.format("%.1f%%", ((Number) sessionMap.get("averageScore")).doubleValue());
                    }
                    return "N/A";
                    
                default:
                    return "N/A";
            }
        } catch (Exception e) {
            System.err.println("Error calculating score for " + gameName + ": " + e.getMessage());
            return "N/A";
        }
    }
    
}
