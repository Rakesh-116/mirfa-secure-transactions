# 🌐 Deployment Guide - Vercel

This guide covers deploying both the API and Web apps to Vercel.

## Prerequisites

1. [Vercel account](https://vercel.com) (free tier works)
2. [Vercel CLI](https://vercel.com/download) installed: `pnpm add -g vercel`
3. PostgreSQL database (use one of these):
    - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (easiest)
    - [Neon](https://neon.tech) (generous free tier)
    - [Supabase](https://supabase.com) (includes free Postgres)

## Step 1: Set Up PostgreSQL

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** → **Create Database** → **Postgres**
3. Copy the connection string (starts with `postgres://`)

### Option B: Neon (Free Tier)

1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard

### Option C: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings** → **Database**
3. Copy **Connection String** (choose **Connection pooling**)

## Step 2: Generate Master Key

Run this locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save this key securely!** You'll need it for deployment.

## Step 3: Deploy API

### From Root Directory

```bash
cd apps/api
vercel
```

Follow prompts:

- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** mirfa-api (or any name)
- **Directory?** ./ (should auto-detect)
- **Override settings?** No

### Set Environment Variables

After deployment, add these in Vercel dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add:

```
DATABASE_URL = postgres://your-connection-string
MASTER_KEY_HEX = your-64-char-hex-key
NODE_ENV = production
CORS_ORIGIN = * (update after deploying frontend)
```

3. **Redeploy** to apply variables:

```bash
vercel --prod
```

Your API is now live at: `https://mirfa-api-xxx.vercel.app`

## Step 4: Deploy Web

### From Root Directory

```bash
cd apps/web
vercel
```

### Set Environment Variables

1. Go to **Project Settings** → **Environment Variables**
2. Add:

```
NEXT_PUBLIC_API_URL = https://mirfa-api-xxx.vercel.app
```

**Important:** Use your actual API URL from Step 3.

3. **Redeploy:**

```bash
vercel --prod
```

Your frontend is now live at: `https://mirfa-web-xxx.vercel.app`

## Step 5: Update CORS

Now that you have the frontend URL, update API CORS:

1. Go to API project in Vercel
2. **Environment Variables** → Edit `CORS_ORIGIN`
3. Change from `*` to `https://mirfa-web-xxx.vercel.app`
4. Redeploy API

## Step 6: Test Production Deployment

Visit your frontend URL and test:

1. Enter `party_123` in Party ID
2. Enter test payload:
    ```json
    {
        "amount": 100,
        "currency": "AED"
    }
    ```
3. Click **Encrypt & Save**
4. Note the returned ID
5. Click **Fetch Encrypted**
6. Click **Decrypt**

All operations should work!

## Alternative: Deploy from GitHub

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mirfa-secure-transactions.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Select your GitHub repo
4. **Root Directory:** `apps/api` (for API) or `apps/web` (for Web)
5. Add environment variables
6. Deploy

Repeat for both API and Web.

## Troubleshooting

### Issue: "Function exceeded memory limit"

**Solution:** Add to `vercel.json`:

```json
{
    "functions": {
        "src/index.ts": {
            "memory": 1024
        }
    }
}
```

### Issue: "Cannot find module '@mirfa/crypto'"

**Solution:** Vercel needs to build packages. Add to API's `package.json`:

```json
{
    "scripts": {
        "vercel-build": "cd ../../packages/crypto && pnpm build && cd ../../packages/db && pnpm build && cd ../../apps/api && pnpm build"
    }
}
```

### Issue: Database connection fails in production

**Solution:** Ensure `DATABASE_URL` includes SSL:

```
postgresql://user:pass@host/db?sslmode=require
```

Or in connection config:

```typescript
ssl: {
    rejectUnauthorized: false;
}
```

### Issue: CORS errors

**Solution:** Update `CORS_ORIGIN` in API environment variables to match frontend URL exactly (no trailing slash).

## Production Checklist

Before submitting:

- [ ] API deployed and accessible
- [ ] Web deployed and accessible
- [ ] Environment variables set correctly
- [ ] Database connection working
- [ ] CORS configured properly
- [ ] Test encrypt/decrypt flow end-to-end
- [ ] Check Vercel logs for errors
- [ ] URLs added to submission form

## Vercel CLI Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Remove project
vercel remove <project-name>
```

## Monitoring

After deployment:

1. **Vercel Dashboard** → Your project
2. Check **Deployments** tab for build logs
3. Check **Functions** tab for serverless metrics
4. Check **Analytics** for usage stats

## Cost Estimate

**Free Tier Limits:**

- Vercel: 100GB bandwidth/month, unlimited deployments
- Vercel Postgres: 256MB storage, 60 hours compute
- Neon: 3GB storage, unlimited projects

**This project stays within free tier limits for the internship evaluation period.**

## Next Steps

After successful deployment:

1. Add URLs to submission form
2. Test all three endpoints from frontend
3. Record Loom video showing live demo
4. Submit!

---

**Note:** Save your deployment URLs! You'll need them for the submission form and Loom video.

Example URLs to save:

- API: `https://mirfa-api-xxx.vercel.app`
- Web: `https://mirfa-web-xxx.vercel.app`
