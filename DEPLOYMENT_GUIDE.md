# 🚀 Backend Deployment Guide

**Complete Guide to Deploy Travel Operations Platform API**

---

## 📋 Pre-Deployment Checklist

### ✅ What's Ready:
- [x] Backend API with 42 endpoints
- [x] JWT Authentication
- [x] Rate limiting (10 req/min)
- [x] CORS configuration
- [x] Health check endpoint
- [x] Swagger documentation
- [x] Database schema ready

### ⚙️ What You Need:
- [ ] Production Supabase database
- [ ] Deployment platform account (Railway/Render)
- [ ] Production environment variables

---

## 🎯 Deployment Options

### **Option 1: Railway** (Recommended ⭐)
- **Pros:** Easiest, auto-deploy from Git, affordable
- **Cost:** ~$5-10/month
- **Time:** 30 minutes
- **Best for:** Quick production deployment

### **Option 2: Render**
- **Pros:** Free tier available, similar to Railway
- **Cost:** Free or $7/month
- **Time:** 30 minutes
- **Best for:** Testing/staging

### **Option 3: AWS/DigitalOcean**
- **Pros:** Full control, scalable
- **Cost:** ~$10-20/month
- **Time:** 2-3 hours
- **Best for:** Enterprise production

---

## 🔐 Step 1: Prepare Production Database

### **Create Production Supabase Project:**

1. Go to https://supabase.com
2. Click "New Project"
3. Fill details:
   - **Name:** travel-ops-production
   - **Database Password:** (Strong password)
   - **Region:** Choose closest to your users

4. Wait for project creation (~2 minutes)

5. Get credentials:
   - Go to **Settings → Database**
   - Copy **Connection String (URI)**
   - Go to **Settings → API**
   - Copy **URL** and **anon public key**

6. Run all migrations:
   - Go to **SQL Editor**
   - Run these in order:
     - `001_create_drivers_table.sql`
     - `002_create_vehicles_tables.sql`
     - `003_create_bookings_table.sql`
     - `004_create_customers_table.sql`
     - `005_create_trips_tables.sql`
     - `006_create_users_table.sql`

7. Verify tables:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see: drivers, vehicles, vehicle_categories, driver_vehicle_mapping, bookings, customers, trips, trip_locations, users

---

## 🌐 Step 2: Deploy to Railway

### **2.1 Create Railway Account:**

1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

### **2.2 Create New Project:**

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `travel-ops-backend`
4. Railway will auto-detect Node.js

### **2.3 Configure Environment Variables:**

Click on your service → **Variables** tab → Add all these:

```env
# Database Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (will add later when frontend is deployed)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

**Important:** Generate a strong JWT_SECRET:
```bash
# Run this locally to generate:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **2.4 Configure Build Settings:**

Railway auto-detects, but verify:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm run start:prod
```

### **2.5 Deploy:**

1. Click "Deploy"
2. Railway will:
   - Install dependencies
   - Build TypeScript
   - Start the server

3. Wait ~2-3 minutes

4. Get your URL:
   - Click **Settings** → **Generate Domain**
   - You'll get: `https://travel-ops-backend-production.up.railway.app`

### **2.6 Test Deployment:**

```bash
# Health check
curl https://your-app.up.railway.app/health

# API docs
https://your-app.up.railway.app/api/docs

# Test login
curl -X POST https://your-app.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@travelops.com","password":"password123"}'
```

---

## 🎨 Step 3: Deploy to Render (Alternative)

### **3.1 Create Render Account:**

1. Go to https://render.com
2. Sign up with GitHub

### **3.2 Create Web Service:**

1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name:** travel-ops-backend
   - **Environment:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:prod`
   - **Plan:** Free or Starter ($7/month)

### **3.3 Add Environment Variables:**

Same as Railway (see above)

### **3.4 Deploy:**

1. Click "Create Web Service"
2. Wait for deployment (~3-5 minutes)
3. Get URL: `https://travel-ops-backend.onrender.com`

---

## ⚙️ Step 4: Configure Production

### **4.1 Update CORS:**

Your `.env` in production should have:
```env
FRONTEND_URL=https://your-frontend-domain.com
```

This allows your frontend to make API calls.

### **4.2 Test All Endpoints:**

Use Swagger docs:
```
https://your-app.up.railway.app/api/docs
```

Test these critical endpoints:
1. Health check: `/health`
2. Login: `/api/v1/auth/login`
3. Get drivers: `/api/v1/drivers`
4. Get bookings: `/api/v1/bookings`

### **4.3 Monitor Logs:**

**Railway:**
- Click on service → **Deployments** → Click latest → **View Logs**

**Render:**
- Click on service → **Logs** tab

### **4.4 Set Up Custom Domain (Optional):**

**Railway:**
1. Go to **Settings** → **Domains**
2. Add custom domain
3. Update DNS records (A record or CNAME)

**Render:**
1. Go to **Settings** → **Custom Domain**
2. Add domain
3. Update DNS

---

## 🔒 Security Best Practices

### **1. Change Default Passwords:**

```bash
# Login to your production API
curl -X POST https://your-api.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@travelops.com","password":"password123"}'

# Use the token to change password
curl -X PUT https://your-api.com/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"old_password":"password123","new_password":"YourSecurePass@2025"}'
```

### **2. Environment Variables:**

Never commit:
- JWT_SECRET
- Database credentials
- API keys

### **3. Enable HTTPS:**

Both Railway and Render provide free SSL certificates automatically.

### **4. Rate Limiting:**

Already configured: 10 requests per minute per IP.

To adjust, edit `src/app.module.ts`:
```typescript
ThrottlerModule.forRoot([{
  ttl: 60000, // milliseconds
  limit: 10,  // requests
}]),
```

---

## 📊 Monitoring & Maintenance

### **Health Monitoring:**

Set up a monitoring service (optional):
- **UptimeRobot:** https://uptimerobot.com (Free)
- **Pingdom:** https://pingdom.com

Monitor: `https://your-api.com/health`

### **Database Backups:**

Supabase auto-backs up daily. For manual backup:
1. Go to Supabase Dashboard
2. **Database** → **Backups**
3. Create manual backup

### **View Logs:**

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# View logs
railway logs
```

**Render:**
- View in dashboard under **Logs** tab

---

## 🚨 Troubleshooting

### **Issue 1: Server Won't Start**

**Check:**
1. Environment variables set correctly
2. Database connection string valid
3. Port is 3000 (not 3001)

**Fix:**
```bash
# Check logs
railway logs

# Verify env vars
railway variables
```

### **Issue 2: Database Connection Failed**

**Check:**
1. SUPABASE_URL correct
2. SUPABASE_ANON_KEY correct
3. Database is running

**Fix:**
```bash
# Test connection locally first
node -e "const { createClient } = require('@supabase/supabase-js'); const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY); supabase.from('users').select('count').then(console.log);"
```

### **Issue 3: CORS Errors**

**Check:**
1. FRONTEND_URL in environment variables
2. Frontend URL matches exactly (no trailing slash)

**Fix:**
Add frontend URL to Railway/Render environment variables:
```env
FRONTEND_URL=https://your-frontend.vercel.app
```

### **Issue 4: 502 Bad Gateway**

**Common causes:**
1. Server crashed (check logs)
2. Build failed (check build logs)
3. Port mismatch

**Fix:**
Ensure `PORT=3000` in environment variables.

---

## 📱 Post-Deployment

### **1. Save Your URLs:**

```
Production API: https://your-app.up.railway.app
API Documentation: https://your-app.up.railway.app/api/docs
Health Check: https://your-app.up.railway.app/health
```

### **2. Test Credentials:**

```
Admin:
- Email: admin@travelops.com
- Password: password123 (CHANGE THIS!)

Test with:
curl -X POST https://your-api.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@travelops.com","password":"password123"}'
```

### **3. Share API with Frontend Team:**

Give them:
- API Base URL
- Swagger documentation link
- Test credentials (temporary)

---

## 🎉 Success Checklist

- [ ] Backend deployed successfully
- [ ] Health check returns 200 OK
- [ ] Swagger docs accessible
- [ ] Login endpoint works
- [ ] All 42 endpoints accessible
- [ ] Database connected
- [ ] CORS configured
- [ ] Default passwords changed
- [ ] SSL/HTTPS working
- [ ] Logs accessible

---

## 📞 Support

**Issues?**
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs

---

## 🚀 Next Steps

After backend is deployed:

1. **Build Frontend** (2-3 weeks)
   - Next.js + TypeScript
   - Connect to your production API
   - Deploy to Vercel

2. **Add Features**
   - Email verification
   - Password reset
   - File upload
   - Reports

3. **Mobile Apps** (Optional)
   - React Native
   - Flutter

---

**Your Backend is Production-Ready!** 🎉

**API URL:** https://your-app.up.railway.app
**Documentation:** https://your-app.up.railway.app/api/docs

**Ready to build the frontend!** 💪
