# RampLO Vercel Deployment Guide

## Overview

RampLO is now configured for deployment on Vercel with simplified environment variable management. Each Vercel environment (development, preview, production) uses standard environment variables.

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required for All Environments
```
DATABASE_URL=your_database_url
STRIPE_SECRET_KEY=sk_...
VITE_STRIPE_PUBLIC_KEY=pk_...
STRIPE_PRICE_ID=price_...
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=nora@morty.com
OPENAI_API_KEY=sk-...
```

## Deployment Steps

1. **Connect to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   ```

2. **Set Environment Variables**
   ```bash
   # Add all required environment variables
   vercel env add DATABASE_URL
   vercel env add STRIPE_SECRET_KEY
   vercel env add VITE_STRIPE_PUBLIC_KEY
   vercel env add STRIPE_PRICE_ID
   vercel env add SENDGRID_API_KEY
   vercel env add SENDGRID_FROM_EMAIL
   vercel env add OPENAI_API_KEY
   ```

3. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod
   
   # Or deploy preview
   vercel
   ```

## Database Setup

For each environment, create a separate database:
- **Development**: Use your local/development database
- **Preview**: Create a preview database instance
- **Production**: Create a production database instance

Set the appropriate `DATABASE_URL` for each environment in Vercel's environment variable settings.

## File Structure

- `vercel.json` - Vercel configuration
- `build.sh` - Build script (not used, kept for reference)
- Server runs from `server/index.ts`
- Frontend builds to `dist/` directory

## Environment Detection

The app automatically detects the environment using `NODE_ENV`:
- Development: `NODE_ENV=development`
- Production: `NODE_ENV=production`

No more complex environment variable switching logic needed.