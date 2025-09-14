package com.example.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolAuthResponse {
    private String token;
    private String type = "Bearer";
    private SchoolInfo school;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SchoolInfo {
        private Long id;
        private String username;
        private String email;
        private String schoolName;
        private String contactPerson;
        private String phone;
        private String address;
        private String city;
        private String state;
        private String zipCode;
        private Integer studentCount;
        private String subscriptionStatus;
        private String subscriptionPlan;
        private String subscriptionExpiry;
        private String stripeCustomerId;
        private String stripeSubscriptionId;
        private Integer childrenLimit;
        private Integer currentChildren;
    }
}

