-- Add school_id column to child table
-- This script adds a school_id column to track which school a child is enrolled in

ALTER TABLE child ADD COLUMN school_id BIGINT;

-- Add foreign key constraint (optional - uncomment if you want to enforce referential integrity)
-- ALTER TABLE child ADD CONSTRAINT fk_child_school 
--     FOREIGN KEY (school_id) REFERENCES school(id);

-- Add index for better query performance
CREATE INDEX idx_child_school_id ON child(school_id);

-- Add comment to document the column
COMMENT ON COLUMN child.school_id IS 'Foreign key reference to the school table. NULL means child is not enrolled in any school.';
