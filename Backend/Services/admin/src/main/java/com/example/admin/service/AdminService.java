package com.example.admin.service;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.admin.dto.DoctorApprovalDto;
import com.example.admin.dto.ParentWithChildrenDto;
import com.example.admin.dto.SchoolApprovalDto;
import com.example.admin.entity.AdminUser;
import com.example.admin.repository.AdminUserRepository;

@Service
public class AdminService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private AdminUserRepository adminUserRepository;
    
    private static final String PARENT_SERVICE_URL = "http://localhost:8082";
    private static final String SCHOOL_SERVICE_URL = "http://localhost:8091";
    private static final String DOCTOR_SERVICE_URL = "http://localhost:8093";
    
    public List<ParentWithChildrenDto> getAllParentsWithChildren() {
        try {
            // First, get all parents
            ParentWithChildrenDto[] parents = restTemplate.getForObject(
                PARENT_SERVICE_URL + "/api/parents", 
                ParentWithChildrenDto[].class
            );
            
            if (parents == null) {
                return Arrays.asList();
            }
            
            // For each parent, fetch their children
            for (ParentWithChildrenDto parent : parents) {
                try {
                    ParentWithChildrenDto.ChildDto[] children = restTemplate.getForObject(
                        PARENT_SERVICE_URL + "/api/parents/" + parent.getId() + "/children",
                        ParentWithChildrenDto.ChildDto[].class
                    );
                    parent.setChildren(children != null ? Arrays.asList(children) : Arrays.asList());
                } catch (Exception e) {
                    // If children fetch fails, set empty list
                    parent.setChildren(Arrays.asList());
                }
            }
            
            return Arrays.asList(parents);
        } catch (Exception e) {
            // Return empty list if parent service is not available
            return Arrays.asList();
        }
    }
    
    public ParentWithChildrenDto getParentById(Long parentId) {
        try {
            ParentWithChildrenDto parent = restTemplate.getForObject(
                PARENT_SERVICE_URL + "/api/parents/" + parentId,
                ParentWithChildrenDto.class
            );
            
            if (parent != null) {
                // Fetch children for this parent
                try {
                    ParentWithChildrenDto.ChildDto[] children = restTemplate.getForObject(
                        PARENT_SERVICE_URL + "/api/parents/" + parentId + "/children",
                        ParentWithChildrenDto.ChildDto[].class
                    );
                    parent.setChildren(children != null ? Arrays.asList(children) : Arrays.asList());
                } catch (Exception e) {
                    parent.setChildren(Arrays.asList());
                }
            }
            
            return parent;
        } catch (Exception e) {
            return null;
        }
    }
    
    public ParentWithChildrenDto updateParentStatus(Long parentId, String status) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.TEXT_PLAIN);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(status, headers);
            
            restTemplate.exchange(
                PARENT_SERVICE_URL + "/api/parents/" + parentId + "/status",
                org.springframework.http.HttpMethod.PUT,
                entity,
                String.class
            );
            // After updating, fetch the updated parent data
            return getParentById(parentId);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    // School Management Methods
    public List<SchoolApprovalDto> getPendingSchools() {
        try {
            SchoolApprovalDto[] schools = restTemplate.getForObject(
                SCHOOL_SERVICE_URL + "/api/school/admin/pending",
                SchoolApprovalDto[].class
            );
            return schools != null ? Arrays.asList(schools) : Arrays.asList();
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
    
    public List<SchoolApprovalDto> getPendingSchoolsForAdmin(Long adminId) {
        try {
            SchoolApprovalDto[] schools = restTemplate.getForObject(
                SCHOOL_SERVICE_URL + "/api/school/admin/pending/" + adminId,
                SchoolApprovalDto[].class
            );
            return schools != null ? Arrays.asList(schools) : Arrays.asList();
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
    
    public SchoolApprovalDto approveSchool(Long schoolId) {
        try {
            SchoolApprovalDto school = restTemplate.postForObject(
                SCHOOL_SERVICE_URL + "/api/school/admin/approve/" + schoolId,
                null,
                SchoolApprovalDto.class
            );
            return school;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public SchoolApprovalDto rejectSchool(Long schoolId) {
        try {
            SchoolApprovalDto school = restTemplate.postForObject(
                SCHOOL_SERVICE_URL + "/api/school/admin/reject/" + schoolId,
                null,
                SchoolApprovalDto.class
            );
            return school;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public Long assignRandomAdmin() {
        try {
            // Get all admin users
            Long[] adminIds = restTemplate.getForObject(
                "http://localhost:8080/api/admin/users",
                Long[].class
            );
            
            if (adminIds != null && adminIds.length > 0) {
                Random random = new Random();
                return adminIds[random.nextInt(adminIds.length)];
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public Long[] getAllAdminIds() {
        try {
            // Fetch all admin users from the database
            List<AdminUser> adminUsers = adminUserRepository.findAll();
            return adminUsers.stream()
                .map(AdminUser::getId)
                .toArray(Long[]::new);
        } catch (Exception e) {
            e.printStackTrace();
            return new Long[]{};
        }
    }
    
    // Doctor Management Methods
    public List<DoctorApprovalDto> getPendingDoctors() {
        try {
            DoctorApprovalDto[] doctors = restTemplate.getForObject(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/pending",
                DoctorApprovalDto[].class
            );
            return doctors != null ? Arrays.asList(doctors) : Arrays.asList();
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
    
    public List<DoctorApprovalDto> getPendingDoctorsForAdmin(Long adminId) {
        try {
            DoctorApprovalDto[] doctors = restTemplate.getForObject(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/pending/" + adminId,
                DoctorApprovalDto[].class
            );
            return doctors != null ? Arrays.asList(doctors) : Arrays.asList();
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
    
    public DoctorApprovalDto approveDoctor(Long doctorId) {
        try {
            DoctorApprovalDto doctor = restTemplate.postForObject(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/approve/" + doctorId,
                null,
                DoctorApprovalDto.class
            );
            return doctor;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public DoctorApprovalDto rejectDoctor(Long doctorId) {
        try {
            DoctorApprovalDto doctor = restTemplate.postForObject(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/reject/" + doctorId,
                null,
                DoctorApprovalDto.class
            );
            return doctor;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    // School Management - Get All Schools
    public List<SchoolApprovalDto> getAllSchools() {
        try {
            SchoolApprovalDto[] schools = restTemplate.getForObject(
                SCHOOL_SERVICE_URL + "/api/school/admin/all",
                SchoolApprovalDto[].class
            );
            return schools != null ? Arrays.asList(schools) : Arrays.asList();
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
    
    public SchoolApprovalDto getSchoolById(Long schoolId) {
        try {
            SchoolApprovalDto school = restTemplate.getForObject(
                SCHOOL_SERVICE_URL + "/api/school/admin/" + schoolId,
                SchoolApprovalDto.class
            );
            return school;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public SchoolApprovalDto updateSchoolStatus(Long schoolId, String status) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.TEXT_PLAIN);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(status, headers);
            
            SchoolApprovalDto school = restTemplate.exchange(
                SCHOOL_SERVICE_URL + "/api/school/admin/" + schoolId + "/status",
                org.springframework.http.HttpMethod.PUT,
                entity,
                SchoolApprovalDto.class
            ).getBody();
            return school;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    // Doctor Management - Get All Doctors
    public List<DoctorApprovalDto> getAllDoctors() {
        try {
            DoctorApprovalDto[] doctors = restTemplate.getForObject(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/all",
                DoctorApprovalDto[].class
            );
            return doctors != null ? Arrays.asList(doctors) : Arrays.asList();
        } catch (Exception e) {
            e.printStackTrace();
            return Arrays.asList();
        }
    }
    
    public DoctorApprovalDto getDoctorById(Long doctorId) {
        try {
            DoctorApprovalDto doctor = restTemplate.getForObject(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/" + doctorId,
                DoctorApprovalDto.class
            );
            return doctor;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    public DoctorApprovalDto updateDoctorStatus(Long doctorId, String status) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.TEXT_PLAIN);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(status, headers);
            
            DoctorApprovalDto doctor = restTemplate.exchange(
                DOCTOR_SERVICE_URL + "/api/doctor/admin/" + doctorId + "/status",
                org.springframework.http.HttpMethod.PUT,
                entity,
                DoctorApprovalDto.class
            ).getBody();
            return doctor;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
