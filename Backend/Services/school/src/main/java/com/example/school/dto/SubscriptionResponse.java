package com.example.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {
    private String subscriptionId;
    private String status;
    private String currentPeriodStart;
    private String currentPeriodEnd;
    private String planName;
    private Long amountInCents;
    private String currency;
    private String clientSecret;
}
