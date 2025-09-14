package com.example.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAuthResponse {
    private String token;
    private String type = "Bearer";
    private DoctorInfo doctor;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorInfo {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private String specialization;
        private String licenseNumber;
        private String hospital;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private Integer yearsOfExperience;
        private String subscriptionStatus;
        private String subscriptionExpiry;
        private String stripeCustomerId;
        private String stripeSubscriptionId;
        private Integer patientLimit;
        private Integer currentPatients;
    }
}

