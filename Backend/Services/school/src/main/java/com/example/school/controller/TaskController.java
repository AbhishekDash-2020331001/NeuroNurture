package com.example.school.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.example.school.dto.ChildGameStatsDto;
import com.example.school.dto.RecentActivityDto;
import com.example.school.dto.TaskCreateRequest;
import com.example.school.dto.TaskResponse;
import com.example.school.service.TaskService;

@RestController
@RequestMapping("/api/school/tasks")
@CrossOrigin(origins = "*")
public class TaskController {
    
    @Autowired
    private TaskService taskService;
    
    /**
     * Create new tasks for multiple children
     */
    @PostMapping("/create")
    public ResponseEntity<List<TaskResponse>> createTasks(
            @RequestBody TaskCreateRequest request,
            @RequestParam Long schoolId) {
        try {
            List<TaskResponse> tasks = taskService.createTasks(request, schoolId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get all tasks for a school
     */
    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<TaskResponse>> getTasksBySchool(@PathVariable Long schoolId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksBySchool(schoolId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tasks for a specific child
     */
    @GetMapping("/child/{childId}")
    public ResponseEntity<List<TaskResponse>> getTasksByChild(@PathVariable Long childId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksByChild(childId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tasks by school and child
     */
    @GetMapping("/school/{schoolId}/child/{childId}")
    public ResponseEntity<List<TaskResponse>> getTasksBySchoolAndChild(
            @PathVariable Long schoolId, 
            @PathVariable Long childId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksBySchoolAndChild(schoolId, childId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Update task status
     */
    @PutMapping("/{taskId}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long taskId, 
            @RequestParam String status) {
        try {
            TaskResponse task = taskService.updateTaskStatus(taskId, status);
            return ResponseEntity.ok(task);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Delete a task
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        try {
            taskService.deleteTask(taskId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get available games
     */
    @GetMapping("/games")
    public ResponseEntity<List<String>> getAvailableGames() {
        try {
            List<String> games = taskService.getAvailableGames();
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get game bit mapping
     */
    @GetMapping("/games/mapping")
    public ResponseEntity<Map<String, Integer>> getGameBitMapping() {
        try {
            Map<String, Integer> mapping = taskService.getGameBitMapping();
            return ResponseEntity.ok(mapping);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tasks by school and game ID (bit-mapped)
     */
    @GetMapping("/school/{schoolId}/game/{gameId}")
    public ResponseEntity<List<TaskResponse>> getTasksBySchoolAndGame(
            @PathVariable Long schoolId, 
            @PathVariable Integer gameId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksBySchoolAndGame(schoolId, gameId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get tasks by child and game ID (bit-mapped)
     */
    @GetMapping("/child/{childId}/game/{gameId}")
    public ResponseEntity<List<TaskResponse>> getTasksByChildAndGame(
            @PathVariable Long childId, 
            @PathVariable Integer gameId) {
        try {
            List<TaskResponse> tasks = taskService.getTasksByChildAndGame(childId, gameId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Get task details by task ID and school ID
     */
    @GetMapping("/{taskId}/details")
    public ResponseEntity<Map<String, Object>> getTaskDetails(
            @PathVariable Long taskId,
            @RequestParam Long schoolId) {
        try {
            Map<String, Object> taskDetails = taskService.getTaskDetails(taskId, schoolId);
            return ResponseEntity.ok(taskDetails);
        } catch (Exception e) {
            System.err.println("Error getting task details: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Health check
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Task Service is running!");
    }
    
    /**
     * Get child game statistics
     */
    @GetMapping("/child/{childId}/stats")
    public ResponseEntity<ChildGameStatsDto> getChildGameStats(@PathVariable String childId) {
        try {
            System.err.println("Fetching game stats for child: " + childId);
            ChildGameStatsDto stats = taskService.getChildGameStats(childId);
            System.err.println("Child stats: " + stats);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("Error fetching child game stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
    
    /**
     * Get recent activity for a child
     */
    @GetMapping("/child/{childId}/recent-activity")
    public ResponseEntity<List<RecentActivityDto>> getRecentActivity(@PathVariable String childId) {
        try {
            System.err.println("Fetching recent activity for child: " + childId);
            List<RecentActivityDto> activities = taskService.getRecentActivity(childId);
            System.err.println("Recent activities: " + activities.size() + " found");
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            System.err.println("Error fetching recent activity: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }
}
