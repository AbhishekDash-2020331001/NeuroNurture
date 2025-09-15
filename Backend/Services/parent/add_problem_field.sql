-- Add problem/condition field to child table
-- This script adds a problem field to track what kind of condition the child is suffering from

ALTER TABLE child ADD COLUMN problem VARCHAR(255);

-- Add comment to document the column
COMMENT ON COLUMN child.problem IS 'Medical condition or problem the child is suffering from (e.g., Autism, ADHD, Learning Disability, etc.)';

-- Add index for better query performance
CREATE INDEX idx_child_problem ON child(problem);
