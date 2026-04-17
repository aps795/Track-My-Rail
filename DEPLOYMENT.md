# Deployment Guide for Track My Rail Backend

This guide provides instructions on how to deploy the Node.js backend for the Track My Rail web application.

## Prerequisites

1.  **GitHub Account**: Your code should be pushed to a GitHub repository.
2.  **API Keys (Optional but Recommended)**: Obtain API keys from [RapidAPI](https://rapidapi.com/search/indian%20railway) (e.g., Indian Railway API) to fetch real-time data.

## Deployment Options

### 1. Render (Recommended for Simplicity)

Render is an excellent platform for deploying Node.js applications with a free tier.

**Steps:**
1.  Sign up at [render.com](https://render.com/).
2.  Click on **New** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Configure the service:
    *   **Name**: `track-my-rail-backend`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  Add **Environment Variables**:
    *   `PORT`: `5000` (or any port you prefer)
    *   `RAPID_API_KEY`: (Your RapidAPI Key)
    *   `RAPID_API_HOST`: (Your RapidAPI Host)
6.  Click **Create Web Service**.

### 2. Railway

Railway is another great developer-friendly platform.

**Steps:**
1.  Sign up at [railway.app](https://railway.app/).
2.  Click on **New Project** -> **Deploy from GitHub repo**.
3.  Select your repository.
4.  Railway will automatically detect the Node.js environment.
5.  Add Environment Variables in the **Variables** tab.
6.  The service will be deployed automatically.

### 3. Vercel (Serverless)

Vercel is primarily for frontend but supports serverless functions.

**Steps:**
1.  Sign up at [vercel.com](https://vercel.com/).
2.  Click **Add New** -> **Project**.
3.  Import your GitHub repository.
4.  Vercel will detect Node.js.
5.  Add Environment Variables.
6.  Click **Deploy**.
    *   *Note: For Vercel, you might need to adjust the structure or use a `vercel.json` file to route requests to your server.*

## Making it Live

Once deployed, your backend will have a public URL (e.g., `https://track-my-rail-backend.onrender.com`).

**Update Frontend:**
In your frontend JavaScript files (e.g., [train-search.js](file:///d:/Track-My-Rail-gh-pages/pages/train-search.js)), update the API base URL to point to your live backend:

```javascript
const API_BASE_URL = 'https://track-my-rail-backend.onrender.com/api';
```

## Non-User Access

The backend is already designed to be "non-user," meaning no login or signup is required. Anyone with the URL can access the endpoints.

## Security Considerations

*   **CORS**: The backend currently allows all origins (`app.use(cors())`). For production, you should restrict this to your frontend domain:
    ```javascript
    app.use(cors({
        origin: 'https://your-frontend-domain.com'
    }));
    ```
*   **Rate Limiting**: Consider adding rate limiting to prevent abuse.
