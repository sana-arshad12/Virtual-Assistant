# Vercel Deployment Guide

## 🚀 Deploying to Vercel (Two Separate Deployments)

Your Virtual Assistant project needs **TWO separate deployments** on Vercel:
1. **Backend API** (server folder)
2. **Frontend Client** (client folder)

---

## 📦 Part 1: Deploy Backend (Server)

### Step 1: Create New Vercel Project for Backend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `Virtual-Assistant`
4. Configure the project:
   - **Project Name**: `virtual-assistant-api`
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

### Step 2: Add Environment Variables
In Vercel project settings, add these environment variables:

```
MONGODB_URL=mongodb+srv://sanaarshad1209:qm0m9cKum7LEdANB@cluster0.qdh6y0l.mongodb.net/virtual_assistant
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=dnkjkfqxy
CLOUDINARY_API_KEY=158581924645671
CLOUDINARY_API_SECRET=2zhD9X690a4hJCOh0yEV7Tzg5s4
GEMINI_API_KEY=AIzaSyAhFKu21cMthno16BoxOQt7HkgjOoXsLpQ
EMAIL_USER=sanaarshad1209@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=production
```

### Step 3: Deploy Backend
- Click **"Deploy"**
- Your backend will be available at: `https://virtual-assistant-api.vercel.app`

---

## 🎨 Part 2: Deploy Frontend (Client)

### Step 1: Update API URL in Client
Before deploying frontend, update the API URL to point to your deployed backend.

Create `client/.env.production`:
```
VITE_API_URL=https://virtual-assistant-api.vercel.app
```

### Step 2: Create New Vercel Project for Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import the SAME GitHub repository
4. Configure the project:
   - **Project Name**: `virtual-assistant-client`
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Deploy Frontend
- Click **"Deploy"**
- Your frontend will be available at: `https://virtual-assistant-client.vercel.app`

---

## 🔧 Update CORS Settings

After deployment, update your backend CORS to allow the frontend domain:

In `server/index.js`, update the CORS configuration:
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://virtual-assistant-client.vercel.app" // Add your frontend URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));
```

---

## 📝 Important Notes

### Backend Deployment:
- ✅ Serverless functions (API routes work automatically)
- ✅ MongoDB connection works
- ✅ Environment variables are secure
- ⚠️ First request might be slow (cold start)

### Frontend Deployment:
- ✅ Static site hosting
- ✅ Fast global CDN
- ✅ Automatic SSL certificate

### Limitations on Vercel Free Tier:
- Serverless functions timeout after 10 seconds
- 100GB bandwidth per month
- No WebSocket support (for real-time features)

---

## 🐛 Troubleshooting

### 404 Error:
- Check if `vercel.json` is in the root directory
- Verify Root Directory is set correctly in Vercel settings

### CORS Error:
- Add your Vercel frontend URL to CORS origins in backend
- Redeploy backend after updating CORS

### API Not Working:
- Check Environment Variables in Vercel dashboard
- View deployment logs in Vercel
- Test API endpoints directly: `https://your-api.vercel.app/health`

### Email Not Sending:
- Ensure EMAIL_USER and EMAIL_PASSWORD are set in Vercel
- Gmail App Password must be correct

---

## 🔄 Auto-Deploy with GitHub

Both projects will auto-deploy when you push to GitHub:
- Push to `master` branch → Automatic deployment
- Pull requests create preview deployments

---

## 🌐 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

---

## ✅ Final Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added to backend
- [ ] Frontend API URL updated to backend URL
- [ ] CORS updated with frontend URL
- [ ] Test forgot password (email sending)
- [ ] Test all features end-to-end

---

## 📞 Need Help?

If deployment fails, check:
1. Vercel deployment logs
2. Browser console for errors
3. Network tab for API calls
4. Verify all environment variables are set
