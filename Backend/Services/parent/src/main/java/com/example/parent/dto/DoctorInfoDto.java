package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorInfoDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String specialization;
    private String hospital;
    private String email;
    private String phone;
    private String address;
    private Integer yearsOfExperience;
    private String licenseNumber;
}
