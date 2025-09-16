package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateEnrollmentRequestDto {
    private Long childId;
    private Long schoolId;
    private String schoolName;
    private String grade;
    private String message;
}
