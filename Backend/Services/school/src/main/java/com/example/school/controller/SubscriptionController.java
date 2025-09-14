package com.example.school.controller;

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

import com.example.school.dto.CreateSubscriptionRequest;
import com.example.school.dto.SubscriptionPlanDto;
import com.example.school.dto.SubscriptionResponse;
import com.example.school.entity.School;
import com.example.school.repository.SchoolRepository;
import com.example.school.service.SubscriptionService;

@RestController
@RequestMapping("/api/school/subscription")
@CrossOrigin(originPatterns = {"http://localhost:3000", "http://localhost:8081", "http://localhost:3001"}, allowCredentials = "true")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;
    
    @Autowired
    private SchoolRepository schoolRepository;

    @GetMapping("/plans")
    public ResponseEntity<List<SubscriptionPlanDto>> getAvailablePlans() {
        List<SubscriptionPlanDto> plans = subscriptionService.getAvailablePlans();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(
            @RequestHeader("X-School-Id") Long schoolId,
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
            @RequestHeader("X-School-Id") Long schoolId,
            @RequestBody java.util.Map<String, String> request) {
        try {
            String paymentIntentId = request.get("paymentIntentId");
            subscriptionService.confirmPayment(paymentIntentId, schoolId);
            
            // Return updated school data
            School updatedSchool = schoolRepository.findById(schoolId).orElse(null);
            if (updatedSchool != null) {
                return ResponseEntity.ok(java.util.Map.of(
                    "message", "Payment confirmed successfully",
                    "school", updatedSchool
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
            @RequestHeader("X-School-Id") Long schoolId) {
        try {
            SubscriptionResponse response = subscriptionService.getCurrentSubscription(schoolId);
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
            @RequestHeader("X-School-Id") Long schoolId) {
        try {
            subscriptionService.cancelSubscription(schoolId);
            return ResponseEntity.ok("Subscription cancelled successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
