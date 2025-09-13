-- Create database for doctor service
CREATE DATABASE doctordb;

-- Connect to the doctor database
\c doctordb;

-- Create doctors table
CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    license_number VARCHAR(255) UNIQUE NOT NULL,
    hospital VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip_code VARCHAR(255) NOT NULL,
    years_of_experience INTEGER NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT 'DOCTOR',
    enabled BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR(255),
    verification_token_expiry TIMESTAMP,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    subscription_status VARCHAR(255) DEFAULT 'pending',
    patient_limit INTEGER DEFAULT 50,
    current_patients INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create doctor_approval_requests table
CREATE TABLE doctor_approval_requests (
    id BIGSERIAL PRIMARY KEY,
    doctor_id BIGINT NOT NULL,
    assigned_admin_id BIGINT NOT NULL,
    status VARCHAR(255) NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_doctors_username ON doctors(username);
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_license_number ON doctors(license_number);
CREATE INDEX idx_doctors_verification_token ON doctors(verification_token);
CREATE INDEX idx_doctor_approval_requests_doctor_id ON doctor_approval_requests(doctor_id);
CREATE INDEX idx_doctor_approval_requests_status ON doctor_approval_requests(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctor_approval_requests_updated_at BEFORE UPDATE ON doctor_approval_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

