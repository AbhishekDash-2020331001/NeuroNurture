package com.example.doctor.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDetailsDto {
    private Long id;
    private String name;
    private Integer age;
    private Double height;
    private Double weight;
    private String grade;
    private String gender;
    private Long schoolId;
    private Boolean enrolledInSchool;
    private String parentName;
    private String parentEmail;
    private String parentAddress;
    private String problem; // Medical condition or problem
}
