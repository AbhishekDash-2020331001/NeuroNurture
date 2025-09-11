-- Fix parent table status column issue
-- This script safely adds the status column to existing parent table

-- Step 1: Check if status column already exists
DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parent' AND column_name = 'status'
    ) THEN
        -- Step 2: Add the column as nullable first
        ALTER TABLE parent ADD COLUMN status VARCHAR(50);
        RAISE NOTICE 'Added status column (nullable)';
        
        -- Step 3: Update existing records to have default value
        UPDATE parent SET status = 'active' WHERE status IS NULL;
        RAISE NOTICE 'Updated existing records with active status';
        
        -- Step 4: Make the column NOT NULL
        ALTER TABLE parent ALTER COLUMN status SET NOT NULL;
        RAISE NOTICE 'Set status column as NOT NULL';
        
        -- Step 5: Add default value
        ALTER TABLE parent ALTER COLUMN status SET DEFAULT 'active';
        RAISE NOTICE 'Set default value to active';
        
        -- Step 6: Add check constraint
        ALTER TABLE parent ADD CONSTRAINT chk_parent_status 
            CHECK (status IN ('active', 'suspended'));
        RAISE NOTICE 'Added check constraint';
        
        RAISE NOTICE 'Successfully migrated parent table!';
    ELSE
        RAISE NOTICE 'Status column already exists, checking for NULL values...';
        
        -- Update any NULL values
        UPDATE parent SET status = 'active' WHERE status IS NULL;
        
        -- Make sure it's NOT NULL
        ALTER TABLE parent ALTER COLUMN status SET NOT NULL;
        
        RAISE NOTICE 'Updated any NULL status values and ensured NOT NULL constraint';
    END IF;
END $$;

-- Verify the result
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'parent' AND column_name = 'status';
