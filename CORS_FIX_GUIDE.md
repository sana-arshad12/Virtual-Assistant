# 🔧 CORS Error Fix Guide

## The Error You're Seeing

```
Access to fetch at 'https://virtual-assistant-api.vercel.app/api/auth/signin'
has been blocked by CORS policy
```

## 🎯 What This Means

This is **NOT** related to the app opening commands. This is a server configuration issue.

## ✅ Solutions

### Solution 1: Update Your `.env` File (QUICKEST)

Your client is trying to connect to the production server on Vercel. Change to local:

**Client `.env` file:**
```env
# Change from production to local
VITE_API_URL=http://localhost:8000
VITE_SYSTEM_SERVER_URL=http://localhost:8001
```

### Solution 2: Make Sure Both Servers Are Running

You need TWO servers running:

**Terminal 1 - Main Server (Port 8000):**
```bash
cd server
npm run dev
```

**Terminal 2 - System Server (Port 8001):**
```bash
cd server
npm start
```

**Terminal 3 - Client (Port 5173):**
```bash
cd client
npm run dev
```

### Solution 3: Check Server Ports

Make sure your servers are on the correct ports:
- Main API Server: `http://localhost:8000`
- System Command Server: `http://localhost:8001`
- Client: `http://localhost:5173`

## 🔍 Quick Diagnostics

### 1. Test if servers are running:

Open these URLs in your browser:
```
http://localhost:8000/health
http://localhost:8001/health
```

Both should return:
```json
{"status": "ok", "port": "8000", "timestamp": "..."}
```

### 2. Check your client console:

Look for messages like:
```
✅ Server found on port 8000
✅ Using production API: http://localhost:8000
```

## 📝 Common Issues

### Issue 1: "Server not found"
**Fix:** Start your backend server first
```bash
cd server
npm run dev
```

### Issue 2: "Port already in use"
**Fix:** Kill the process or use a different port
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### Issue 3: "CORS policy error"
**Fix:** Make sure your `.env` points to local server, not Vercel

## 🚀 Restart Everything (Clean Slate)

1. **Stop all running servers** (Ctrl + C in terminals)

2. **Check `.env` file:**
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_SYSTEM_SERVER_URL=http://localhost:8001
   ```

3. **Start Main Server:**
   ```bash
   cd server
   npm run dev
   ```
   Wait for: `🚀 Server running at http://localhost:8000`

4. **Start Client:**
   ```bash
   cd client
   npm run dev
   ```
   Wait for: `Local: http://localhost:5173/`

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

## ✅ Updated CORS Configuration

I've already updated your server with better CORS handling. The new configuration:
- ✅ Allows all origins (development and production)
- ✅ Properly handles credentials
- ✅ Supports preflight requests
- ✅ Works with Vercel deployment

## 🎯 Test the Fix

After restarting:

1. Open DevTools Console
2. Try to sign in
3. You should see:
   ```
   ✅ Server found on port 8000
   📥 POST /api/auth/signin
   ```

No more CORS errors! 🎉

## 💡 For Production (Vercel)

If you deploy to Vercel, make sure:

1. **Environment variables on Vercel:**
   ```
   VITE_API_URL=https://your-vercel-api.vercel.app
   ```

2. **Backend deployed separately** with CORS enabled

3. **System commands disabled** (they only work locally)

---

**The app opening commands will work perfectly on any Windows device - the CORS error is unrelated!** 🪟✨
