package com.example.school.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDto {
    private String id;
    private String name;
    private String description;
    private Long priceInCents;
    private String currency;
    private Integer durationInMonths;
    private String stripePriceId;
    private String features;
}
