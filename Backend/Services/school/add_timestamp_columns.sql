-- Add timestamp columns to schools table
ALTER TABLE schools ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have timestamps
UPDATE schools SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE schools SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Make columns NOT NULL after setting default values
ALTER TABLE schools ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE schools ALTER COLUMN updated_at SET NOT NULL;
