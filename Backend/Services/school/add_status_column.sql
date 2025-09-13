-- Add status column to schools table
-- This script adds a status column to track active/suspended status

-- Step 1: Add status column (nullable initially)
ALTER TABLE schools ADD COLUMN status VARCHAR(50);

-- Step 2: Update existing records with 'active' status
UPDATE schools SET status = 'active' WHERE status IS NULL;

-- Step 3: Set status column as NOT NULL
ALTER TABLE schools ALTER COLUMN status SET NOT NULL;

-- Step 4: Set default value
ALTER TABLE schools ALTER COLUMN status SET DEFAULT 'active';

-- Step 5: Add check constraint to ensure only valid values
ALTER TABLE schools ADD CONSTRAINT chk_school_status CHECK (status IN ('active', 'suspended'));

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'schools' AND column_name = 'status';
