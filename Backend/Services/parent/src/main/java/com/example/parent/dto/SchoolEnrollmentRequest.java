package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolEnrollmentRequest {
    private Long schoolId;
    private String grade; // "Gentle Bloom", "Rising Star", or "Bright Light"
}
