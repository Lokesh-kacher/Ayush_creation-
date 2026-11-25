# Ayush Creation — Custom Backend & Admin System

A clean, production-ready Node.js + Express + MongoDB backend for **Ayush Creation** (B2B Garment Manufacturer, Mumbai / Navi Mumbai).

## 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB Atlas** account (free M0 cluster)
- **Cloudinary** account (free tier for product & gallery images)

## 2. MongoDB Atlas Setup (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0** cluster.
2. Under **Database Access**, create a database user with a username and password.
3. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Click **Connect** → **Drivers** → Copy your connection string (`mongodb+srv://...`).

## 3. Cloudinary Setup (Free)
1. Go to [Cloudinary](https://cloudinary.com/) and sign up.
2. From the Dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.

## 4. Local Setup
1. Navigate to the backend folder:
   ```bash
   cd ayush-creation/backend
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and Cloudinary credentials.
3. Create your first Admin account securely via CLI:
   ```bash
   npm run create-admin
   ```
4. Start the server:
   ```bash
   npm start
   ```
   - API Health Check: `http://localhost:5000/api/v1/health`
   - Admin Panel: `http://localhost:5000/admin/login.html`

## 5. Deploying Backend to Render
1. Push your code to GitHub.
2. On [Render](https://render.com/), click **New +** → **Web Service** and connect your GitHub repository.
3. Configure:
   - **Root Directory:** `ayush-creation/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add your `.env` variables in Render's **Environment** tab (including `FRONTEND_URL=https://ayush-creation.vercel.app`).
5. Deploy! Render will give you a live URL like `https://ayush-creation-api.onrender.com`.

## 6. Connecting Vercel Frontend to Render Backend
In `ayush-creation/public/js/api-config.js`, update the production API URL to your Render URL:
```javascript
const PRODUCTION_API_URL = 'https://your-render-app.onrender.com/api/v1';
```
Then push to GitHub so Vercel automatically redeploys your frontend.
