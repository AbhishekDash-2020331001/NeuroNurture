package com.example.parent;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.parent.dto.ChildDetailsDto;
import com.example.parent.dto.ChildSchoolInfoDto;
import com.example.parent.dto.SchoolEnrollmentRequest;
import com.example.parent.dto.SchoolInfoDto;

@RestController
@RequestMapping("/api/parents")
public class ParentController {
    
    private static final Logger logger = LoggerFactory.getLogger(ParentController.class);
    @Autowired private ParentRepository parentRepository;
    @Autowired private ChildRepository childRepository;

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
                    parent != null ? parent.getAddress() : "Unknown"
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
} 