-- Add grade column to child table for autism severity levels
-- This column will store the assigned grade by the school

ALTER TABLE child ADD COLUMN grade VARCHAR(50);

-- Add a check constraint to ensure only valid grades are allowed
ALTER TABLE child ADD CONSTRAINT chk_child_grade 
CHECK (grade IN ('Gentle Bloom', 'Rising Star', 'Bright Light'));

-- Add a comment to explain the grade system
COMMENT ON COLUMN child.grade IS 'Autism severity grade assigned by school: Gentle Bloom (mild), Rising Star (moderate), Bright Light (severe)';

-- Optional: Set a default value for existing records (if any)
-- UPDATE child SET grade = 'Gentle Bloom' WHERE grade IS NULL;
