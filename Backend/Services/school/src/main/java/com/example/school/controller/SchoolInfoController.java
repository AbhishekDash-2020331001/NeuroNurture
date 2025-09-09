package com.example.school.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.dto.SchoolInfoDto;
import com.example.school.entity.School;
import com.example.school.repository.SchoolRepository;

@RestController
@RequestMapping("/api/school/schools")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class SchoolInfoController {
    
    private static final Logger logger = LoggerFactory.getLogger(SchoolInfoController.class);
    
    @Autowired
    private SchoolRepository schoolRepository;
    
    @GetMapping("/{schoolId}")
    public ResponseEntity<SchoolInfoDto> getSchoolInfo(@PathVariable Long schoolId) {
        logger.info("=== SCHOOL SERVICE DEBUG ===");
        logger.info("Received request for school ID: {}", schoolId);
        
        try {
            School school = schoolRepository.findById(schoolId)
                    .orElseThrow(() -> new RuntimeException("School not found"));
            
            logger.info("Found school in database: {}", school.getSchoolName());
            
            // Convert School entity to SchoolInfoDto
            SchoolInfoDto schoolInfo = new SchoolInfoDto();
            schoolInfo.setId(school.getId());
            schoolInfo.setSchoolName(school.getSchoolName());
            schoolInfo.setEmail(school.getEmail());
            schoolInfo.setContactPerson(school.getContactPerson());
            schoolInfo.setPhone(school.getPhone());
            schoolInfo.setAddress(school.getAddress());
            schoolInfo.setCity(school.getCity());
            schoolInfo.setState(school.getState());
            schoolInfo.setZipCode(school.getZipCode());
            schoolInfo.setStudentCount(school.getStudentCount());
            schoolInfo.setSubscriptionStatus(school.getSubscriptionStatus());
            schoolInfo.setChildrenLimit(school.getChildrenLimit());
            schoolInfo.setCurrentChildren(school.getCurrentChildren());
            schoolInfo.setWebsite("www." + school.getSchoolName().toLowerCase().replaceAll("\\s+", "") + ".edu");
            schoolInfo.setDescription("A nurturing environment for special needs children");
            schoolInfo.setEstablishedYear(2010); // Default value since not in School entity
            schoolInfo.setPrincipalName(school.getContactPerson());
            
            logger.info("Returning school info for: {} (ID: {})", schoolInfo.getSchoolName(), schoolInfo.getId());
            
            return ResponseEntity.ok(schoolInfo);
        } catch (Exception e) {
            logger.error("Error fetching school with ID {}: {}", schoolId, e.getMessage());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(404).body(null);
        }
    }
}
