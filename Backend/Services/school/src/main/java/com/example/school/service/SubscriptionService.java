package com.example.school.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.school.dto.CreateSubscriptionRequest;
import com.example.school.dto.SubscriptionPlanDto;
import com.example.school.dto.SubscriptionResponse;
import com.example.school.entity.School;
import com.example.school.repository.SchoolRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;

@Service
public class SubscriptionService {

    private final SchoolRepository schoolRepository;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable-key}")
    private String stripePublishableKey;

    public SubscriptionService(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @PostConstruct
    public void init() {
        // Set Stripe API key from configuration
        Stripe.apiKey =
    }

    public List<SubscriptionPlanDto> getAvailablePlans() {
        List<SubscriptionPlanDto> plans = new ArrayList<>();
        
        // 1 Year Plan - $199 (Schools pay more than doctors)
        plans.add(new SubscriptionPlanDto(
                "1_year",
                "Annual Plan",
                "Full access for 1 year",
                19900L, // $199.00 in cents
                "USD",
                12,
                "price_1S6ley0EZDpckBwTHYc7rzGB", // Replace with your actual Price ID
                "Unlimited children, Full analytics, Priority support, Advanced reporting"
        ));
        
        // 3 Year Plan - $499 (Schools pay more than doctors)
        plans.add(new SubscriptionPlanDto(
                "3_year",
                "3-Year Plan",
                "Full access for 3 years",
                49900L, // $499.00 in cents
                "USD",
                36,
                "price_1S6lpj0EZDpckBwTZxzbwnHK", // Replace with your actual Price ID
                "Unlimited children, Full analytics, Priority support, Advanced reporting"
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

    public void confirmPayment(String paymentIntentId, Long schoolId) {
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
            
            // Update school's subscription expiry
            School school = schoolRepository.findById(schoolId)
                    .orElseThrow(() -> new RuntimeException("School not found"));
            
            LocalDateTime newExpiry = LocalDateTime.now().plusMonths(durationMonths);
            school.setSubscriptionExpiry(newExpiry);
            school.setStripeCustomerId(paymentIntent.getCustomer());
            school.setStripeSubscriptionId(paymentIntentId); // Store payment intent ID for reference
            school.setSubscriptionPlan("premium");
            school.setSubscriptionStatus("active");
            
            schoolRepository.save(school);
            System.out.println("School subscription updated successfully. Expiry: " + newExpiry);

        } catch (StripeException e) {
            throw new RuntimeException("Failed to confirm payment: " + e.getMessage());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid duration months in payment intent metadata: " + e.getMessage());
        }
    }

    public SubscriptionResponse getCurrentSubscription(Long schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));
        
        if (school.getSubscriptionExpiry() == null) {
            return null;
        }
        
        return new SubscriptionResponse(
                school.getStripeSubscriptionId(),
                school.isSubscriptionActive() ? "active" : "expired",
                null, // currentPeriodStart
                school.getSubscriptionExpiry().toString(), // currentPeriodEnd
                "Current Plan",
                0L, // amountInCents
                "USD",
                null // clientSecret
        );
    }

    public void cancelSubscription(Long schoolId) {
        School school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new RuntimeException("School not found"));
        
        // For one-time payments, we just set expiry to now
        school.setSubscriptionExpiry(LocalDateTime.now());
        school.setSubscriptionStatus("expired");
        school.setSubscriptionPlan("free");
        schoolRepository.save(school);
    }

    private SubscriptionPlanDto getPlanById(String planId) {
        return getAvailablePlans().stream()
                .filter(plan -> plan.getId().equals(planId))
                .findFirst()
                .orElse(null);
    }
}
