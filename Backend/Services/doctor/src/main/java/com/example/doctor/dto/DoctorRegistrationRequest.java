package com.example.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRegistrationRequest {
    private String username;
    private String email;
    private String password;
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
}

