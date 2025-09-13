package com.example.doctor.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.doctor.dto.CreateSubscriptionRequest;
import com.example.doctor.dto.SubscriptionPlanDto;
import com.example.doctor.dto.SubscriptionResponse;
import com.example.doctor.entity.Doctor;
import com.example.doctor.repository.DoctorRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

@Service
public class SubscriptionService {

    private final DoctorRepository doctorRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    public SubscriptionService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
        // Set Stripe API key directly from config
        Stripe.apiKey = "";
    }

    public List<SubscriptionPlanDto> getAvailablePlans() {
        List<SubscriptionPlanDto> plans = new ArrayList<>();
        
        // 1 Year Plan - $99
        plans.add(new SubscriptionPlanDto(
                "1_year",
                "Annual Plan",
                "Full access for 1 year",
                9900L, // $99.00 in cents
                "USD",
                12,
                "price_1S6ley0EZDpckBwTHYc7rzGB", // Replace with your actual Price ID
                "Unlimited patients, Full analytics, Priority support"
        ));
        
        // 3 Year Plan - $249
        plans.add(new SubscriptionPlanDto(
                "3_year",
                "3-Year Plan",
                "Full access for 3 years",
                24900L, // $249.00 in cents
                "USD",
                36,
                "price_1S6lpj0EZDpckBwTZxzbwnHK", // Replace with your actual Price ID
                "Unlimited patients, Full analytics, Priority support"
        ));
        
        return plans;
    }

    public SubscriptionResponse createPaymentIntent(CreateSubscriptionRequest request) {
        try {
            System.out.println("Creating payment intent for plan ID: " + request.getPlanId());
            
            // Get the plan details
            SubscriptionPlanDto plan = getPlanById(request.getPlanId());
            if (plan == null) {
                throw new RuntimeException("Invalid plan ID: " + request.getPlanId());
            }

            System.out.println("Plan found: " + plan.getName() + ", Price: " + plan.getPriceInCents() + " " + plan.getCurrency());

            // Create Payment Intent
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(plan.getPriceInCents()) // Already in cents
                    .setCurrency(plan.getCurrency().toLowerCase())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .putMetadata("planId", plan.getId())
                    .putMetadata("durationMonths", String.valueOf(plan.getDurationInMonths()))
                    .build();

            System.out.println("Creating Payment Intent with Stripe...");
            PaymentIntent paymentIntent = PaymentIntent.create(params);
            System.out.println("Payment Intent created successfully: " + paymentIntent.getId());

            return new SubscriptionResponse(
                    paymentIntent.getId(),
                    paymentIntent.getStatus(),
                    null, // currentPeriodStart
                    null, // currentPeriodEnd
                    plan.getName(),
                    paymentIntent.getAmount(),
                    paymentIntent.getCurrency(),
                    paymentIntent.getClientSecret()
            );

        } catch (StripeException e) {
            System.err.println("Stripe error: " + e.getMessage());
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("General error: " + e.getMessage());
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage());
        }
    }

    public void confirmPayment(String paymentIntentId, Long doctorId) {
        try {
            // Validate payment intent ID
            if (paymentIntentId == null || paymentIntentId.trim().isEmpty()) {
                throw new RuntimeException("Payment Intent ID is null or empty");
            }
            
            // Retrieve the payment intent
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            System.out.println("Payment Intent Status: " + paymentIntent.getStatus());
            
            // Only accept succeeded payments for real implementation
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new RuntimeException("Payment not completed successfully. Status: " + paymentIntent.getStatus());
            }

            // Get plan details from metadata
            String durationMonthsStr = paymentIntent.getMetadata().get("durationMonths");
            if (durationMonthsStr == null) {
                throw new RuntimeException("Duration months not found in payment intent metadata");
            }
            
            int durationMonths = Integer.parseInt(durationMonthsStr);
            
            // Update doctor's subscription expiry
            Doctor doctor = doctorRepository.findById(doctorId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));
            
            LocalDateTime newExpiry = LocalDateTime.now().plusMonths(durationMonths);
            doctor.setSubscriptionExpiry(newExpiry);
            doctor.setStripeCustomerId(paymentIntent.getCustomer());
            doctor.setStripeSubscriptionId(paymentIntentId); // Store payment intent ID for reference
            
            doctorRepository.save(doctor);
            System.out.println("Doctor subscription updated successfully. Expiry: " + newExpiry);

        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid duration months in payment intent metadata: " + e.getMessage());
        }
    }

    public SubscriptionResponse getCurrentSubscription(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        if (doctor.getSubscriptionExpiry() == null) {
            return null;
        }
        
        return new SubscriptionResponse(
                doctor.getStripeSubscriptionId(),
                doctor.isSubscriptionActive() ? "active" : "expired",
                null, // currentPeriodStart
                doctor.getSubscriptionExpiry(), // currentPeriodEnd
                "Current Plan",
                0L, // amountInCents
                "USD",
                null // clientSecret
        );
    }

    public void cancelSubscription(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        // For one-time payments, we just set expiry to now
        doctor.setSubscriptionExpiry(LocalDateTime.now());
        doctorRepository.save(doctor);
    }

    private SubscriptionPlanDto getPlanById(String planId) {
        return getAvailablePlans().stream()
                .filter(plan -> plan.getId().equals(planId))
                .findFirst()
                .orElse(null);
    }
}