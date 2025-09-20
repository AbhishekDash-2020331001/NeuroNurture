package com.example.parent.controller;

import java.time.LocalDate;
import java.time.Period;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.parent.dto.ChatMessageDto;
import com.example.parent.dto.ChildDetailsDto;
import com.example.parent.dto.ChildSchoolInfoDto;
import com.example.parent.dto.CreateEnrollmentRequestDto;
import com.example.parent.dto.DoctorEnrollmentRequest;
import com.example.parent.dto.DoctorInfoDto;
import com.example.parent.dto.EnrollmentRequestDto;
import com.example.parent.dto.RespondToEnrollmentRequestDto;
import com.example.parent.dto.SchoolEnrollmentRequest;
import com.example.parent.dto.SchoolInfoDto;
import com.example.parent.dto.SendMessageRequest;
import com.example.parent.entity.Child;
import com.example.parent.entity.Parent;
import com.example.parent.repository.ChildRepository;
import com.example.parent.repository.ParentRepository;
import com.example.parent.service.ChatService;
import com.example.parent.service.EnrollmentRequestService;

@RestController
@RequestMapping("/api/parents")
public class ParentController {
    
    private static final Logger logger = LoggerFactory.getLogger(ParentController.class);
    @Autowired private ParentRepository parentRepository;
    @Autowired private ChildRepository childRepository;
    @Autowired private RestTemplate restTemplate;
    @Autowired private ChatService chatService;
    @Autowired private EnrollmentRequestService enrollmentRequestService;

    // Get all parents
    @GetMapping
    public ResponseEntity<List<Parent>> getAllParents() {
        return ResponseEntity.ok(parentRepository.findAll());
    }

    // Get parent by email
    @GetMapping("/by-email/{email}")
    public ResponseEntity<Parent> getParentByEmail(@PathVariable String email) {
        return parentRepository.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get parent by ID
    @GetMapping("/{parentId}")
    public ResponseEntity<Parent> getParentById(@PathVariable Long parentId) {
        return parentRepository.findById(parentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create or update parent info
    @PostMapping
    public ResponseEntity<Parent> createOrUpdateParent(@RequestBody Parent parent) {
        Optional<Parent> existing = parentRepository.findByEmail(parent.getEmail());
        if (existing.isPresent()) {
            Parent p = existing.get();
            p.setName(parent.getName());
            p.setAddress(parent.getAddress());
            p.setNumberOfChildren(parent.getNumberOfChildren());
            p.setSuspectedAutisticChildCount(parent.getSuspectedAutisticChildCount());
            // Only update status if provided
            if (parent.getStatus() != null) {
                p.setStatus(parent.getStatus());
            }
            return ResponseEntity.ok(parentRepository.save(p));
        } else {
            return ResponseEntity.ok(parentRepository.save(parent));
        }
    }

    // Update parent info by ID
    @PutMapping("/{parentId}")
    public ResponseEntity<Parent> updateParent(@PathVariable Long parentId, @RequestBody Parent parent) {
        return parentRepository.findById(parentId)
                .map(existingParent -> {
                    // Only allow updating specific fields
                    existingParent.setAddress(parent.getAddress());
                    existingParent.setNumberOfChildren(parent.getNumberOfChildren());
                    existingParent.setSuspectedAutisticChildCount(parent.getSuspectedAutisticChildCount());
                    // Allow updating status field
                    if (parent.getStatus() != null) {
                        existingParent.setStatus(parent.getStatus());
                    }
                    return ResponseEntity.ok(parentRepository.save(existingParent));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all children for a parent
    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<Child>> getChildren(@PathVariable Long parentId) {
        return ResponseEntity.ok(childRepository.findByParentId(parentId));
    }

    // Get all children enrolled in a specific school
    @GetMapping("/schools/{schoolId}/children")
    public ResponseEntity<List<ChildDetailsDto>> getChildrenBySchool(@PathVariable Long schoolId) {
        List<Child> children = childRepository.findBySchoolId(schoolId);
        List<ChildDetailsDto> childDetails = children.stream()
            .map(child -> {
                Parent parent = child.getParent();
                int age = calculateAge(child.getDateOfBirth());
                
                return new ChildDetailsDto(
                    child.getId(),
                    child.getName(),
                    age,
                    child.getHeight(),
                    child.getWeight(),
                    child.getGrade(),
                    child.getGender(),
                    child.getSchoolId(),
                    child.getSchoolId() != null,
                    parent != null ? parent.getName() : "Unknown",
                    parent != null ? parent.getEmail() : "Unknown",
                    "N/A", // Parent phone not available
                    parent != null ? parent.getAddress() : "Unknown",
                    child.getProblem() // Medical condition or problem
                );
            })
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(childDetails);
    }

    // Get all children enrolled with a specific doctor
    @GetMapping("/doctors/{doctorId}/children")
    public ResponseEntity<List<ChildDetailsDto>> getChildrenByDoctor(@PathVariable Long doctorId) {
        List<Child> children = childRepository.findByDoctorId(doctorId);
        List<ChildDetailsDto> childDetails = children.stream()
            .map(child -> {
                Parent parent = child.getParent();
                int age = calculateAge(child.getDateOfBirth());
                
                return new ChildDetailsDto(
                    child.getId(),
                    child.getName(),
                    age,
                    child.getHeight(),
                    child.getWeight(),
                    child.getGrade(),
                    child.getGender(),
                    child.getSchoolId(),
                    child.getSchoolId() != null,
                    parent != null ? parent.getName() : "Unknown",
                    parent != null ? parent.getEmail() : "Unknown",
                    "N/A", // Parent phone not available
                    parent != null ? parent.getAddress() : "Unknown",
                    child.getProblem() // Medical condition or problem
                );
            })
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(childDetails);
    }

    private int calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) return 0;
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    // Add a new child to a parent
    @PostMapping("/{parentId}/children")
    public ResponseEntity<Child> addChild(@PathVariable Long parentId, @RequestBody Child child) {
        Parent parent = parentRepository.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Parent not found"));
        child.setParent(parent);
        return ResponseEntity.ok(childRepository.save(child));
    }

    // Get a specific child by id
    @GetMapping("/children/{childId}")
    public ResponseEntity<Child> getChild(@PathVariable Long childId) {
        return childRepository.findById(childId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get complete child details with parent information
    @GetMapping("/children/{childId}/details")
    public ResponseEntity<ChildDetailsDto> getChildDetails(@PathVariable Long childId) {
        return childRepository.findById(childId)
                .map(child -> {
                    ChildDetailsDto dto = new ChildDetailsDto();
                    dto.setId(child.getId());
                    dto.setName(child.getName());
                    
                    // Calculate age from dateOfBirth
                    if (child.getDateOfBirth() != null) {
                        int age = java.time.LocalDate.now().getYear() - child.getDateOfBirth().getYear();
                        dto.setAge(age);
                    } else {
                        dto.setAge(null);
                    }
                    
                    dto.setHeight(child.getHeight());
                    dto.setWeight(child.getWeight());
                    dto.setGrade(child.getGrade());
                    dto.setSchoolId(child.getSchoolId());
                    dto.setEnrolled(child.getSchoolId() != null);
                    
                    // Set parent information
                    if (child.getParent() != null) {
                        dto.setParentName(child.getParent().getName());
                        dto.setParentEmail(child.getParent().getEmail());
                        dto.setParentPhone("N/A"); // Parent entity doesn't have phone field
                        dto.setParentAddress(child.getParent().getAddress());
                    }
                    
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a specific child by id
    @DeleteMapping("/children/{childId}")
    public ResponseEntity<Void> deleteChild(@PathVariable Long childId) {
        if (!childRepository.existsById(childId)) {
            return ResponseEntity.notFound().build();
        }
        childRepository.deleteById(childId);
        return ResponseEntity.noContent().build();
    }

    // Update parent status (active/suspended)
    @PutMapping("/{parentId}/status")
    public ResponseEntity<Parent> updateParentStatus(@PathVariable Long parentId, @RequestBody String status) {
        Optional<Parent> parentOpt = parentRepository.findById(parentId);
        if (parentOpt.isPresent()) {
            Parent existingParent = parentOpt.get();
            if ("active".equals(status) || "suspended".equals(status)) {
                existingParent.setStatus(status);
                return ResponseEntity.ok(parentRepository.save(existingParent));
            } else {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Enroll child in school
    @PutMapping("/children/{childId}/enroll-school")
    public ResponseEntity<Child> enrollChildInSchool(@PathVariable Long childId, @RequestBody SchoolEnrollmentRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        child.setSchoolId(request.getSchoolId());
        child.setGrade(request.getGrade());
        return ResponseEntity.ok(childRepository.save(child));
    }

    // Unenroll child from school
    @PutMapping("/children/{childId}/unenroll-school")
    public ResponseEntity<Child> unenrollChildFromSchool(@PathVariable Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        child.setSchoolId(null);
        return ResponseEntity.ok(childRepository.save(child));
    }

    // Enroll child with doctor
    @PutMapping("/children/{childId}/enroll-doctor")
    public ResponseEntity<Child> enrollChildWithDoctor(@PathVariable Long childId, @RequestBody DoctorEnrollmentRequest request) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        child.setDoctorId(request.getDoctorId());
        child.setProblem(request.getProblem());
        return ResponseEntity.ok(childRepository.save(child));
    }

    // Unenroll child from doctor
    @PutMapping("/children/{childId}/unenroll-doctor")
    public ResponseEntity<Child> unenrollChildFromDoctor(@PathVariable Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        child.setDoctorId(null);
        return ResponseEntity.ok(childRepository.save(child));
    }

    // Get child's school enrollment status
    @GetMapping("/children/{childId}/school-status")
    public ResponseEntity<SchoolEnrollmentStatus> getChildSchoolStatus(@PathVariable Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        SchoolEnrollmentStatus status = new SchoolEnrollmentStatus();
        status.setChildId(childId);
        status.setChildName(child.getName());
        status.setSchoolId(child.getSchoolId());
        status.setEnrolled(child.getSchoolId() != null);
        
        return ResponseEntity.ok(status);
    }

    // Get child's doctor enrollment status and information
    @GetMapping("/children/{childId}/doctor-status")
    public ResponseEntity<DoctorEnrollmentStatus> getChildDoctorStatus(@PathVariable Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        DoctorEnrollmentStatus status = new DoctorEnrollmentStatus();
        status.setChildId(childId);
        status.setChildName(child.getName());
        status.setDoctorId(child.getDoctorId());
        status.setProblem(child.getProblem());
        status.setEnrolled(child.getDoctorId() != null);
        
        return ResponseEntity.ok(status);
    }

    // Inner class for school enrollment status response
    public static class SchoolEnrollmentStatus {
        private Long childId;
        private String childName;
        private Long schoolId;
        private boolean enrolled;

        // Getters and setters
        public Long getChildId() { return childId; }
        public void setChildId(Long childId) { this.childId = childId; }
        
        public String getChildName() { return childName; }
        public void setChildName(String childName) { this.childName = childName; }
        
        public Long getSchoolId() { return schoolId; }
        public void setSchoolId(Long schoolId) { this.schoolId = schoolId; }
        
        public boolean isEnrolled() { return enrolled; }
        public void setEnrolled(boolean enrolled) { this.enrolled = enrolled; }
    }

    // Inner class for doctor enrollment status response
    public static class DoctorEnrollmentStatus {
        private Long childId;
        private String childName;
        private Long doctorId;
        private String problem;
        private boolean enrolled;

        // Getters and setters
        public Long getChildId() { return childId; }
        public void setChildId(Long childId) { this.childId = childId; }
        
        public String getChildName() { return childName; }
        public void setChildName(String childName) { this.childName = childName; }
        
        public Long getDoctorId() { return doctorId; }
        public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
        
        public String getProblem() { return problem; }
        public void setProblem(String problem) { this.problem = problem; }
        
        public boolean isEnrolled() { return enrolled; }
        public void setEnrolled(boolean enrolled) { this.enrolled = enrolled; }
    }

    // Get school information by school ID
    @GetMapping("/schools/{schoolId}")
    public ResponseEntity<SchoolInfoDto> getSchoolInfo(@PathVariable Long schoolId) {
        logger.info("=== PARENT SERVICE: GET SCHOOL INFO DEBUG ===");
        logger.info("Requested school ID: {}", schoolId);
        
        try {
            // Call school service to get school information
            String schoolServiceUrl = "http://localhost:8091/api/school/schools/" + schoolId;
            logger.info("Calling school service URL: {}", schoolServiceUrl);
            
            RestTemplate restTemplate = new RestTemplate();
            logger.info("Making HTTP GET request to school service...");
            
            ResponseEntity<SchoolInfoDto> response = restTemplate.getForEntity(schoolServiceUrl, SchoolInfoDto.class);
            
            logger.info("School service response status: {}", response.getStatusCode());
            logger.info("School service response body: {}", response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("✅ Successfully fetched school data from school service");
                logger.info("School name: {}", response.getBody().getSchoolName());
                return ResponseEntity.ok(response.getBody());
            } else {
                logger.warn("❌ School service returned non-2xx status or null body: {}", response.getStatusCode());
                return getMockSchoolInfo(schoolId);
            }
        } catch (Exception e) {
            logger.error("❌ Error calling school service: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return getMockSchoolInfo(schoolId);
        }
    }
    
    private ResponseEntity<SchoolInfoDto> getMockSchoolInfo(Long schoolId) {
        logger.warn("Using mock school data for school ID: {}", schoolId);
        SchoolInfoDto schoolInfo = new SchoolInfoDto();
        schoolInfo.setId(schoolId);
        schoolInfo.setSchoolName("Sunshine Elementary School");
        schoolInfo.setEmail("info@sunshine.edu");
        schoolInfo.setContactPerson("Dr. Sarah Johnson");
        schoolInfo.setPhone("+1 (555) 123-4567");
        schoolInfo.setAddress("123 Learning Lane");
        schoolInfo.setCity("Education City");
        schoolInfo.setState("CA");
        schoolInfo.setZipCode("12345");
        schoolInfo.setStudentCount(250);
        schoolInfo.setSubscriptionStatus("active");
        schoolInfo.setChildrenLimit(50);
        schoolInfo.setCurrentChildren(25);
        schoolInfo.setWebsite("www.sunshine.edu");
        schoolInfo.setDescription("A nurturing environment for special needs children");
        schoolInfo.setEstablishedYear(2010);
        schoolInfo.setPrincipalName("Dr. Sarah Johnson");
        
        return ResponseEntity.ok(schoolInfo);
    }

    // Get child's complete school information including grade
    @GetMapping("/children/{childId}/school-info")
    public ResponseEntity<ChildSchoolInfoDto> getChildSchoolInfo(@PathVariable Long childId) {
        logger.info("=== PARENT SERVICE: GET CHILD SCHOOL INFO DEBUG ===");
        logger.info("Requested child ID: {}", childId);
        
        try {
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new RuntimeException("Child not found"));
            
            logger.info("Found child: {} with school ID: {}", child.getName(), child.getSchoolId());
            
            if (child.getSchoolId() == null) {
                logger.warn("❌ Child {} has no school ID", childId);
                return ResponseEntity.status(404).body(null);
            }
            
            // Get school information from school service
            SchoolInfoDto schoolInfo;
            try {
                String schoolServiceUrl = "http://localhost:8091/api/school/schools/" + child.getSchoolId();
                logger.info("Calling school service for child's school: {}", schoolServiceUrl);
                
                RestTemplate restTemplate = new RestTemplate();
                logger.info("Making HTTP GET request to school service...");
                
                ResponseEntity<SchoolInfoDto> response = restTemplate.getForEntity(schoolServiceUrl, SchoolInfoDto.class);
                
                logger.info("School service response status: {}", response.getStatusCode());
                logger.info("School service response body: {}", response.getBody());
                
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    schoolInfo = response.getBody();
                    logger.info("✅ Successfully fetched school data for child's school: {}", schoolInfo.getSchoolName());
                } else {
                    logger.warn("❌ School service returned non-2xx status or null body, using mock data");
                    schoolInfo = createMockSchoolInfo(child.getSchoolId());
                }
            } catch (Exception e) {
                logger.error("❌ Error calling school service for child's school: {}", e.getMessage());
                logger.error("Exception type: {}", e.getClass().getSimpleName());
                logger.error("Exception details: ", e);
                logger.warn("Using mock school data for child's school");
                schoolInfo = createMockSchoolInfo(child.getSchoolId());
            }
            
            // Create child school info response
            ChildSchoolInfoDto childSchoolInfo = new ChildSchoolInfoDto();
            childSchoolInfo.setChildId(childId);
            childSchoolInfo.setChildName(child.getName());
            childSchoolInfo.setGrade(child.getGrade() != null ? child.getGrade() : "MILD");
            childSchoolInfo.setSchoolId(child.getSchoolId());
            childSchoolInfo.setSchool(schoolInfo);
            childSchoolInfo.setEnrollmentDate("2024-01-15"); // This would come from a separate enrollment table
            childSchoolInfo.setStatus("active");
            
            logger.info("✅ Returning child school info for child: {} with school: {}", 
                       childSchoolInfo.getChildName(), childSchoolInfo.getSchool().getSchoolName());
            
            return ResponseEntity.ok(childSchoolInfo);
        } catch (Exception e) {
            logger.error("❌ Error in getChildSchoolInfo: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            return ResponseEntity.status(500).body(null);
        }
    }
    
    private SchoolInfoDto createMockSchoolInfo(Long schoolId) {
        SchoolInfoDto schoolInfo = new SchoolInfoDto();
        schoolInfo.setId(schoolId);
        schoolInfo.setSchoolName("Sunshine Elementary School");
        schoolInfo.setEmail("info@sunshine.edu");
        schoolInfo.setContactPerson("Dr. Sarah Johnson");
        schoolInfo.setPhone("+1 (555) 123-4567");
        schoolInfo.setAddress("123 Learning Lane");
        schoolInfo.setCity("Education City");
        schoolInfo.setState("CA");
        schoolInfo.setZipCode("12345");
        schoolInfo.setStudentCount(250);
        schoolInfo.setSubscriptionStatus("active");
        schoolInfo.setChildrenLimit(50);
        schoolInfo.setCurrentChildren(25);
        schoolInfo.setWebsite("www.sunshine.edu");
        schoolInfo.setDescription("A nurturing environment for special needs children");
        schoolInfo.setEstablishedYear(2010);
        schoolInfo.setPrincipalName("Dr. Sarah Johnson");
        return schoolInfo;
    }

    // Get latest game session data for ALI assessment
    @GetMapping("/children/{childId}/game-sessions")
    public ResponseEntity<Map<String, Object>> getLatestGameSessions(@PathVariable Long childId, @RequestParam List<String> games) {
        logger.info("=== PARENT SERVICE: GET GAME SESSIONS DEBUG ===");
        logger.info("Requested child ID: {}", childId);
        logger.info("Requested games: {}", games);
        
        try {
            Map<String, Object> gameData = new HashMap<>();
            Map<String, String> errors = new HashMap<>();
            
            // Game service URLs mapping
            Map<String, String> gameServiceUrls = new HashMap<>();
            gameServiceUrls.put("dance_doodle_game", "http://localhost:8082/api/dance-doodle");
            gameServiceUrls.put("gesture_game", "http://localhost:8083/api/gesture-game");
            gameServiceUrls.put("gaze_tracking_game", "http://localhost:8084/api/gaze-game");
            gameServiceUrls.put("mirror_posture_game", "http://localhost:8085/api/mirror-posture");
            gameServiceUrls.put("repeat_with_me_game", "http://localhost:8086/api/repeat-with-me");
            
            // Get child age for all game data
            Child child = childRepository.findById(childId)
                    .orElseThrow(() -> new RuntimeException("Child not found"));
            
            int childAge = calculateAge(child.getDateOfBirth());
            logger.info("Child age calculated: {}", childAge);
            
            for (String gameId : games) {
                try {
                    String serviceUrl = gameServiceUrls.get(gameId);
                    if (serviceUrl == null) {
                        errors.put(gameId, "Unknown game service");
                        continue;
                    }
                    
                    // Get latest session data for this game
                    String latestSessionUrl = serviceUrl + "/child/" + childId + "/latest-session";
                    logger.info("Calling game service: {}", latestSessionUrl);
                    
                    ResponseEntity<Map> response = restTemplate.getForEntity(latestSessionUrl, Map.class);
                    
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> sessionData = (Map<String, Object>) response.getBody();
                        // Add age to the session data
                        sessionData.put("age", childAge);
                        gameData.put(gameId, sessionData);
                        logger.info("✅ Successfully fetched data for game: {}", gameId);
                    } else {
                        errors.put(gameId, "No session data found");
                        logger.warn("❌ No session data found for game: {}", gameId);
                    }
                } catch (Exception e) {
                    String errorMsg = "No session found for " + getGameDisplayName(gameId);
                    errors.put(gameId, errorMsg);
                    logger.error("❌ Error fetching data for game {}: {}", gameId, e.getMessage());
                }
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", gameData);
            response.put("errors", errors);
            response.put("childId", childId);
            response.put("childAge", childAge);
            
            logger.info("✅ Returning game session data with {} successful games and {} errors", 
                       gameData.size(), errors.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("❌ Error in getLatestGameSessions: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }
    
    private String getGameDisplayName(String gameId) {
        switch (gameId) {
            case "dance_doodle_game": return "Dance Doodle";
            case "gesture_game": return "Gesture Game";
            case "gaze_tracking_game": return "Eye Gaze Tracking";
            case "mirror_posture_game": return "Mirror Posture";
            case "repeat_with_me_game": return "Repeat with Me";
            default: return gameId;
        }
    }

    // Get doctor information by doctor ID
    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<DoctorInfoDto> getDoctorInfo(@PathVariable Long doctorId) {
        logger.info("=== PARENT SERVICE: GET DOCTOR INFO DEBUG ===");
        logger.info("Requested doctor ID: {}", doctorId);
        
        try {
            // Call doctor service to get doctor information
            String doctorServiceUrl = "http://localhost:8093/api/doctor/auth/doctors/" + doctorId;
            logger.info("Calling doctor service URL: {}", doctorServiceUrl);
            
            RestTemplate restTemplate = new RestTemplate();
            logger.info("Making HTTP GET request to doctor service...");
            
            ResponseEntity<DoctorInfoDto> response = restTemplate.getForEntity(doctorServiceUrl, DoctorInfoDto.class);
            
            logger.info("Doctor service response status: {}", response.getStatusCode());
            logger.info("Doctor service response body: {}", response.getBody());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                logger.info("✅ Successfully fetched doctor data from doctor service");
                logger.info("Doctor name: {} {}", response.getBody().getFirstName(), response.getBody().getLastName());
                return ResponseEntity.ok(response.getBody());
            } else {
                logger.warn("❌ Doctor service returned non-2xx status or null body: {}", response.getStatusCode());
                return getMockDoctorInfo(doctorId);
            }
        } catch (Exception e) {
            logger.error("❌ Error calling doctor service: {}", e.getMessage());
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception details: ", e);
            logger.warn("Using mock doctor data");
            return getMockDoctorInfo(doctorId);
        }
    }

    private ResponseEntity<DoctorInfoDto> getMockDoctorInfo(Long doctorId) {
        DoctorInfoDto doctorInfo = new DoctorInfoDto();
        doctorInfo.setId(doctorId);
        doctorInfo.setFirstName("Dr. Sarah");
        doctorInfo.setLastName("Johnson");
        doctorInfo.setSpecialization("Pediatric Neurology");
        doctorInfo.setHospital("Children's Medical Center");
        doctorInfo.setEmail("sarah.johnson@childrensmed.com");
        doctorInfo.setPhone("+1 (555) 123-4567");
        doctorInfo.setAddress("123 Medical Plaza, Health City");
        doctorInfo.setYearsOfExperience(15);
        doctorInfo.setLicenseNumber("MD123456");
        
        return ResponseEntity.ok(doctorInfo);
    }

    // ==================== CHAT ENDPOINTS ====================
    
    // Send message from child to doctor
    @PostMapping("/chat/send-from-child")
    public ResponseEntity<ChatMessageDto> sendMessageFromChild(@RequestBody SendMessageRequest request) {
        logger.info("=== PARENT SERVICE: SEND MESSAGE FROM CHILD ===");
        logger.info("Child ID: {}, Doctor ID: {}, Message: {}", request.getChildId(), request.getDoctorId(), request.getMessage());
        
        try {
            ChatMessageDto message = chatService.sendMessageFromChild(request);
            logger.info("✅ Message sent successfully");
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            logger.error("❌ Error sending message from child: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Send message from doctor to child
    @PostMapping("/chat/send-from-doctor")
    public ResponseEntity<ChatMessageDto> sendMessageFromDoctor(@RequestBody SendMessageRequest request) {
        logger.info("=== PARENT SERVICE: SEND MESSAGE FROM DOCTOR ===");
        logger.info("Child ID: {}, Doctor ID: {}, Message: {}", request.getChildId(), request.getDoctorId(), request.getMessage());
        
        try {
            ChatMessageDto message = chatService.sendMessageFromDoctor(request);
            logger.info("✅ Message sent successfully");
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            logger.error("❌ Error sending message from doctor: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Get chat history between child and doctor
    @GetMapping("/chat/history/{childId}/{doctorId}")
    public ResponseEntity<List<ChatMessageDto>> getChatHistory(@PathVariable Long childId, @PathVariable Long doctorId) {
        logger.info("=== PARENT SERVICE: GET CHAT HISTORY ===");
        logger.info("Child ID: {}, Doctor ID: {}", childId, doctorId);
        
        try {
            List<ChatMessageDto> messages = chatService.getChatHistory(childId, doctorId);
            logger.info("✅ Retrieved {} messages", messages.size());
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            logger.error("❌ Error getting chat history: {}", e.getMessage());
            return ResponseEntity.status(500).body(null);
        }
    }
    
    // Mark messages as read
    @PutMapping("/chat/mark-read/{childId}/{doctorId}/{readerType}")
    public ResponseEntity<String> markMessagesAsRead(@PathVariable Long childId, @PathVariable Long doctorId, @PathVariable String readerType) {
        logger.info("=== PARENT SERVICE: MARK MESSAGES AS READ ===");
        logger.info("Child ID: {}, Doctor ID: {}, Reader Type: {}", childId, doctorId, readerType);
        
        try {
            chatService.markMessagesAsRead(childId, doctorId, readerType);
            logger.info("✅ Messages marked as read");
            return ResponseEntity.ok("Messages marked as read");
        } catch (Exception e) {
            logger.error("❌ Error marking messages as read: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error marking messages as read");
        }
    }
    
    // Get unread message count
    @GetMapping("/chat/unread-count/{childId}/{doctorId}/{userType}")
    public ResponseEntity<Long> getUnreadMessageCount(@PathVariable Long childId, @PathVariable Long doctorId, @PathVariable String userType) {
        logger.info("=== PARENT SERVICE: GET UNREAD MESSAGE COUNT ===");
        logger.info("Child ID: {}, Doctor ID: {}, User Type: {}", childId, doctorId, userType);
        
        try {
            long count = chatService.getUnreadMessageCount(childId, doctorId, userType);
            logger.info("✅ Unread message count: {}", count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            logger.error("❌ Error getting unread message count: {}", e.getMessage());
            return ResponseEntity.status(500).body(0L);
        }
    }

    // ==================== ENROLLMENT REQUEST ENDPOINTS ====================

    // Create enrollment request (called by school)
    @PostMapping("/enrollment-requests")
    public ResponseEntity<EnrollmentRequestDto> createEnrollmentRequest(@RequestBody CreateEnrollmentRequestDto requestDto) {
        try {
            EnrollmentRequestDto response = enrollmentRequestService.createEnrollmentRequest(requestDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error creating enrollment request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Get enrollment requests for a child (called by child/parent)
    @GetMapping("/children/{childId}/enrollment-requests")
    public ResponseEntity<List<EnrollmentRequestDto>> getEnrollmentRequestsForChild(@PathVariable Long childId) {
        try {
            List<EnrollmentRequestDto> requests = enrollmentRequestService.getEnrollmentRequestsForChild(childId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            logger.error("Error getting enrollment requests for child: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Get enrollment requests for a school (called by school)
    @GetMapping("/schools/{schoolId}/enrollment-requests")
    public ResponseEntity<List<EnrollmentRequestDto>> getEnrollmentRequestsForSchool(@PathVariable Long schoolId) {
        try {
            List<EnrollmentRequestDto> requests = enrollmentRequestService.getEnrollmentRequestsForSchool(schoolId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            logger.error("Error getting enrollment requests for school: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Respond to enrollment request (called by child/parent)
    @PutMapping("/enrollment-requests/respond")
    public ResponseEntity<EnrollmentRequestDto> respondToEnrollmentRequest(@RequestBody RespondToEnrollmentRequestDto responseDto) {
        try {
            EnrollmentRequestDto response = enrollmentRequestService.respondToEnrollmentRequest(responseDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error responding to enrollment request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete enrollment request (called by school)
    @DeleteMapping("/enrollment-requests/{requestId}")
    public ResponseEntity<Void> deleteEnrollmentRequest(@PathVariable Long requestId) {
        try {
            enrollmentRequestService.deleteEnrollmentRequest(requestId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error deleting enrollment request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
} 