-- Migration script to add subscription-related columns to schools table
-- This ensures backward compatibility when deploying the updated School entity

-- Add subscription expiry column
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS subscription_expiry TIMESTAMP;

-- Add Stripe customer ID column
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Add Stripe subscription ID column
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Add subscription plan column with default value 'free'
ALTER TABLE schools 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';

-- Add comments for documentation
COMMENT ON COLUMN schools.subscription_expiry IS 'When subscription expires, null means no active subscription';
COMMENT ON COLUMN schools.stripe_customer_id IS 'Stripe customer ID for subscription management';
COMMENT ON COLUMN schools.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN schools.subscription_plan IS 'Subscription plan: free or premium';

-- Update existing schools to have 'free' plan if not already set
UPDATE schools 
SET subscription_plan = 'free' 
WHERE subscription_plan IS NULL;

-- Optional: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schools_subscription_expiry ON schools(subscription_expiry);
CREATE INDEX IF NOT EXISTS idx_schools_subscription_plan ON schools(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_schools_stripe_customer_id ON schools(stripe_customer_id);
