# Multi-Role Authentication System

This document describes the updated JWT authentication service that supports multiple user roles: Parent, School, Doctor, and Admin.

## Overview

The authentication system has been enhanced to support role-based access control with the following user types:

- **PARENT**: Regular users who can track their children's development (supports Google OAuth)
- **SCHOOL**: Educational institutions that can manage students and organize competitions
- **DOCTOR**: Medical professionals who can monitor patients and assign therapeutic tasks
- **ADMIN**: System administrators with full access (separate frontend)

## Database Schema

### Updated User Table (`app_user`)

The user table has been extended with the following new fields:

```sql
-- Role and verification
user_role VARCHAR(20) NOT NULL
is_verified BOOLEAN DEFAULT FALSE
```

**Note**: Additional user information (names, addresses, licenses, etc.) is handled by separate services for each role. This authentication service only manages authentication-related data.

### Migration

Run the migration script to update your existing database:

```bash
psql -d your_database -f add_user_role_fields.sql
```

## API Endpoints

### Registration Endpoints

#### 1. Parent Registration
```
POST /auth/register/parent
Content-Type: application/json

{
  "username": "parent@example.com",
  "password": "password123",
  "email": "parent@example.com"
}
```

#### 2. School Registration
```
POST /auth/register/school
Content-Type: application/json

{
  "username": "school@example.edu",
  "password": "password123",
  "email": "school@example.edu"
}
```

#### 3. Doctor Registration
```
POST /auth/register/doctor
Content-Type: application/json

{
  "username": "doctor@clinic.com",
  "password": "password123",
  "email": "doctor@clinic.com"
}
```

#### 4. Admin Registration
```
POST /auth/register/admin
Content-Type: application/json

{
  "username": "admin@company.com",
  "password": "password123",
  "email": "admin@company.com"
}
```

### Login Endpoint

```
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "uuid-refresh-token"
}
```

The JWT token now includes the user's role in the claims.

### Other Endpoints

All existing endpoints remain unchanged:
- `GET /auth/verify-email?token=...`
- `POST /auth/resend-verification`
- `GET /auth/check-email-verified`
- `POST /auth/change-password`
- `POST /auth/refresh-token`
- `GET /auth/session`
- `GET /auth/me`
- `POST /auth/logout`

## User Verification Flow

### Parents
- **Email Verification**: Required
- **Account Verification**: Automatic (is_verified = true)
- **Google OAuth**: Available (automatically sets role to PARENT)

### Schools
- **Email Verification**: Required
- **Account Verification**: Manual review required (is_verified = false initially)
- **Google OAuth**: Not available

### Doctors
- **Email Verification**: Required
- **Account Verification**: Manual review required (is_verified = false initially)
- **Google OAuth**: Not available

### Admins
- **Email Verification**: Required
- **Account Verification**: Automatic (is_verified = true)
- **Google OAuth**: Not available

## JWT Token Structure

The JWT token now includes role information:

```json
{
  "sub": "user@example.com",
  "role": "PARENT",
  "exp": 1234567890
}
```

## Security Considerations

1. **Role-based Access**: Each user type has different permissions and access levels
2. **Verification Process**: Only schools and doctors require manual verification; parents and admins are auto-verified
3. **Email Verification**: All users must verify their email before login
4. **Token Security**: JWT tokens include role information for authorization

## Integration with Frontend

The frontend authentication pages should call the appropriate registration endpoints:

- Parent registration form → `POST /auth/register/parent`
- School registration form → `POST /auth/register/school`
- Doctor registration form → `POST /auth/register/doctor`
- Admin registration form → `POST /auth/register/admin` (separate admin frontend)

All login forms use the same endpoint: `POST /auth/login`

**Google OAuth**: Only available for parents. Other roles must use manual registration.

## Backward Compatibility

- Existing users will be automatically assigned the `PARENT` role
- The original `/auth/register` endpoint still works and creates parent accounts
- All existing authentication flows remain functional

## Next Steps

1. Run the database migration script
2. Update frontend to use new registration endpoints
3. Implement role-based authorization in other services
4. Set up manual verification process for schools and doctors only
5. Configure role-based access control in the gateway service
