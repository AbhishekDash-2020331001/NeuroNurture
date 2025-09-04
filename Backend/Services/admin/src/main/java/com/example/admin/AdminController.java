package com.example.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    @Autowired
    private AdminService adminService;
    
    @GetMapping("/parents")
    public ResponseEntity<List<ParentWithChildrenDto>> getAllParents() {
        List<ParentWithChildrenDto> parents = adminService.getAllParentsWithChildren();
        return ResponseEntity.ok(parents);
    }
    
    @GetMapping("/parents/{parentId}")
    public ResponseEntity<ParentWithChildrenDto> getParentById(@PathVariable Long parentId) {
        ParentWithChildrenDto parent = adminService.getParentById(parentId);
        if (parent != null) {
            return ResponseEntity.ok(parent);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/parents/{parentId}/status")
    public ResponseEntity<ParentWithChildrenDto> updateParentStatus(
            @PathVariable Long parentId, 
            @RequestBody String status) {
        ParentWithChildrenDto parent = adminService.updateParentStatus(parentId, status);
        if (parent != null) {
            return ResponseEntity.ok(parent);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
