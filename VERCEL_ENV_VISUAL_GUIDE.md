# 🎯 Visual Guide: Adding Environment Variables to Vercel

## Overview
Your app is failing on Vercel because the **GEMINI_API_KEY** is missing. Here's exactly where to add it.

---

## 📍 Step-by-Step with Screenshots

### 1️⃣ Open Your Vercel Dashboard
```
https://vercel.com/dashboard
```

You'll see your projects listed:
- ✅ `virtual-assistant-api` (Backend/Server) ← **THIS ONE**
- ❌ `virtual-assistant-client` (Frontend) ← Not this one

**Click on your BACKEND project.**

---

### 2️⃣ Navigate to Settings

At the top of the page, you'll see tabs:
```
Overview | Deployments | Analytics | Settings | ...
```

**Click on "Settings"**

---

### 3️⃣ Click Environment Variables

On the left sidebar, you'll see:
```
General
Domains
Git
Environment Variables  ← Click this
Functions
...
```

**Click on "Environment Variables"**

---

### 4️⃣ Add Your Variables

You'll see a form with fields:
```
┌─────────────────────────────────────┐
│ Name (KEY)                          │
├─────────────────────────────────────┤
│ GEMINI_API_KEY                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Value                               │
├─────────────────────────────────────┤
│ AIzaSyA...your_actual_api_key       │
└─────────────────────────────────────┘

☑ Production
☑ Preview  
☑ Development

[Add Another] [Save]
```

**Fill in:**
- **Name**: `GEMINI_API_KEY`
- **Value**: Your actual Gemini API key (paste it here)
- **Environment**: Check all three boxes (Production, Preview, Development)
- Click **Save**

---

### 5️⃣ Add All Required Variables

Repeat step 4 for these variables:

```
1. GEMINI_API_KEY = your_gemini_api_key
2. MONGODB_URL = your_mongodb_connection_string
3. JWT_SECRET = your_jwt_secret
```

**Optional (if you use these features):**
```
4. EMAIL_USER = your_email@gmail.com
5. EMAIL_PASSWORD = your_gmail_app_password
6. CLOUDINARY_CLOUD_NAME = your_cloud_name
7. CLOUDINARY_API_KEY = your_cloudinary_key
8. CLOUDINARY_API_SECRET = your_cloudinary_secret
```

---

### 6️⃣ Verify Variables Are Added

After adding, you should see a list like:
```
┌────────────────────┬─────────────────┬──────────────┐
│ Name               │ Value           │ Environments │
├────────────────────┼─────────────────┼──────────────┤
│ GEMINI_API_KEY     │ AIzaSy...       │ P P D        │
│ MONGODB_URL        │ mongodb+srv...  │ P P D        │
│ JWT_SECRET         │ mysecret...     │ P P D        │
└────────────────────┴─────────────────┴──────────────┘
```

Where:
- **P** = Production
- **P** = Preview
- **D** = Development

---

### 7️⃣ Redeploy Your Application

**Option A: Automatic (Recommended)**
```bash
# In your terminal
git add .
git commit -m "Update environment variables"
git push
```

**Option B: Manual**
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **⋮** (three dots) button
4. Select **"Redeploy"**
5. Confirm by clicking **"Redeploy"** again

---

### 8️⃣ Wait for Deployment

You'll see:
```
Building...  ⏳
  └─ Installing dependencies
  └─ Building application
  └─ Uploading build artifacts

✅ Deployment Ready
```

Wait 1-2 minutes for this to complete.

---

### 9️⃣ Test Your Application

1. Open your app: `https://your-app-name.vercel.app`
2. **Sign in** with your account
3. Type or say: **"what is react?"**
4. ✅ You should now get an AI response!

**Expected Response:**
```
"React is a popular JavaScript library for building 
user interfaces, developed by Facebook..."
```

Instead of:
```
"I'm sorry, I'm having trouble connecting to my 
AI service right now."
```

---

## 🔍 How to Check If It Worked

### Method 1: Check Function Logs
1. Go to your deployment
2. Click **"View Function Logs"**
3. Look for these messages:

**✅ Success:**
```
🔑 Testing API Key: AIzaSyABC...
✅ Gemini API key is valid
🤖 AI Chat request from user ID: 673c...
💬 Processing text message...
🤖 Calling Gemini API...
✅ AI response generated successfully
```

**❌ Failure (missing API key):**
```
⚠️ Gemini API key test failed: GEMINI_API_KEY is not set
❌ GEMINI_API_KEY is not set in environment variables
```

---

### Method 2: Test the Health Endpoint
Open this URL in your browser:
```
https://your-backend-name.vercel.app/health
```

**Should return:**
```json
{
  "status": "ok",
  "port": "unknown",
  "timestamp": "2025-12-10T12:36:00.000Z"
}
```

---

## 🎯 Quick Reference: Environment Variable Names

Copy-paste these exact names (case-sensitive):

### Required:
```
GEMINI_API_KEY
MONGODB_URL
JWT_SECRET
```

### Optional:
```
EMAIL_USER
EMAIL_PASSWORD
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
NODE_ENV
PORT
CLIENT_URL
```

---

## ⚠️ Important Notes

### ✅ DO:
- Add variables to the **backend** project (API server)
- Select **all environments** (Production, Preview, Development)
- **Redeploy** after adding variables
- Copy-paste values carefully (no extra spaces)

### ❌ DON'T:
- Add to the frontend project (won't work)
- Forget to redeploy
- Include quotes around values (Vercel adds them automatically)
- Commit `.env` file to git (security risk)

---

## 🎉 Success Indicators

You'll know it worked when:

1. ✅ Vercel logs show: `✅ Gemini API key is valid`
2. ✅ AI responses work in your app
3. ✅ No "trouble connecting to AI service" error
4. ✅ Assistant responds naturally to questions

---

## 🆘 Troubleshooting

### Problem: Still getting AI service error
**Solution:**
- Verify you added variables to the **backend** project
- Check that API key is correct (no typos)
- Make sure you **redeployed** after adding variables

### Problem: Invalid API key error
**Solution:**
- Generate a new key at: https://makersuite.google.com/app/apikey
- Copy it exactly (including any hyphens or special characters)
- Re-add it to Vercel

### Problem: MongoDB connection error
**Solution:**
- Check connection string format
- Allow `0.0.0.0/0` in MongoDB Atlas Network Access
- Ensure database name is included in the URL

---

**Need the API key?** Check your local `server/.env` file or generate a new one at Google AI Studio.

**That's it!** Once you add the environment variable and redeploy, your AI assistant will work perfectly on Vercel! 🚀
