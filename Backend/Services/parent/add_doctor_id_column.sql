-- Add doctor_id column to child table
-- This script adds a doctor_id column to track which doctor a child is enrolled with

ALTER TABLE child ADD COLUMN doctor_id BIGINT;

-- Add foreign key constraint (optional - uncomment if you want to enforce referential integrity)
-- ALTER TABLE child ADD CONSTRAINT fk_child_doctor 
--     FOREIGN KEY (doctor_id) REFERENCES doctor(id);

-- Add index for better query performance
CREATE INDEX idx_child_doctor_id ON child(doctor_id);

-- Add comment to document the column
COMMENT ON COLUMN child.doctor_id IS 'Foreign key reference to the doctor table. NULL means child is not enrolled with any doctor.';
