package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChildDetailsDto {
    private Long id;
    private String name;
    private Integer age;
    private Double height;
    private Double weight;
    private String grade;
    private String gender;
    private Long schoolId;
    private Boolean enrolled;
    
    // Parent information
    private String parentName;
    private String parentEmail;
    private String parentPhone;
    private String parentAddress;
}
