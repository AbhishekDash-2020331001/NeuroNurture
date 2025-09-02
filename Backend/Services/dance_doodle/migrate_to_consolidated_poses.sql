-- Migration script to consolidate left-right poses in dance doodle game
-- This script consolidates happy_stand_left/right into happy_stand and stretch_left/right into stretch

-- Step 1: Add the new consolidated columns
ALTER TABLE dance_doodle_game ADD COLUMN happy_stand INTEGER;
ALTER TABLE dance_doodle_game ADD COLUMN stretch INTEGER;

-- Step 2: Migrate existing data
-- For happy_stand: use happy_stand_left if it exists, otherwise happy_stand_right
UPDATE dance_doodle_game 
SET happy_stand = COALESCE(happy_stand_left, happy_stand_right)
WHERE happy_stand_left IS NOT NULL OR happy_stand_right IS NOT NULL;

-- For stretch: use stretch_left if it exists, otherwise stretch_right
UPDATE dance_doodle_game 
SET stretch = COALESCE(stretch_left, stretch_right)
WHERE stretch_left IS NOT NULL OR stretch_right IS NOT NULL;

-- Step 3: Drop the old columns
ALTER TABLE dance_doodle_game DROP COLUMN IF EXISTS happy_stand_left;
ALTER TABLE dance_doodle_game DROP COLUMN IF EXISTS happy_stand_right;
ALTER TABLE dance_doodle_game DROP COLUMN IF EXISTS stretch_left;
ALTER TABLE dance_doodle_game DROP COLUMN IF EXISTS stretch_right;

-- Step 4: Add comments to document the changes
COMMENT ON COLUMN dance_doodle_game.happy_stand IS 'Consolidated field for happy stand pose (replaces happy_stand_left and happy_stand_right)';
COMMENT ON COLUMN dance_doodle_game.stretch IS 'Consolidated field for stretch pose (replaces stretch_left and stretch_right)';
