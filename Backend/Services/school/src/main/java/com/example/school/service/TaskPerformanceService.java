package com.example.school.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.school.dto.TaskPerformanceDto;
import com.example.school.entity.SchoolTask;
import com.example.school.repository.SchoolTaskRepository;

@Service
public class TaskPerformanceService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private SchoolTaskRepository schoolTaskRepository;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082/api/parents";
    private static final String DANCE_DOODLE_URL = "http://localhost:8087/api/dance-doodle";
    private static final String GAZE_GAME_URL = "http://localhost:8086/api/gaze-game";
    private static final String GESTURE_GAME_URL = "http://localhost:8084/api/gesture-game";
    private static final String MIRROR_POSTURE_URL = "http://localhost:8083/api/mirror-posture-game";
    private static final String REPEAT_WITH_ME_URL = "http://localhost:8089/api/repeat-with-me-game";
    
    public List<TaskPerformanceDto> getTaskPerformance(String taskId, String schoolId) {
        try {
            // Get all children assigned to this task
            List<Map<String, Object>> children = getChildrenForTask(taskId, schoolId);
            
            // Get the task details to find which games were selected
            List<String> selectedGames = getSelectedGamesForTask(taskId, schoolId);
            System.err.println("Selected games for task " + taskId + ": " + selectedGames);
            
            List<TaskPerformanceDto> performanceData = new ArrayList<>();
            
            for (Map<String, Object> child : children) {
                String childId = child.get("id").toString();
                String childName = child.get("name").toString();
                String grade = child.get("grade") != null ? child.get("grade").toString() : "Not Assigned";
                String parentName = child.get("parentName") != null ? child.get("parentName").toString() : "Unknown";
                
                // Get performance only for selected games
                List<TaskPerformanceDto.GamePerformanceDto> gamePerformances = new ArrayList<>();
                
                for (String gameName : selectedGames) {
                    TaskPerformanceDto.GamePerformanceDto gamePerformance = null;
                    
                    switch (gameName) {
                        case "Dance Doodle":
                            gamePerformance = getDanceDoodlePerformance(childId, taskId);
                            break;
                        case "Gaze Game":
                            gamePerformance = getGazeGamePerformance(childId, taskId);
                            break;
                        case "Gesture Game":
                            gamePerformance = getGestureGamePerformance(childId, taskId);
                            break;
                        case "Mirror Posture Game":
                            gamePerformance = getMirrorPosturePerformance(childId, taskId);
                            break;
                        case "Repeat With Me Game":
                            gamePerformance = getRepeatWithMePerformance(childId, taskId);
                            break;
                    }
                    
                    if (gamePerformance != null) {
                        gamePerformances.add(gamePerformance);
                    }
                }
                
                TaskPerformanceDto performance = new TaskPerformanceDto();
                performance.setChildId(childId);
                performance.setChildName(childName);
                performance.setGrade(grade);
                performance.setParentName(parentName);
                performance.setGames(gamePerformances);
                
                performanceData.add(performance);
            }
            
            return performanceData;
            
        } catch (Exception e) {
            System.err.println("Error fetching task performance: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private List<Map<String, Object>> getChildrenForTask(String taskId, String schoolId) {
        try {
            // Get children assigned to this specific task from school_task table
            Long taskIdLong = Long.parseLong(taskId);
            Long schoolIdLong = Long.parseLong(schoolId);
            
            List<SchoolTask> schoolTasks = schoolTaskRepository.findBySchoolIdAndTaskId(schoolIdLong, taskIdLong);
            
            if (schoolTasks.isEmpty()) {
                System.err.println("No children found assigned to task " + taskId + " for school " + schoolId);
                return new ArrayList<>();
            }
            
            // Extract unique child IDs from the school tasks
            List<Long> childIds = schoolTasks.stream()
                .map(SchoolTask::getChildId)
                .distinct()
                .collect(Collectors.toList());
            
            System.err.println("Found " + childIds.size() + " children assigned to task " + taskId + ": " + childIds);
            
            // Get child details from parent service for each assigned child
            List<Map<String, Object>> children = new ArrayList<>();
            for (Long childId : childIds) {
                try {
                    String url = PARENT_SERVICE_URL + "/children/" + childId;
                    Map<String, Object> child = restTemplate.getForObject(url, Map.class);
                    if (child != null) {
                        children.add(child);
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching child " + childId + " details: " + e.getMessage());
                }
            }
            
            return children;
        } catch (Exception e) {
            System.err.println("Error fetching children for task: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private List<String> getSelectedGamesForTask(String taskId, String schoolId) {
        try {
            Long taskIdLong = Long.parseLong(taskId);
            Long schoolIdLong = Long.parseLong(schoolId);
            
            // Get any task record for this task to find the selected games
            List<SchoolTask> schoolTasks = schoolTaskRepository.findBySchoolIdAndTaskId(schoolIdLong, taskIdLong);
            
            if (schoolTasks.isEmpty()) {
                System.err.println("No task found for taskId: " + taskId + ", schoolId: " + schoolId);
                return new ArrayList<>();
            }
            
            // Get the gameId from the first task (all tasks for the same task_id have the same gameId)
            Integer gameId = schoolTasks.get(0).getGameId();
            System.err.println("Game ID for task " + taskId + ": " + gameId);
            
            // Convert bit-mapped gameId to list of selected games
            List<String> selectedGames = new ArrayList<>();
            
            // Game bit mapping (same as in TaskService)
            if ((gameId & 1) != 0) selectedGames.add("Dance Doodle");        // 0th bit
            if ((gameId & 2) != 0) selectedGames.add("Gaze Game");           // 1st bit
            if ((gameId & 4) != 0) selectedGames.add("Gesture Game");         // 2nd bit
            if ((gameId & 8) != 0) selectedGames.add("Mirror Posture Game");  // 3rd bit
            if ((gameId & 16) != 0) selectedGames.add("Repeat With Me Game"); // 4th bit
            
            return selectedGames;
        } catch (Exception e) {
            System.err.println("Error getting selected games for task: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
    
    private TaskPerformanceDto.GamePerformanceDto getDanceDoodlePerformance(String childId, String taskId) {
        try {
            String url = DANCE_DOODLE_URL + "/sessions/task/" + taskId + "/child/" + childId;
            List<Map<String, Object>> sessions = restTemplate.getForObject(url, List.class);
            
            if (sessions == null || sessions.isEmpty()) {
                return createEmptyGamePerformance("dance-doodle", "Dance Doodle");
            }
            
            // Calculate total completion time (sum of all pose times)
            List<Double> totalTimes = sessions.stream()
                .map(session -> {
                    double totalTime = 0;
                    if (session.get("cool_arms") != null) totalTime += ((Number) session.get("cool_arms")).doubleValue();
                    if (session.get("open_wings") != null) totalTime += ((Number) session.get("open_wings")).doubleValue();
                    if (session.get("silly_boxer") != null) totalTime += ((Number) session.get("silly_boxer")).doubleValue();
                    if (session.get("happy_stand") != null) totalTime += ((Number) session.get("happy_stand")).doubleValue();
                    if (session.get("crossy_play") != null) totalTime += ((Number) session.get("crossy_play")).doubleValue();
                    if (session.get("shh_fun") != null) totalTime += ((Number) session.get("shh_fun")).doubleValue();
                    if (session.get("stretch") != null) totalTime += ((Number) session.get("stretch")).doubleValue();
                    return totalTime;
                })
                .collect(Collectors.toList());
            
            Double bestScore = totalTimes.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
            String lastPlayed = sessions.stream()
                .map(session -> session.get("dateTime").toString())
                .max(String::compareTo)
                .orElse(null);
            
            List<TaskPerformanceDto.ScoreHistoryDto> scoreHistory = sessions.stream()
                .map(session -> {
                    double totalTime = 0;
                    if (session.get("cool_arms") != null) totalTime += ((Number) session.get("cool_arms")).doubleValue();
                    if (session.get("open_wings") != null) totalTime += ((Number) session.get("open_wings")).doubleValue();
                    if (session.get("silly_boxer") != null) totalTime += ((Number) session.get("silly_boxer")).doubleValue();
                    if (session.get("happy_stand") != null) totalTime += ((Number) session.get("happy_stand")).doubleValue();
                    if (session.get("crossy_play") != null) totalTime += ((Number) session.get("crossy_play")).doubleValue();
                    if (session.get("shh_fun") != null) totalTime += ((Number) session.get("shh_fun")).doubleValue();
                    if (session.get("stretch") != null) totalTime += ((Number) session.get("stretch")).doubleValue();
                    
                    String dateTime = session.get("dateTime").toString();
                    String[] parts = dateTime.split("T");
                    return new TaskPerformanceDto.ScoreHistoryDto(
                        totalTime,
                        parts[0],
                        parts.length > 1 ? parts[1].substring(0, 8) : "00:00:00"
                    );
                })
                .collect(Collectors.toList());
            
            return new TaskPerformanceDto.GamePerformanceDto(
                "dance-doodle",
                "Dance Doodle",
                !sessions.isEmpty(),
                bestScore,
                sessions.size(),
                lastPlayed,
                scoreHistory
            );
            
        } catch (Exception e) {
            System.err.println("Error fetching Dance Doodle performance: " + e.getMessage());
            return createEmptyGamePerformance("dance-doodle", "Dance Doodle");
        }
    }
    
    private TaskPerformanceDto.GamePerformanceDto getGazeGamePerformance(String childId, String taskId) {
        try {
            String url = GAZE_GAME_URL + "/sessions/task/" + taskId + "/child/" + childId;
            List<Map<String, Object>> sessions = restTemplate.getForObject(url, List.class);
            
            if (sessions == null || sessions.isEmpty()) {
                return createEmptyGamePerformance("gaze-tracking", "Gaze Tracking");
            }
            
            // Calculate total balloon pop count (sum of all rounds)
            List<Integer> totalCounts = sessions.stream()
                .map(session -> {
                    int total = 0;
                    if (session.get("round1Count") != null) total += ((Number) session.get("round1Count")).intValue();
                    if (session.get("round2Count") != null) total += ((Number) session.get("round2Count")).intValue();
                    if (session.get("round3Count") != null) total += ((Number) session.get("round3Count")).intValue();
                    return total;
                })
                .collect(Collectors.toList());
            
            int bestScore = totalCounts.stream().mapToInt(Integer::intValue).max().orElse(0);
            String lastPlayed = sessions.stream()
                .map(session -> session.get("dateTime").toString())
                .max(String::compareTo)
                .orElse(null);
            
            List<TaskPerformanceDto.ScoreHistoryDto> scoreHistory = sessions.stream()
                .map(session -> {
                    int total = 0;
                    if (session.get("round1Count") != null) total += ((Number) session.get("round1Count")).intValue();
                    if (session.get("round2Count") != null) total += ((Number) session.get("round2Count")).intValue();
                    if (session.get("round3Count") != null) total += ((Number) session.get("round3Count")).intValue();
                    
                    String dateTime = session.get("dateTime").toString();
                    String[] parts = dateTime.split("T");
                    return new TaskPerformanceDto.ScoreHistoryDto(
                        (double) total,
                        parts[0],
                        parts.length > 1 ? parts[1].substring(0, 8) : "00:00:00"
                    );
                })
                .collect(Collectors.toList());
            
            return new TaskPerformanceDto.GamePerformanceDto(
                "gaze-tracking",
                "Gaze Tracking",
                !sessions.isEmpty(),
                (double) bestScore,
                sessions.size(),
                lastPlayed,
                scoreHistory
            );
            
        } catch (Exception e) {
            System.err.println("Error fetching Gaze Game performance: " + e.getMessage());
            return createEmptyGamePerformance("gaze-tracking", "Gaze Tracking");
        }
    }
    
    private TaskPerformanceDto.GamePerformanceDto getGestureGamePerformance(String childId, String taskId) {
        try {
            String url = GESTURE_GAME_URL + "/sessions/task/" + taskId + "/child/" + childId;
            List<Map<String, Object>> sessions = restTemplate.getForObject(url, List.class);
            
            if (sessions == null || sessions.isEmpty()) {
                return createEmptyGamePerformance("gesture-control", "Gesture Control");
            }
            
            // Calculate total completion time (sum of all gesture times)
            List<Double> totalTimes = sessions.stream()
                .map(session -> {
                    double totalTime = 0;
                    if (session.get("thumbs_up") != null) totalTime += ((Number) session.get("thumbs_up")).doubleValue();
                    if (session.get("thumbs_down") != null) totalTime += ((Number) session.get("thumbs_down")).doubleValue();
                    if (session.get("victory") != null) totalTime += ((Number) session.get("victory")).doubleValue();
                    if (session.get("butterfly") != null) totalTime += ((Number) session.get("butterfly")).doubleValue();
                    if (session.get("spectacle") != null) totalTime += ((Number) session.get("spectacle")).doubleValue();
                    if (session.get("heart") != null) totalTime += ((Number) session.get("heart")).doubleValue();
                    if (session.get("pointing_up") != null) totalTime += ((Number) session.get("pointing_up")).doubleValue();
                    if (session.get("iloveyou") != null) totalTime += ((Number) session.get("iloveyou")).doubleValue();
                    if (session.get("dua") != null) totalTime += ((Number) session.get("dua")).doubleValue();
                    if (session.get("closed_fist") != null) totalTime += ((Number) session.get("closed_fist")).doubleValue();
                    if (session.get("open_palm") != null) totalTime += ((Number) session.get("open_palm")).doubleValue();
                    return totalTime;
                })
                .collect(Collectors.toList());
            
            Double bestScore = totalTimes.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
            String lastPlayed = sessions.stream()
                .map(session -> session.get("dateTime").toString())
                .max(String::compareTo)
                .orElse(null);
            
            List<TaskPerformanceDto.ScoreHistoryDto> scoreHistory = sessions.stream()
                .map(session -> {
                    double totalTime = 0;
                    if (session.get("thumbs_up") != null) totalTime += ((Number) session.get("thumbs_up")).doubleValue();
                    if (session.get("thumbs_down") != null) totalTime += ((Number) session.get("thumbs_down")).doubleValue();
                    if (session.get("victory") != null) totalTime += ((Number) session.get("victory")).doubleValue();
                    if (session.get("butterfly") != null) totalTime += ((Number) session.get("butterfly")).doubleValue();
                    if (session.get("spectacle") != null) totalTime += ((Number) session.get("spectacle")).doubleValue();
                    if (session.get("heart") != null) totalTime += ((Number) session.get("heart")).doubleValue();
                    if (session.get("pointing_up") != null) totalTime += ((Number) session.get("pointing_up")).doubleValue();
                    if (session.get("iloveyou") != null) totalTime += ((Number) session.get("iloveyou")).doubleValue();
                    if (session.get("dua") != null) totalTime += ((Number) session.get("dua")).doubleValue();
                    if (session.get("closed_fist") != null) totalTime += ((Number) session.get("closed_fist")).doubleValue();
                    if (session.get("open_palm") != null) totalTime += ((Number) session.get("open_palm")).doubleValue();
                    
                    String dateTime = session.get("dateTime").toString();
                    String[] parts = dateTime.split("T");
                    return new TaskPerformanceDto.ScoreHistoryDto(
                        totalTime,
                        parts[0],
                        parts.length > 1 ? parts[1].substring(0, 8) : "00:00:00"
                    );
                })
                .collect(Collectors.toList());
            
            return new TaskPerformanceDto.GamePerformanceDto(
                "gesture-control",
                "Gesture Control",
                !sessions.isEmpty(),
                bestScore,
                sessions.size(),
                lastPlayed,
                scoreHistory
            );
            
        } catch (Exception e) {
            System.err.println("Error fetching Gesture Game performance: " + e.getMessage());
            return createEmptyGamePerformance("gesture-control", "Gesture Control");
        }
    }
    
    private TaskPerformanceDto.GamePerformanceDto getMirrorPosturePerformance(String childId, String taskId) {
        try {
            String url = MIRROR_POSTURE_URL + "/sessions/task/" + taskId + "/child/" + childId;
            List<Map<String, Object>> sessions = restTemplate.getForObject(url, List.class);
            
            if (sessions == null || sessions.isEmpty()) {
                return createEmptyGamePerformance("mirror-posture", "Mirror Posture");
            }
            
            // Calculate total completion time (sum of all posture times)
            List<Double> totalTimes = sessions.stream()
                .map(session -> {
                    double totalTime = 0;
                    if (session.get("lookingSideways") != null) totalTime += ((Number) session.get("lookingSideways")).doubleValue();
                    if (session.get("mouthOpen") != null) totalTime += ((Number) session.get("mouthOpen")).doubleValue();
                    if (session.get("showingTeeth") != null) totalTime += ((Number) session.get("showingTeeth")).doubleValue();
                    if (session.get("kiss") != null) totalTime += ((Number) session.get("kiss")).doubleValue();
                    return totalTime;
                })
                .collect(Collectors.toList());
            
            Double bestScore = totalTimes.stream().mapToDouble(Double::doubleValue).min().orElse(0.0);
            String lastPlayed = sessions.stream()
                .map(session -> session.get("dateTime").toString())
                .max(String::compareTo)
                .orElse(null);
            
            List<TaskPerformanceDto.ScoreHistoryDto> scoreHistory = sessions.stream()
                .map(session -> {
                    double totalTime = 0;
                    if (session.get("lookingSideways") != null) totalTime += ((Number) session.get("lookingSideways")).doubleValue();
                    if (session.get("mouthOpen") != null) totalTime += ((Number) session.get("mouthOpen")).doubleValue();
                    if (session.get("showingTeeth") != null) totalTime += ((Number) session.get("showingTeeth")).doubleValue();
                    if (session.get("kiss") != null) totalTime += ((Number) session.get("kiss")).doubleValue();
                    
                    String dateTime = session.get("dateTime").toString();
                    String[] parts = dateTime.split("T");
                    return new TaskPerformanceDto.ScoreHistoryDto(
                        totalTime,
                        parts[0],
                        parts.length > 1 ? parts[1].substring(0, 8) : "00:00:00"
                    );
                })
                .collect(Collectors.toList());
            
            return new TaskPerformanceDto.GamePerformanceDto(
                "mirror-posture",
                "Mirror Posture",
                !sessions.isEmpty(),
                bestScore,
                sessions.size(),
                lastPlayed,
                scoreHistory
            );
            
        } catch (Exception e) {
            System.err.println("Error fetching Mirror Posture performance: " + e.getMessage());
            return createEmptyGamePerformance("mirror-posture", "Mirror Posture");
        }
    }
    
    private TaskPerformanceDto.GamePerformanceDto getRepeatWithMePerformance(String childId, String taskId) {
        try {
            String url = REPEAT_WITH_ME_URL + "/sessions/task/" + taskId + "/child/" + childId;
            List<Map<String, Object>> sessions = restTemplate.getForObject(url, List.class);
            
            if (sessions == null || sessions.isEmpty()) {
                return createEmptyGamePerformance("repeat-with-me", "Repeat With Me");
            }
            
            // Calculate average score over all rounds
            List<Double> averageScores = sessions.stream()
                .map(session -> {
                    Double avgScore = (Double) session.get("averageScore");
                    return avgScore != null ? avgScore : 0.0;
                })
                .collect(Collectors.toList());
            
            Double bestScore = averageScores.stream().mapToDouble(Double::doubleValue).max().orElse(0.0);
            String lastPlayed = sessions.stream()
                .map(session -> session.get("dateTime").toString())
                .max(String::compareTo)
                .orElse(null);
            
            List<TaskPerformanceDto.ScoreHistoryDto> scoreHistory = sessions.stream()
                .map(session -> {
                    Double avgScore = (Double) session.get("averageScore");
                    double score = avgScore != null ? avgScore : 0.0;
                    
                    String dateTime = session.get("dateTime").toString();
                    String[] parts = dateTime.split("T");
                    return new TaskPerformanceDto.ScoreHistoryDto(
                        score,
                        parts[0],
                        parts.length > 1 ? parts[1].substring(0, 8) : "00:00:00"
                    );
                })
                .collect(Collectors.toList());
            
            return new TaskPerformanceDto.GamePerformanceDto(
                "repeat-with-me",
                "Repeat With Me",
                !sessions.isEmpty(),
                bestScore,
                sessions.size(),
                lastPlayed,
                scoreHistory
            );
            
        } catch (Exception e) {
            System.err.println("Error fetching Repeat With Me performance: " + e.getMessage());
            return createEmptyGamePerformance("repeat-with-me", "Repeat With Me");
        }
    }
    
    private TaskPerformanceDto.GamePerformanceDto createEmptyGamePerformance(String gameId, String gameName) {
        return new TaskPerformanceDto.GamePerformanceDto(
            gameId,
            gameName,
            false,
            null,
            0,
            null,
            new ArrayList<>()
        );
    }
}
