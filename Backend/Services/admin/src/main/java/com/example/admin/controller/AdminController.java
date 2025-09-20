package com.example.admin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.admin.dto.DoctorApprovalDto;
import com.example.admin.dto.ParentWithChildrenDto;
import com.example.admin.dto.SchoolApprovalDto;
import com.example.admin.service.AdminService;

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
    
    // Doctor Management Endpoints
    @GetMapping("/doctors/pending")
    public ResponseEntity<List<DoctorApprovalDto>> getPendingDoctors() {
        List<DoctorApprovalDto> doctors = adminService.getPendingDoctors();
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/doctors/pending/{adminId}")
    public ResponseEntity<List<DoctorApprovalDto>> getPendingDoctorsForAdmin(@PathVariable Long adminId) {
        List<DoctorApprovalDto> doctors = adminService.getPendingDoctorsForAdmin(adminId);
        return ResponseEntity.ok(doctors);
    }
    
    @PutMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<DoctorApprovalDto> approveDoctor(@PathVariable Long doctorId) {
        DoctorApprovalDto doctor = adminService.approveDoctor(doctorId);
        if (doctor != null) {
            return ResponseEntity.ok(doctor);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<DoctorApprovalDto> rejectDoctor(@PathVariable Long doctorId) {
        DoctorApprovalDto doctor = adminService.rejectDoctor(doctorId);
        if (doctor != null) {
            return ResponseEntity.ok(doctor);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // School Management - Get All Schools
    @GetMapping("/schools")
    public ResponseEntity<List<SchoolApprovalDto>> getAllSchools() {
        List<SchoolApprovalDto> schools = adminService.getAllSchools();
        return ResponseEntity.ok(schools);
    }
    
    @GetMapping("/schools/{schoolId}")
    public ResponseEntity<SchoolApprovalDto> getSchoolById(@PathVariable Long schoolId) {
        SchoolApprovalDto school = adminService.getSchoolById(schoolId);
        if (school != null) {
            return ResponseEntity.ok(school);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/schools/{schoolId}/status")
    public ResponseEntity<SchoolApprovalDto> updateSchoolStatus(
            @PathVariable Long schoolId, 
            @RequestBody String status) {
        SchoolApprovalDto school = adminService.updateSchoolStatus(schoolId, status);
        if (school != null) {
            return ResponseEntity.ok(school);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Doctor Management - Get All Doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorApprovalDto>> getAllDoctors() {
        List<DoctorApprovalDto> doctors = adminService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }
    
    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<DoctorApprovalDto> getDoctorById(@PathVariable Long doctorId) {
        DoctorApprovalDto doctor = adminService.getDoctorById(doctorId);
        if (doctor != null) {
            return ResponseEntity.ok(doctor);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/doctors/{doctorId}/status")
    public ResponseEntity<DoctorApprovalDto> updateDoctorStatus(
            @PathVariable Long doctorId, 
            @RequestBody String status) {
        DoctorApprovalDto doctor = adminService.updateDoctorStatus(doctorId, status);
        if (doctor != null) {
            return ResponseEntity.ok(doctor);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }
}
