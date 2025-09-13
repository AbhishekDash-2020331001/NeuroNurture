# Doctor Service Authentication Setup

This document describes the authentication system implemented for the Doctor service, following the same pattern as the School service.

## Overview

The Doctor authentication system includes:
- Registration with email verification
- Admin approval workflow
- JWT-based login authentication
- Professional email integration
- Real-time status checking
- Secure token management

## Database Setup

1. **Create the database:**
   ```sql
   psql -U postgres -f create_doctor_tables.sql
   ```

2. **Database Tables:**
   - `doctors` - Main doctor entity table
   - `doctor_approval_requests` - Admin approval workflow table

## Configuration

### Environment Variables
Set the following environment variables:
```bash
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Application Properties
The service is configured to run on port `8093` and connect to PostgreSQL database `doctordb`.

## API Endpoints

### Registration
- **POST** `/api/doctor/auth/register`
- **Body:** DoctorRegistrationRequest (username, email, password, firstName, lastName, phone, specialization, licenseNumber, hospital, address, city, state, zipCode, yearsOfExperience)

### Login
- **POST** `/api/doctor/auth/login`
- **Body:** DoctorLoginRequest (email, password)
- **Response:** DoctorAuthResponse with JWT token and doctor info

### Email Verification
- **GET** `/api/doctor/auth/verify-email?token={verificationToken}`
- Verifies email and creates admin approval request

### Status Check
- **GET** `/api/doctor/auth/verification-status?email={email}`
- Returns: `pending_email`, `pending_approval`, or `approved`

## Authentication Flow

1. **Registration:**
   - Doctor fills registration form
   - System validates unique username, email, and license number
   - Password is encrypted and stored
   - Verification email sent via SendGrid
   - Doctor status: `emailVerified = false`, `isVerified = false`

2. **Email Verification:**
   - Doctor clicks verification link from email
   - System verifies token and sets `emailVerified = true`
   - Admin approval request created with random admin assignment
   - Doctor status: `emailVerified = true`, `isVerified = false`

3. **Admin Approval:**
   - Admin reviews doctor application
   - Once approved, `isVerified = true`
   - Doctor can now login

4. **Login:**
   - Doctor enters email and password
   - System validates all conditions:
     - Doctor exists
     - Password matches
     - Account enabled
     - Email verified
     - Admin approved
   - JWT token generated and returned

## Security Features

- **Password Encryption:** BCrypt password encoding
- **JWT Tokens:** HMAC SHA-256 signed tokens with configurable expiration
- **CORS Configuration:** Configured for frontend domains
- **Email Verification:** 24-hour token expiration
- **Admin Approval:** Multi-step verification process

## Frontend Integration

The frontend should implement:
- Doctor registration form
- Doctor login form
- Email verification page
- Pending approval status page
- JWT token storage and management

## Dependencies

Key dependencies added to `pom.xml`:
- Spring Security
- JWT (jjwt)
- SendGrid for email
- Spring WebFlux for HTTP client

## Service Discovery

The service is configured to register with Eureka service discovery on port 8761.

## Testing

To test the authentication flow:
1. Start the doctor service
2. Register a new doctor
3. Check email for verification link
4. Verify email
5. Wait for admin approval (or manually approve in database)
6. Login with verified credentials

## Error Handling

The system handles various error scenarios:
- Duplicate username/email/license number
- Invalid verification tokens
- Expired tokens
- Account not verified
- Account not approved
- Network errors

## Next Steps

After implementing the backend authentication:
1. Create frontend components for doctor authentication
2. Implement doctor dashboard
3. Add patient management features
4. Integrate with other services

