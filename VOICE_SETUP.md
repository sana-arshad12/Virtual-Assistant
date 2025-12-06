# 🎤 Voice Recognition Setup Guide

## Browser Requirements

Voice recognition works best on:
- ✅ **Google Chrome** (Recommended)
- ✅ **Microsoft Edge** (Recommended)
- ✅ **Opera**
- ❌ Firefox (Limited support)
- ❌ Safari (Limited support)

## How to Use Voice Commands

### 1. **Enable Microphone Permission**
   - When you first click the microphone button, your browser will ask for permission
   - Click **"Allow"** to enable voice recognition
   - If you accidentally blocked it, click the 🔒 or ⓘ icon in the address bar to change permissions

### 2. **Activate Voice Recognition**
   - Click the **microphone button** (bottom right of chat input)
   - When active, the button turns **green** and shows "Listening..."
   - The status indicator will show: 🎤 Listening...

### 3. **Use Wake Word**
   Say your assistant's name (e.g., "**Jad**" or "**Neelam**") followed by your command:
   
   Examples:
   - "**Jad**, open calculator"
   - "**Jad**, what time is it"
   - "**Jad**, search Google for weather"
   - "**Jad**, open notepad"

### 4. **Turn Off Voice Recognition**
   - Click the microphone button again to stop listening
   - The button will turn gray when inactive

## Common Issues & Solutions

### ❌ "Speech recognition not supported"
**Solution:** Use Google Chrome or Microsoft Edge browser

### ❌ Microphone permission denied
**Solutions:**
1. Click the 🔒 icon in address bar
2. Find "Microphone" in site settings
3. Change to "Allow"
4. Refresh the page

### ❌ Voice not detected
**Solutions:**
1. Check your microphone is working (test in other apps)
2. Speak clearly and at normal volume
3. Make sure you're saying the wake word first
4. Reduce background noise
5. Try speaking closer to your microphone

### ❌ Works on computer but not on phone
**Solutions:**
1. Use Chrome or Edge on mobile
2. Check browser permissions in phone settings
3. Try using HTTPS (Vercel deployment) instead of HTTP (localhost)
4. Some mobile browsers require secure connection (HTTPS) for microphone access

## Mobile Device Setup

### Android:
1. Use **Chrome** browser
2. Grant microphone permission when prompted
3. Works best on Android 8.0+

### iPhone/iPad:
1. Voice recognition has **limited support** on iOS
2. Try using **Safari** or **Chrome**
3. May not work reliably - consider using typed messages instead

## For Deployment (Vercel/Production)

Voice recognition requires **HTTPS** (secure connection):
- ✅ Works automatically on Vercel (https://your-app.vercel.app)
- ❌ May not work on HTTP (http://localhost:5173) on mobile
- ✅ Works on localhost for desktop development

## Testing Voice Recognition

1. **Open browser console** (F12 or Right-click > Inspect > Console)
2. Look for these messages:
   - ✅ "Speech recognition is supported"
   - 🎤 "Listening for 'YourAssistantName'..."
   - 🔍 "Heard: ..." (shows what was detected)
   - ✅ "Wake word detected!"

3. If you see errors, check the solutions above

## Tips for Best Results

1. **Speak clearly** - Pronounce words clearly at normal pace
2. **Use wake word first** - Always say assistant name before command
3. **Reduce noise** - Find a quiet environment
4. **Use good microphone** - External mic better than built-in laptop mic
5. **Check volume** - Not too quiet, not too loud
6. **Wait for confirmation** - Let assistant respond before next command

## Supported Commands

- System commands: "open calculator", "open notepad"
- Web search: "search Google for [query]"
- Time/Date: "what time is it", "what's the date"
- General chat: "hello", "how are you", "who created you"
- And many more! Just ask naturally.

---

**Still having issues?** Check the browser console for detailed error messages.
