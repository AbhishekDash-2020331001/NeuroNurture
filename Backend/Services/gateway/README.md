# Simple API Gateway

A very simple API Gateway implementation for the NeuroNurture parent service.

## Features

- **JWT Token Validation**: Validates JWT tokens from cookies or Authorization headers
- **Parent Service Routing**: Routes requests to the parent service (port 8082)
- **Authentication Service Routing**: Routes auth requests to the auth service (port 8080)
- **CORS Support**: Handles cross-origin requests
- **Simple Implementation**: Minimal complexity, just token validation and routing

## How It Works

1. **Request comes to Gateway** (port 8085)
2. **JWT Filter validates token**:
   - Checks Authorization header: `Bearer <token>`
   - Falls back to `jwt` cookie
   - Validates token signature and expiration
3. **If valid**: Adds user headers and routes to target service
4. **If invalid**: Returns 401 Unauthorized

## Routes

| Path | Target Service | Port | Authentication Required |
|------|----------------|------|------------------------|
| `/auth/**` | Authentication Service | 8080 | No |
| `/api/parents/**` | Parent Service | 8082 | Yes |
| `/api/tickets/**` | Parent Service | 8082 | Yes |
| `/api/test/**` | Parent Service | 8082 | Yes |

## Public Endpoints (No Auth Required)

- `/auth/login`
- `/auth/register`
- `/auth/verify-email`
- `/auth/resend-verification`
- `/auth/session`
- `/auth/me`

## Running the Gateway

1. **Start Config Server** (port 8888)
2. **Start Authentication Service** (port 8080)
3. **Start Parent Service** (port 8082)
4. **Start Gateway**:
   ```bash
   cd Backend/Services/gateway
   mvn spring-boot:run
   ```

## Testing

### Test with curl:

```bash
# Test public endpoint (should work)
curl http://localhost:8085/auth/session

# Test protected endpoint without token (should fail)
curl http://localhost:8085/api/parents

# Test protected endpoint with token (should work)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8085/api/parents
```

## Configuration

The gateway uses the same JWT secret as the authentication service for token validation.

## Headers Added to Downstream Services

When a valid token is provided, the gateway adds these headers:
- `X-User-Id`: Username/email from token
- `X-User-Role`: User role from token
- `X-User-Email`: Email from token