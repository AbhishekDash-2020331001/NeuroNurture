-- Migration script to rename looking_left and looking_right columns to looking_sideways
-- This script consolidates the two separate looking columns into a single looking_sideways column

-- Step 1: Add the new looking_sideways column
ALTER TABLE mirror_posture_game ADD COLUMN looking_sideways INTEGER;

-- Step 2: Migrate existing data
-- For existing records, we'll use the looking_left value if it exists, otherwise looking_right
-- This preserves existing data while consolidating to the new structure
UPDATE mirror_posture_game 
SET looking_sideways = COALESCE(looking_left, looking_right)
WHERE looking_left IS NOT NULL OR looking_right IS NOT NULL;

-- Step 3: Drop the old columns
ALTER TABLE mirror_posture_game DROP COLUMN IF EXISTS looking_left;
ALTER TABLE mirror_posture_game DROP COLUMN IF EXISTS looking_right;

-- Step 4: Add comment to document the change
COMMENT ON COLUMN mirror_posture_game.looking_sideways IS 'Consolidated field for sideways head movement (replaces looking_left and looking_right)';
