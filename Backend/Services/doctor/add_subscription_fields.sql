-- Add subscription fields to doctors table
ALTER TABLE doctors 
ADD COLUMN subscription_expiry TIMESTAMP NULL,
ADD COLUMN stripe_customer_id VARCHAR(255) NULL,
ADD COLUMN stripe_subscription_id VARCHAR(255) NULL;

-- Remove old subscription_status column
ALTER TABLE doctors DROP COLUMN subscription_status;

-- Add indexes for better performance
CREATE INDEX idx_doctors_subscription_expiry ON doctors(subscription_expiry);
CREATE INDEX idx_doctors_stripe_customer_id ON doctors(stripe_customer_id);
CREATE INDEX idx_doctors_stripe_subscription_id ON doctors(stripe_subscription_id);
