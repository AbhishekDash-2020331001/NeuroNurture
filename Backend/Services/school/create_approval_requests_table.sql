-- Create school_approval_requests table
CREATE TABLE IF NOT EXISTS school_approval_requests (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL,
    assigned_admin_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITHOUT TIME ZONE
);

-- Add foreign key constraint to schools table
ALTER TABLE school_approval_requests 
ADD CONSTRAINT fk_school_approval_requests_school_id 
FOREIGN KEY (school_id) REFERENCES schools(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_school_approval_requests_school_id ON school_approval_requests(school_id);
CREATE INDEX IF NOT EXISTS idx_school_approval_requests_admin_id ON school_approval_requests(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_school_approval_requests_status ON school_approval_requests(status);
