package com.example.school.dto;

import lombok.Data;

@Data
public class VerificationStatusResponse {
    private String status; // "pending_email", "pending_admin", "approved"
    private String message;
    private SchoolInfo school;
    
    @Data
    public static class SchoolInfo {
        private Long id;
        private String schoolName;
        private String contactPerson;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private Integer studentCount;
        private Boolean emailVerified;
        private Boolean isVerified;
        private String subscriptionStatus;
        private Integer childrenLimit;
        private Integer currentChildren;
        private Long assignedAdminId;
    }
}
