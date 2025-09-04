-- SQL script to add new columns to the parent table
-- Run this if you need to manually add the columns to an existing database

-- Add status column with default value 'active'
ALTER TABLE parent 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

-- Add a check constraint to ensure status is either 'active' or 'suspended'
ALTER TABLE parent 
ADD CONSTRAINT IF NOT EXISTS check_parent_status 
CHECK (status IN ('active', 'suspended'));

-- Update existing records to have 'active' status if they don't have one
UPDATE parent 
SET status = 'active' 
WHERE status IS NULL;

-- Create an index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_parent_status ON parent(status);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'parent' 
AND column_name = 'status'
ORDER BY column_name;
