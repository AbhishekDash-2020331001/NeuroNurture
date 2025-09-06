package com.example.admin;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.admin.dto.SchoolApprovalDto;

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
    
    // School Management Endpoints
    @GetMapping("/schools/pending")
    public ResponseEntity<List<SchoolApprovalDto>> getPendingSchools() {
        List<SchoolApprovalDto> schools = adminService.getPendingSchools();
        return ResponseEntity.ok(schools);
    }
    
    @GetMapping("/schools/pending/{adminId}")
    public ResponseEntity<List<SchoolApprovalDto>> getPendingSchoolsForAdmin(@PathVariable Long adminId) {
        List<SchoolApprovalDto> schools = adminService.getPendingSchoolsForAdmin(adminId);
        return ResponseEntity.ok(schools);
    }
    
    @PutMapping("/schools/{schoolId}/approve")
    public ResponseEntity<SchoolApprovalDto> approveSchool(@PathVariable Long schoolId) {
        SchoolApprovalDto school = adminService.approveSchool(schoolId);
        if (school != null) {
            return ResponseEntity.ok(school);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/schools/{schoolId}/reject")
    public ResponseEntity<SchoolApprovalDto> rejectSchool(@PathVariable Long schoolId) {
        SchoolApprovalDto school = adminService.rejectSchool(schoolId);
        if (school != null) {
            return ResponseEntity.ok(school);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/users")
    public ResponseEntity<Long[]> getAllAdminIds() {
        Long[] adminIds = adminService.getAllAdminIds();
        return ResponseEntity.ok(adminIds);
    }
}
