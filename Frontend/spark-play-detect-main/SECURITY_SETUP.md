# 🔐 Security Setup Guide for Ella AI

## ⚠️ **IMPORTANT: API Key Security**

Your Gemini API key should **NEVER** be exposed in the code, especially when pushing to GitHub.

## 🔑 **How to Set Up Your API Key Securely**

### Step 1: Get Your API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### Step 2: Create Environment File
1. In the `Frontend/spark-play-detect-main/` directory, create a file called `.env`
2. Add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Step 3: Verify Setup
1. Restart your development server
2. Test the chat functionality
3. Check the console for any warnings

## 🛡️ **Security Best Practices**

### ✅ **DO:**
- Use environment variables for API keys
- Add `.env` to your `.gitignore` file
- Use different API keys for development and production
- Regularly rotate your API keys

### ❌ **DON'T:**
- Never commit API keys to Git
- Never share API keys publicly
- Never hardcode API keys in your source code
- Never post API keys in chat or forums

## 📁 **File Structure**
```
Frontend/spark-play-detect-main/
├── .env                    # Your actual API key (NOT in Git)
├── env.example            # Example file (safe to commit)
├── .gitignore             # Should include .env
└── src/
    └── services/
        └── geminiService.ts # Uses environment variable
```

## 🔧 **Troubleshooting**

### If the chat doesn't work:
1. Check that your `.env` file exists
2. Verify the API key is correct
3. Restart your development server
4. Check the browser console for errors

### If you see a warning about missing API key:
1. Make sure your `.env` file is in the correct location
2. Verify the variable name is `VITE_GEMINI_API_KEY`
3. Restart your development server

## 🚀 **Deployment**

When deploying to production:
1. Set the environment variable in your hosting platform
2. Never commit the `.env` file
3. Use a production API key with appropriate restrictions

## 📞 **Support**

If you need help with the API key setup, check the Google AI Studio documentation or contact your development team.
