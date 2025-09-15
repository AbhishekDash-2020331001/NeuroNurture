package com.example.doctor.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.doctor.dto.PatientDetailsDto;

@RestController
@RequestMapping("/api/doctor/patients")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001", "http://localhost:5173"}, allowCredentials = "true")
public class PatientController {
    
    private static final Logger logger = LoggerFactory.getLogger(PatientController.class);
    
    @Autowired
    private RestTemplate restTemplate;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082/api/parents";
    
    // Get all patients for a specific doctor
    @GetMapping("/{doctorId}")
    public ResponseEntity<List<PatientDetailsDto>> getPatientsByDoctor(@PathVariable Long doctorId) {
        logger.info("=== DOCTOR SERVICE DEBUG ===");
        logger.info("Received request for doctor ID: {}", doctorId);
        
        try {
            String parentServiceUrl = PARENT_SERVICE_URL + "/doctors/" + doctorId + "/children";
            logger.info("Calling parent service for doctor's patients: {}", parentServiceUrl);
            
            ResponseEntity<PatientDetailsDto[]> response = restTemplate.getForEntity(parentServiceUrl, PatientDetailsDto[].class);
            
            logger.info("Parent service response status: {}", response.getStatusCode());
            logger.info("Parent service response body: {}", response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<PatientDetailsDto> patients = List.of(response.getBody());
                logger.info("✅ Successfully fetched {} patients for doctor ID: {}", patients.size(), doctorId);
                return ResponseEntity.ok(patients);
            } else {
                logger.warn("❌ Parent service returned non-2xx status or null body");
                return ResponseEntity.status(404).body(null);
            }
        } catch (Exception e) {
            logger.error("❌ Error calling parent service for doctor's patients: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }
}
