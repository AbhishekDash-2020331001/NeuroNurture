# Admin Authentication Setup

The admin frontend has been integrated with the JWT authentication service. Here's how to set it up and test it.

## Prerequisites

1. **JWT Auth Service Running**: Make sure the JWT authentication service is running on `http://localhost:8080`
2. **Database**: Ensure PostgreSQL is running and the JWT service can connect to it

## Creating an Admin User

Since admin users need to be created manually (no public registration), you can create one using the JWT service API:

### Method 1: Using curl

```bash
curl -X POST http://localhost:8080/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin@neuronurture.com",
    "email": "admin@neuronurture.com", 
    "password": "admin123"
  }'
```

### Method 2: Using a REST client (Postman, Insomnia, etc.)

- **URL**: `POST http://localhost:8080/auth/register/admin`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "username": "admin@neuronurture.com",
  "email": "admin@neuronurture.com",
  "password": "admin123"
}
```

## Admin User Ready

Admin users are automatically verified and don't require email verification. After successful registration, you can proceed directly to login.

## Testing the Admin Frontend

1. **Start the Admin Frontend**:
   ```bash
   cd Frontend/admin-website
   npm install
   npm run dev
   ```

2. **Access the Admin Panel**: Navigate to `http://localhost:3001`

3. **Login**: Use the admin credentials you created:
   - Email: `admin@neuronurture.com`
   - Password: `admin123`

## Features

The admin frontend now includes:

- ✅ **Real JWT Authentication**: Uses the JWT service for authentication
- ✅ **Session Management**: Automatically checks session validity
- ✅ **Role Verification**: Ensures only ADMIN role users can access
- ✅ **Automatic Logout**: Handles token expiration gracefully
- ✅ **Loading States**: Shows loading indicators during auth checks
- ✅ **Error Handling**: Proper error messages for failed authentication

## Security Notes

- Admin users are created manually and are automatically verified
- Only users with `ADMIN` role can access the admin panel
- Sessions are validated every 5 minutes automatically
- JWT tokens are stored in httpOnly cookies for security

## Troubleshooting

### "Invalid credentials or insufficient permissions"
- Make sure the user exists in the database
- Verify the user has `ADMIN` role
- Check that the user was created successfully

### "Session check error"
- Ensure the JWT service is running on port 8080
- Check CORS configuration in the JWT service
- Verify database connection

### Admin user not found
- Create the admin user using the registration endpoint
- Verify the user was created with `ADMIN` role
- Ensure the user was created successfully
