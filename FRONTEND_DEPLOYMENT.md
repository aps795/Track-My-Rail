# Frontend Deployment Guide (Vercel)

This guide will help you deploy your Track My Rail frontend to Vercel.

## 1. Update the API URL
Before deploying, make sure your frontend knows where your backend is. 

I have updated [script.js](file:///d:/Track-My-Rail-gh-pages/script.js) with a dynamic URL. **You must edit line 9 in `script.js`** and replace `'https://your-backend-url.onrender.com/api'` with your actual Render URL.

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR-APP-NAME.onrender.com/api'; // <--- Update this!
```

## 2. Deploy to Vercel

### Option A: Using the Vercel Website (Easiest)
1.  Push all your changes to your GitHub repository.
2.  Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
3.  Click **Add New** -> **Project**.
4.  Import your repository.
5.  **Framework Preset**: Select `Other` (or Vercel will auto-detect it as a static site).
6.  **Root Directory**: Leave as `./`.
7.  Click **Deploy**.

### Option B: Using Vercel CLI
1.  Install Vercel CLI: `npm install -g vercel`
2.  Run `vercel` in your project root.
3.  Follow the prompts to link your account and deploy.

## 3. Post-Deployment
Once deployed, Vercel will give you a URL like `https://track-my-rail.vercel.app`. 

### Important: Update CORS on Render
To allow your Vercel frontend to talk to your Render backend, you should update the `CORS` setting in your `server.js` (or Render environment variables if you've added logic for it).

In [server.js](file:///d:/Track-My-Rail-gh-pages/server.js):
```javascript
app.use(cors({
    origin: 'https://your-frontend-url.vercel.app'
}));
```
*Note: For now, the backend allows ALL origins (`app.use(cors())`), so it will work immediately, but it's better to restrict it later for security.*
