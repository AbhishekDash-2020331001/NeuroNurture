# MongoDB Cloud Setup Guide

## Step 1: Create MongoDB Atlas Account
1. Go to https://cloud.mongodb.com
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a region close to you
4. Give your cluster a name (e.g., "neuronurture-cluster")
5. Click "Create Cluster"

## Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Get Connection String
1. Go to "Clusters" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Update Connection String
Replace `<password>` with your actual password and add the database name:
```
mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/neuronurture_tickets?retryWrites=true&w=majority
```

## Step 6: Set Environment Variable
### Option A: In your IDE (IntelliJ/Eclipse)
1. Go to Run Configuration
2. Add Environment Variable:
   - Name: `MONGODB_URI`
   - Value: Your connection string from Step 5

### Option B: Command Line
```bash
export MONGODB_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/neuronurture_tickets?retryWrites=true&w=majority"
```

### Option C: Create .env file (if using spring-boot-maven-plugin)
Create `.env` file in the parent service directory:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/neuronurture_tickets?retryWrites=true&w=majority
```

## Step 7: Test Connection
1. Start your parent service: `mvn spring-boot:run`
2. Check logs for successful MongoDB connection
3. Test the ticket API endpoints

## Security Notes
- Never commit your actual connection string to version control
- Use environment variables for sensitive data
- Consider setting up IP whitelisting in MongoDB Atlas for production
