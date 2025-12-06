# 🚀 Vercel Deployment Guide

## 📋 Overview

Your app has **TWO separate Vercel projects**:
1. **Backend API** (server) - `https://virtual-assistant-api.vercel.app`
2. **Frontend Client** - Your main app URL

## 🔧 Step 1: Deploy Backend API

### 1.1 Create New Vercel Project for Backend

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Configure Build Settings:**
   - **Root Directory:** `server`
   - **Build Command:** Leave empty or `npm install`
   - **Output Directory:** Leave empty
   - **Install Command:** `npm install`

### 1.2 Set Environment Variables on Vercel (Backend)

Go to: **Project Settings** → **Environment Variables**

Add these variables:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Cookie Secret
COOKIE_SECRET=your_cookie_secret

# Email Configuration (if using email)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary (if using image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Node Environment
NODE_ENV=production
```

### 1.3 Deploy Backend

Click **"Deploy"** - Your backend will be at: `https://your-backend-name.vercel.app`

---

## 🎨 Step 2: Deploy Frontend Client

### 2.1 Create New Vercel Project for Frontend

1. Go to Vercel Dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository (same repo, different project)
4. **Configure Build Settings:**
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2.2 Set Environment Variables on Vercel (Frontend)

Go to: **Project Settings** → **Environment Variables**

Add this variable:

```env
# Point to your deployed backend API
VITE_API_URL=https://your-backend-name.vercel.app

# System commands don't work on Vercel (only local)
VITE_SYSTEM_SERVER_URL=https://your-backend-name.vercel.app
```

### 2.3 Deploy Frontend

Click **"Deploy"** - Your frontend will be at: `https://your-app-name.vercel.app`

---

## ✅ Step 3: Verify Deployment

### 3.1 Test Backend API

Open in browser:
```
https://your-backend-name.vercel.app/health
```

Should return:
```json
{"status":"ok","port":"unknown","timestamp":"..."}
```

### 3.2 Test Frontend

1. Open your frontend URL: `https://your-app-name.vercel.app`
2. Open DevTools Console (F12)
3. Check for: `✅ Using configured API: https://your-backend-name.vercel.app`
4. Try to sign in - should work without CORS errors!

---

## 🔍 Common Issues & Solutions

### Issue 1: CORS Error on Vercel

**Cause:** Frontend can't connect to backend

**Solution:**
1. Check `VITE_API_URL` in frontend Vercel environment variables
2. Make sure it points to backend URL (not localhost!)
3. Redeploy frontend after changing env vars

### Issue 2: "System commands not available"

**Expected Behavior:** System commands (opening apps) only work locally, not on Vercel

**Why:** Vercel is a cloud platform - it can't open apps on your computer

**Solution:** This is normal! The app will show a friendly message. System commands work when running locally.

### Issue 3: Database Connection Error

**Cause:** MongoDB URI not set or invalid

**Solution:**
1. Check MongoDB connection string in backend env vars
2. Make sure MongoDB Atlas allows Vercel IPs (set to `0.0.0.0/0` for all IPs)
3. Check MongoDB Atlas → Network Access

### Issue 4: Environment Variables Not Working

**Solution:**
1. After adding/changing env vars, you MUST redeploy
2. Go to **Deployments** tab → click **"..."** → **"Redeploy"**
3. Don't just refresh - actually redeploy!

---

## 📝 Deployment Checklist

### Backend Deployment ✅
- [ ] Created Vercel project for `server` directory
- [ ] Set all environment variables (MongoDB, JWT, etc.)
- [ ] Deployed successfully
- [ ] `/health` endpoint returns status
- [ ] Database connects successfully

### Frontend Deployment ✅
- [ ] Created Vercel project for `client` directory  
- [ ] Set `VITE_API_URL` to backend URL
- [ ] Deployed successfully
- [ ] Can access the app
- [ ] Sign in/Sign up works
- [ ] No CORS errors

---

## 🔄 Redeploying After Changes

### Backend Changes:
```bash
git add .
git commit -m "Update backend"
git push
```
Vercel auto-deploys from GitHub!

### Frontend Changes:
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys from GitHub!

### Environment Variable Changes:
1. Update in Vercel Dashboard
2. Go to Deployments → Redeploy
3. MUST redeploy for env vars to take effect!

---

## 🌐 Your Final URLs

After deployment, you'll have:

```
Frontend: https://virtual-assistant-m4wu.vercel.app
Backend:  https://virtual-assistant-api.vercel.app
```

Update your frontend `.env` for local development:
```env
# Local development
VITE_API_URL=http://localhost:8001

# Production - Set this in Vercel Environment Variables
# VITE_API_URL=https://virtual-assistant-api.vercel.app
```

---

## 💡 Pro Tips

1. **Use Git Branches:** Create a `dev` branch for testing before pushing to `main`
2. **Environment Variables:** Keep local `.env` for development, set production values in Vercel
3. **Logs:** Check Vercel → Functions → Logs to debug issues
4. **System Commands:** Only work locally - tell users to run locally for app opening features
5. **MongoDB:** Use MongoDB Atlas (free tier works great!)

---

## 🎉 Success!

Once deployed, your app will:
- ✅ Work on any device with internet
- ✅ Have no CORS errors
- ✅ Handle authentication properly
- ✅ Connect to your database
- ⚠️ System commands (opening apps) only work locally

**Share your app URL with anyone!** 🚀
