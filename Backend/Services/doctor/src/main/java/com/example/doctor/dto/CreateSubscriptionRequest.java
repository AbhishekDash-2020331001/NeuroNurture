package com.example.doctor.dto;

import lombok.Data;

@Data
public class CreateSubscriptionRequest {
    private String planId; // "1year" or "3year"
    private String paymentMethodId; // Stripe payment method ID
}
