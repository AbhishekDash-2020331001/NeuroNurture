package com.example.parent.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.parent.dto.CreateEnrollmentRequestDto;
import com.example.parent.dto.EnrollmentRequestDto;
import com.example.parent.dto.RespondToEnrollmentRequestDto;
import com.example.parent.entity.Child;
import com.example.parent.entity.EnrollmentRequest;
import com.example.parent.repository.ChildRepository;
import com.example.parent.repository.EnrollmentRequestRepository;

@Service
@Transactional
public class EnrollmentRequestService {

    @Autowired
    private EnrollmentRequestRepository enrollmentRequestRepository;

    @Autowired
    private ChildRepository childRepository;

    public EnrollmentRequestDto createEnrollmentRequest(CreateEnrollmentRequestDto requestDto) {
        // Check if child exists
        Child child = childRepository.findById(requestDto.getChildId())
                .orElseThrow(() -> new RuntimeException("Child not found"));

        // Check if there's already a pending request for this child-school combination
        if (enrollmentRequestRepository.existsByChildIdAndSchoolIdAndStatus(
                requestDto.getChildId(), 
                requestDto.getSchoolId(), 
                EnrollmentRequest.RequestStatus.PENDING)) {
            throw new RuntimeException("A pending enrollment request already exists for this child and school");
        }

        // Check if child is already enrolled in any school
        if (child.getSchoolId() != null) {
            throw new RuntimeException("Child is already enrolled in a school");
        }

        // Create new enrollment request
        EnrollmentRequest enrollmentRequest = new EnrollmentRequest();
        enrollmentRequest.setChildId(requestDto.getChildId());
        enrollmentRequest.setSchoolId(requestDto.getSchoolId());
        enrollmentRequest.setSchoolName(requestDto.getSchoolName());
        enrollmentRequest.setGrade(requestDto.getGrade());
        enrollmentRequest.setMessage(requestDto.getMessage());
        enrollmentRequest.setStatus(EnrollmentRequest.RequestStatus.PENDING);
        enrollmentRequest.setCreatedAt(LocalDateTime.now());
        enrollmentRequest.setUpdatedAt(LocalDateTime.now());

        EnrollmentRequest savedRequest = enrollmentRequestRepository.save(enrollmentRequest);
        return convertToDto(savedRequest, child.getName());
    }

    public List<EnrollmentRequestDto> getEnrollmentRequestsForChild(Long childId) {
        List<EnrollmentRequest> requests = enrollmentRequestRepository.findByChildIdOrderByCreatedAtDesc(childId);
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        return requests.stream()
                .map(request -> convertToDto(request, child.getName()))
                .collect(Collectors.toList());
    }

    public List<EnrollmentRequestDto> getEnrollmentRequestsForSchool(Long schoolId) {
        List<EnrollmentRequest> requests = enrollmentRequestRepository.findBySchoolIdOrderByCreatedAtDesc(schoolId);
        
        return requests.stream()
                .map(request -> {
                    Child child = childRepository.findById(request.getChildId())
                            .orElseThrow(() -> new RuntimeException("Child not found"));
                    return convertToDto(request, child.getName());
                })
                .collect(Collectors.toList());
    }

    public EnrollmentRequestDto respondToEnrollmentRequest(RespondToEnrollmentRequestDto responseDto) {
        EnrollmentRequest request = enrollmentRequestRepository.findById(responseDto.getRequestId())
                .orElseThrow(() -> new RuntimeException("Enrollment request not found"));

        if (request.getStatus() != EnrollmentRequest.RequestStatus.PENDING) {
            throw new RuntimeException("This enrollment request has already been responded to");
        }

        request.setStatus(responseDto.getStatus());
        request.setRespondedAt(LocalDateTime.now());
        request.setMessage(responseDto.getResponseMessage());
        request.setUpdatedAt(LocalDateTime.now());

        EnrollmentRequest savedRequest = enrollmentRequestRepository.save(request);

        // If accepted, enroll the child in the school
        if (responseDto.getStatus() == EnrollmentRequest.RequestStatus.ACCEPTED) {
            Child child = childRepository.findById(request.getChildId())
                    .orElseThrow(() -> new RuntimeException("Child not found"));
            
            child.setSchoolId(request.getSchoolId());
            child.setGrade(request.getGrade());
            childRepository.save(child);
        }

        Child child = childRepository.findById(request.getChildId())
                .orElseThrow(() -> new RuntimeException("Child not found"));
        
        return convertToDto(savedRequest, child.getName());
    }

    public void deleteEnrollmentRequest(Long requestId) {
        EnrollmentRequest request = enrollmentRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Enrollment request not found"));

        if (request.getStatus() != EnrollmentRequest.RequestStatus.PENDING) {
            throw new RuntimeException("Cannot delete a request that has already been responded to");
        }

        enrollmentRequestRepository.delete(request);
    }

    private EnrollmentRequestDto convertToDto(EnrollmentRequest request, String childName) {
        EnrollmentRequestDto dto = new EnrollmentRequestDto();
        dto.setId(request.getId());
        dto.setChildId(request.getChildId());
        dto.setChildName(childName);
        dto.setSchoolId(request.getSchoolId());
        dto.setSchoolName(request.getSchoolName());
        dto.setGrade(request.getGrade());
        dto.setStatus(request.getStatus());
        dto.setMessage(request.getMessage());
        dto.setCreatedAt(request.getCreatedAt());
        dto.setUpdatedAt(request.getUpdatedAt());
        dto.setRespondedAt(request.getRespondedAt());
        return dto;
    }
}
