package com.example.doctor.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.doctor.dto.CreateSubscriptionRequest;
import com.example.doctor.dto.SubscriptionPlanDto;
import com.example.doctor.dto.SubscriptionResponse;
import com.example.doctor.entity.Doctor;
import com.example.doctor.repository.DoctorRepository;
import com.example.doctor.service.SubscriptionService;

@RestController
@RequestMapping("/api/doctor/subscription")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001"}, allowCredentials = "true")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;
    
    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanDto>> getAvailablePlans() {
        List<SubscriptionPlanDto> plans = subscriptionService.getAvailablePlans();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(
            @RequestHeader("X-Doctor-Id") Long doctorId,
            @RequestBody CreateSubscriptionRequest request) {
        try {
            SubscriptionResponse response = subscriptionService.createPaymentIntent(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPayment(
            @RequestHeader("X-Doctor-Id") Long doctorId,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String paymentIntentId = request.get("paymentIntentId");
            subscriptionService.confirmPayment(paymentIntentId, doctorId);
            
            // Return updated doctor data
            Doctor updatedDoctor = doctorRepository.findById(doctorId).orElse(null);
            if (updatedDoctor != null) {
                return ResponseEntity.ok(java.util.Map.of(
                    "message", "Payment confirmed successfully",
                    "doctor", updatedDoctor
                ));
            } else {
                return ResponseEntity.ok(java.util.Map.of("message", "Payment confirmed successfully"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/current")
    public ResponseEntity<SubscriptionResponse> getCurrentSubscription(
            @RequestHeader("X-Doctor-Id") Long doctorId) {
        try {
            SubscriptionResponse response = subscriptionService.getCurrentSubscription(doctorId);
            if (response == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> cancelSubscription(
            @RequestHeader("X-Doctor-Id") Long doctorId) {
        try {
            subscriptionService.cancelSubscription(doctorId);
            return ResponseEntity.ok("Subscription cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
