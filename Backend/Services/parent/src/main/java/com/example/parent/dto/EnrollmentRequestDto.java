package com.example.parent.dto;

import com.example.parent.entity.EnrollmentRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentRequestDto {
    private Long id;
    private Long childId;
    private String childName;
    private Long schoolId;
    private String schoolName;
    private String grade;
    private EnrollmentRequest.RequestStatus status;
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime respondedAt;
}
