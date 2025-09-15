package com.example.parent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorEnrollmentRequest {
    private Long doctorId;
    private String problem; // Medical condition or problem the child is suffering from
    private String notes; // Optional notes from doctor about the child
}
