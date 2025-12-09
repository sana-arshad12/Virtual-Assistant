# Vercel Environment Variables Setup

## The Issue
Your app works locally but shows "I'm sorry, I'm having trouble connecting to my AI service right now" on Vercel because the **GEMINI_API_KEY** environment variable is missing.

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your API Keys
Make sure you have:
1. **GEMINI_API_KEY** - Your Google Gemini AI API key
2. **MONGO_URI** - Your MongoDB connection string
3. **JWT_SECRET** - Your JWT secret key
4. **CLOUDINARY** variables (if using Cloudinary)
5. **EMAIL** variables (if using email)

### Step 2: Add to Vercel Dashboard

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your **backend project** (e.g., `virtual-assistant-api`)
3. Click on **"Settings"** tab
4. Click on **"Environment Variables"** in the left sidebar
5. Add the following variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES=7d
NODE_ENV=production
PORT=8000

# Email configuration (if using email)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourapp.com

# Cloudinary (if using image upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL for CORS
CLIENT_URL=https://your-frontend-app.vercel.app
```

6. For each variable:
   - Enter the **Key** (e.g., `GEMINI_API_KEY`)
   - Enter the **Value** (your actual API key)
   - Select environments: **Production**, **Preview**, **Development** (or select all)
   - Click **"Save"**

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add GEMINI_API_KEY
# Then paste your API key when prompted

# Add other variables
vercel env add MONGO_URI
vercel env add JWT_SECRET
# etc...
```

### Step 3: Redeploy Your Backend
After adding environment variables, you need to redeploy:

1. **Automatic**: Push a new commit to your repository (triggers auto-deploy)
   ```bash
   git add .
   git commit -m "Update environment variables"
   git push
   ```

2. **Manual**: Or redeploy from Vercel dashboard
   - Go to your project
   - Click **"Deployments"** tab
   - Click the **three dots** on the latest deployment
   - Click **"Redeploy"**

### Step 4: Verify Environment Variables

After deployment, check if variables are loaded:

1. Go to your backend URL: `https://your-backend.vercel.app/health`
2. Check the **Vercel deployment logs**:
   - Go to your deployment
   - Click on **"View Function Logs"**
   - Look for: `✅ Gemini API key is valid`

### Step 5: Test Your Frontend

1. Open your frontend: `https://your-frontend.vercel.app`
2. Sign in with your account
3. Ask a question like "what is react?"
4. You should now get an AI response instead of the error message!

## Common Issues

### Issue 1: Still getting "AI service error" after adding variables
**Solution**: 
- Make sure you added the variables to the **correct project** (backend, not frontend)
- Redeploy after adding variables
- Check deployment logs for errors

### Issue 2: Invalid API Key error
**Solution**:
- Verify your GEMINI_API_KEY is correct
- Make sure there are no extra spaces in the value
- Get a new key from: https://makersuite.google.com/app/apikey

### Issue 3: MongoDB connection error
**Solution**:
- Verify your MONGO_URI includes the database name
- Check if your IP is whitelisted in MongoDB Atlas (allow `0.0.0.0/0` for Vercel)
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

## Finding Your Gemini API Key

If you don't have a Gemini API key:

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key
5. Add it to Vercel environment variables

## Security Notes

⚠️ **IMPORTANT**:
- Never commit API keys to your repository
- Always use environment variables
- Keep your `.env` file in `.gitignore`
- Regenerate keys if they're ever exposed

## Quick Check Commands

Test if your backend can access the environment variables:

```bash
# Test your backend locally first
cd server
node -e "require('dotenv').config(); console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...')"
```

## Expected Console Output (Vercel Logs)

When everything is working, you should see:
```
🔑 Testing API Key: AIzaSyABC123...
✅ Gemini API key is valid
🤖 AI Chat request from user ID: 673c...
💬 Processing text message for User with assistant Assistant
🤖 Calling Gemini API...
🤖 Gemini API response received
```

## Need Help?

If you're still facing issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Make sure the API key is valid
4. Test the backend endpoint directly: `https://your-backend.vercel.app/api/ai/test`

---

**Summary**: Add `GEMINI_API_KEY` and other environment variables to your Vercel backend project, redeploy, and your AI responses will work on production! 🚀
