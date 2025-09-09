package com.example.school.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.dto.TaskPerformanceDto;
import com.example.school.service.TaskPerformanceService;

@RestController
@RequestMapping("/api/school/task-performance")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001", "http://localhost:8090", "http://localhost:5173"}, allowCredentials = "true")
public class TaskPerformanceController {
    
    @Autowired
    private TaskPerformanceService taskPerformanceService;
    
    @GetMapping("/{taskId}")
    public ResponseEntity<List<TaskPerformanceDto>> getTaskPerformance(
            @PathVariable String taskId,
            @RequestParam String schoolId) {
        try {
            System.err.println("TaskPerformanceController: Received request for taskId=" + taskId + ", schoolId=" + schoolId);
            List<TaskPerformanceDto> performance = taskPerformanceService.getTaskPerformance(taskId, schoolId);
            System.err.println("TaskPerformanceController: Returning " + performance.size() + " performance records");
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            System.err.println("Error in TaskPerformanceController: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
