-- Migration script to add role-based fields to the app_user table
-- Run this script to update existing database schema

-- Add user role column
ALTER TABLE app_user ADD COLUMN user_role VARCHAR(20);

-- Add verification status for schools, doctors, and admins
ALTER TABLE app_user ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Update existing users to have PARENT role (for backward compatibility)
UPDATE app_user SET user_role = 'PARENT' WHERE user_role IS NULL;

-- Make user_role NOT NULL after setting default values
ALTER TABLE app_user ALTER COLUMN user_role SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX idx_user_role ON app_user(user_role);
CREATE INDEX idx_user_verified ON app_user(is_verified);
CREATE INDEX idx_user_email_verified ON app_user(email_verified);
