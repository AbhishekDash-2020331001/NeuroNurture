#!/bin/bash

# Bash script to create a new admin user
# Usage: ./create_admin.sh admin@example.com password123

if [ $# -ne 2 ]; then
    echo "Usage: $0 <email> <password>"
    echo "Example: $0 admin@example.com password123"
    exit 1
fi

EMAIL="$1"
PASSWORD="$2"
JWT_SERVICE_URL="http://localhost:8080"

echo "Creating admin user with email: $EMAIL"

# Create the admin user
echo "Step 1: Creating admin user..."
RESPONSE=$(curl -s -X POST "$JWT_SERVICE_URL/auth/register/admin" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [ $? -eq 0 ]; then
    echo "✅ Admin user created successfully!"
    echo "Response: $RESPONSE"
else
    echo "❌ Failed to create admin user"
    exit 1
fi

# Test login
echo ""
echo "Step 2: Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST "$JWT_SERVICE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt)

if [ $? -eq 0 ]; then
    echo "✅ Login test successful!"
    echo "Response: $LOGIN_RESPONSE"
    
    # Extract user info from JSON response (requires jq)
    if command -v jq &> /dev/null; then
        echo "User ID: $(echo $LOGIN_RESPONSE | jq -r '.id')"
        echo "Email: $(echo $LOGIN_RESPONSE | jq -r '.email')"
        echo "Role: $(echo $LOGIN_RESPONSE | jq -r '.role')"
    fi
else
    echo "❌ Login test failed"
    exit 1
fi

# Clean up
rm -f cookies.txt

echo ""
echo "Script completed successfully!"
