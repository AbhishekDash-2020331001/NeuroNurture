# Doctor Subscription System with Stripe Integration

## Overview
This document outlines the implementation of a subscription system for doctors using Stripe for payment processing.

## Backend Changes

### 1. Database Schema Updates
- **New Fields in `doctors` table:**
  - `subscription_expiry`: TIMESTAMP - When the subscription expires
  - `stripe_customer_id`: VARCHAR(255) - Stripe customer ID
  - `stripe_subscription_id`: VARCHAR(255) - Stripe subscription ID
- **Removed Fields:**
  - `subscription_status`: Replaced with datetime-based logic

### 2. New Dependencies
- Added Stripe Java SDK (version 24.16.0) to `pom.xml`

### 3. New Components
- **SubscriptionService**: Handles Stripe operations
- **SubscriptionController**: REST endpoints for subscription management
- **DTOs**: SubscriptionPlanDto, CreateSubscriptionRequest, SubscriptionResponse

### 4. Configuration
- Added Stripe configuration in `application.yml`:
  ```yaml
  stripe:
    secret-key: ${STRIPE_SECRET_KEY:sk_test_your_secret_key_here}
    publishable-key: ${STRIPE_PUBLISHABLE_KEY:pk_test_your_publishable_key_here}
  ```

## Frontend Changes

### 1. New Pages
- **DoctorPricingPage**: Displays subscription plans (1-year and 3-year)
- **DoctorCheckoutPage**: Handles payment processing with Stripe
- **SubscriptionStatus**: Component showing current subscription status

### 2. Updated Components
- **DoctorDashboard**: Added subscription status display
- **App.tsx**: Added new routes for pricing and checkout

## API Endpoints

### Public Endpoints
- `GET /api/doctor/subscription/plans` - Get available subscription plans

### Authenticated Endpoints
- `POST /api/doctor/subscription/create` - Create new subscription
- `GET /api/doctor/subscription/current` - Get current subscription
- `POST /api/doctor/subscription/cancel` - Cancel subscription

## Subscription Plans

### 1-Year Plan
- Price: $99/year
- Features: Unlimited patients, Full analytics, Priority support
- Stripe Price ID: `price_1year_plan` (needs to be updated with actual Stripe Price ID)

### 3-Year Plan
- Price: $249/3 years (16% savings)
- Features: Unlimited patients, Full analytics, Priority support, 16% savings
- Stripe Price ID: `price_3year_plan` (needs to be updated with actual Stripe Price ID)

## Setup Instructions

### 1. Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Create products and prices in Stripe dashboard
4. Update the `stripePriceId` values in `SubscriptionService.java`

### 2. Environment Variables
Set the following environment variables:
```bash
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

### 3. Database Migration
Run the SQL script to update the database schema:
```sql
-- Run add_subscription_fields.sql
```

### 4. Frontend Stripe Integration
To complete the Stripe integration, you need to:
1. Install Stripe React SDK: `npm install @stripe/stripe-js @stripe/react-stripe-js`
2. Replace the placeholder payment form in `DoctorCheckoutPage.tsx` with Stripe Elements
3. Implement proper error handling and success flows

## Security Considerations
- All subscription operations require authentication
- Stripe handles sensitive payment data
- Customer and subscription IDs are stored for future reference
- Payment methods are not stored locally (handled by Stripe)

## Testing
- Use Stripe test mode for development
- Test cards: 4242 4242 4242 4242 (Visa)
- Test with different subscription scenarios (success, failure, cancellation)

## Future Enhancements
- Webhook handling for subscription events
- Proration for plan changes
- Trial periods
- Discount codes
- Invoice management
