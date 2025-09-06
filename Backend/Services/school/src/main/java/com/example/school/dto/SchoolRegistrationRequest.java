package com.example.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String schoolName;
    private String contactPerson;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zipCode;
    private Integer studentCount;
}

