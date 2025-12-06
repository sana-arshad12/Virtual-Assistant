# System Commands - How They Work

## 🌐 Online (Vercel/Web) vs 💻 Local Deployment

### ✅ Works on BOTH Online and Local:
- AI Chat responses
- Image analysis
- Web searches
- Information lookup
- User authentication
- Profile management
- Assistant customization

### ⚠️ Only Works LOCALLY (Your Device):
- Open File Manager
- Open Applications (Word, Excel, Notepad, etc.)
- System Settings
- Task Manager
- Calculator
- Any OS-level commands

## Why System Commands Don't Work Online?

### Security Reasons:
1. **Browser Sandbox**: Web browsers block access to your file system and applications for security
2. **Server Location**: When deployed on Vercel, the server runs in the cloud (not on your device)
3. **No System Access**: Cloud servers can't control your local device's applications

### Technical Reasons:
- System commands require **local server** running on your device
- Commands like `explorer`, `calc`, `notepad` only exist on Windows
- Mac users have different commands (`open`, `calculator`)
- Linux users have different commands (`nautilus`, `gnome-calculator`)

## 🔧 How to Enable System Commands

### Option 1: Run Locally (Recommended for System Commands)
```bash
# Terminal 1 - Start Backend
cd server
npm install
npm start

# Terminal 2 - Start Frontend
cd client
npm install
npm run dev
```

Now visit `http://localhost:5173` - System commands will work!

### Option 2: Use Online Version (No System Commands)
Just use the deployed Vercel URL - perfect for:
- Chatting with AI
- Getting information
- Image analysis
- Web searches

## 🎯 Best Practice

**For Personal Use**: Run locally to access ALL features including system commands

**For Sharing**: Use the online deployment - others can chat with your AI but won't execute commands on their devices (for security)

## 💡 Feature Summary

| Feature | Online (Vercel) | Local |
|---------|----------------|-------|
| AI Chat | ✅ | ✅ |
| Image Analysis | ✅ | ✅ |
| Voice Recognition | ✅ | ✅ |
| System Commands | ❌ | ✅ |
| Open Apps | ❌ | ✅ |
| File Manager | ❌ | ✅ |

---

**Note**: This is a security feature, not a bug! It protects your device from unauthorized access.
