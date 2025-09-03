# Environment Variables

This document lists the required environment variables for the authentication service.

## Required Environment Variables

### SendGrid Configuration
```bash
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

**Description**: Your SendGrid API key for sending verification emails.

**How to get it**:
1. Go to [SendGrid Console](https://app.sendgrid.com/)
2. Navigate to **Settings > API Keys**
3. Create a new API key with **Mail Send** permissions
4. Copy the API key

## Setting Environment Variables

### Windows (PowerShell)
```powershell
$env:SENDGRID_API_KEY="your_sendgrid_api_key_here"
```

### Windows (Command Prompt)
```cmd
set SENDGRID_API_KEY=your_sendgrid_api_key_here
```

### Linux/Mac
```bash
export SENDGRID_API_KEY="your_sendgrid_api_key_here"
```

### For Development
Create a `.env` file in the project root (make sure it's in `.gitignore`):
```
SENDGRID_API_KEY=your_sendgrid_api_key_here
```

## Security Notes

- **Never commit API keys to version control**
- **Use environment variables for all sensitive data**
- **The `.env` file should be in `.gitignore`**
- **Use different API keys for development and production**

## Verification

To verify the environment variable is set correctly:
1. Start the authentication service
2. Try registering a new user
3. Check the server logs for email sending status
4. Check your email for the verification email
