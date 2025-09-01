-- Add missing round columns for rounds 6-12 to the repeat_with_me_game table
-- This script adds the columns that were missing from the original table structure

-- Add round 6 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round6Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round6TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round6TranscribedText VARCHAR(1000);

-- Add round 7 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round7Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round7TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round7TranscribedText VARCHAR(1000);

-- Add round 8 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round8Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round8TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round8TranscribedText VARCHAR(1000);

-- Add round 9 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round9Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round9TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round9TranscribedText VARCHAR(1000);

-- Add round 10 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round10Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round10TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round10TranscribedText VARCHAR(1000);

-- Add round 11 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round11Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round11TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round11TranscribedText VARCHAR(1000);

-- Add round 12 columns
ALTER TABLE repeat_with_me_game ADD COLUMN round12Score DOUBLE PRECISION;
ALTER TABLE repeat_with_me_game ADD COLUMN round12TargetText VARCHAR(1000);
ALTER TABLE repeat_with_me_game ADD COLUMN round12TranscribedText VARCHAR(1000);

-- Verify the table structure
-- \d repeat_with_me_game;
