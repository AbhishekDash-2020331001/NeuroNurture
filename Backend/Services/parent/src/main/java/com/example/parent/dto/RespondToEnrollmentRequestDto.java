package com.example.parent.dto;

import com.example.parent.entity.EnrollmentRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespondToEnrollmentRequestDto {
    private Long requestId;
    private EnrollmentRequest.RequestStatus status;
    private String responseMessage;
}
