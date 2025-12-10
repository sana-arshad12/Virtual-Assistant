# 🔍 Debug Vercel AI Issue

## Current Situation
- ✅ API key is set in Vercel (confirmed from screenshot)
- ✅ Works perfectly locally
- ❌ Shows "trouble connecting to AI service" on Vercel
- ❌ System commands don't work on Vercel (this is EXPECTED - serverless environment)

## Why System Commands Don't Work on Vercel

**This is NORMAL and EXPECTED:**
- Vercel runs in a **serverless environment** (no direct system access)
- Cannot open apps like Calculator, File Manager, Notepad
- Cannot access your local file system
- Cannot execute Windows commands

**System commands ONLY work locally** where the app has direct system access.

## What SHOULD Work on Vercel
- ✅ AI chat responses (asking questions)
- ✅ General conversation
- ✅ Information lookup
- ✅ Web-based features

## Debug Steps (After Deployment Completes)

### Step 1: Check Environment Variables
Open this URL in your browser:
```
https://your-backend-app.vercel.app/debug-env
```

**Expected Output:**
```json
{
  "hasGeminiKey": true,
  "geminiKeyLength": 39,
  "geminiKeyPreview": "AIzaSyABC123...",
  "isVercel": true,
  "nodeEnv": "production",
  "envVars": ["GEMINI_API_KEY", "MONGODB_URL", "JWT_SECRET"]
}
```

### Step 2: Test AI Directly
Use a tool like Postman or curl:
```bash
curl -X POST https://your-backend-app.vercel.app/test-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "what is react?"}'
```

**Expected:**
- Success: Returns AI response
- Failure: Shows exact error message

### Step 3: Check Vercel Logs
1. Go to Vercel Dashboard
2. Click your backend project
3. Click "Deployments" → Latest deployment
4. Click "View Function Logs"

**Look for:**
- `🔑 Testing API Key:` - Shows if API key loaded
- `✅ Gemini API key is valid` - API key works
- `❌ Gemini API Call Failed:` - Shows exact error

### Step 4: Test in Your App
1. Open your frontend app
2. Sign in
3. Ask: "what is react?" (general question, no system commands)
4. Check browser console (F12) for errors

## Common Issues & Solutions

### Issue 1: API Key Not Loaded
**Symptom:** `hasGeminiKey: false` in debug endpoint

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify `GEMINI_API_KEY` exists
3. Check no extra spaces or quotes
4. Redeploy

### Issue 2: Invalid API Key
**Symptom:** `⚠️ Gemini API key test failed: API key not valid`

**Solution:**
1. Generate new key: https://makersuite.google.com/app/apikey
2. Update in Vercel environment variables
3. Redeploy

### Issue 3: Timeout
**Symptom:** `Gemini API timeout after 25 seconds`

**Solution:**
- This is a Vercel function timeout (free plan = 10s, pro = 60s)
- I've increased to 30s max
- Gemini should respond in <5s normally

### Issue 4: Rate Limit
**Symptom:** `Error: 429 Too Many Requests`

**Solution:**
- Google Gemini free tier limits
- Wait a few minutes and try again
- Or upgrade Gemini API plan

### Issue 5: Network/Firewall
**Symptom:** `ECONNREFUSED` or `ETIMEDOUT`

**Solution:**
- Google might be blocking Vercel IPs (rare)
- Check Gemini API dashboard for blocked requests
- Try using a different Gemini model

## Expected Behavior

### ✅ On Local:
```
User: "open calculator"
Bot: "I'll open the calculator for you!"
[Calculator opens on your computer]
```

### ✅ On Vercel:
```
User: "what is react?"
Bot: "React is a JavaScript library for building user interfaces..."
```

### ❌ On Vercel (System Commands):
```
User: "open calculator"
Bot: "System commands are not available in cloud deployments. 
     This feature only works on your local device where the 
     app has system access."
```

## What Changed

1. **Fixed model name**: `gemini-2.5-flash` → `gemini-1.5-flash`
2. **Added API key sanitization**: Removes quotes/spaces
3. **Added timeout handling**: 25-second timeout
4. **Added debug endpoints**: `/debug-env` and `/test-ai`
5. **Improved error logging**: Shows exact Gemini API errors
6. **Increased function timeout**: Up to 30 seconds

## Next Steps

1. **Wait 2-3 minutes** for Vercel deployment to complete
2. **Test `/debug-env` endpoint** to verify API key is loaded
3. **Check Vercel function logs** for detailed error messages
4. **Test simple AI question** like "what is react?"
5. **Share the logs** if still not working

## Important Notes

⚠️ **System commands will NEVER work on Vercel** - this is by design. Vercel is serverless and cannot access your local system.

✅ **AI responses SHOULD work** - if they don't, we need to check the logs to see the exact error.

---

**After deployment, please:**
1. Test the `/debug-env` endpoint
2. Try asking a simple question in your app
3. Check the Vercel function logs
4. Share any error messages you see

This will help us identify the exact issue! 🔍
