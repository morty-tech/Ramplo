# Vercel Deployment Troubleshooting

## Common Issues and Solutions

### 1. Auto-Deploy Not Triggering
- **Check Git Integration**: Ensure your Vercel project is connected to the correct GitHub repository
- **Branch Configuration**: Verify that Vercel is watching the correct branch (usually `main` or `master`)
- **Build Settings**: Make sure the build command is set correctly in Vercel dashboard

### 2. Manual Deployment Options

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to your Vercel dashboard
2. Select your project
3. Click "Deployments" tab
4. Click "Create Deployment" 
5. Select the branch to deploy

### 3. Build Configuration Check

In your Vercel project settings, ensure:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x or 20.x

### 4. Environment Variables Verification

Required environment variables in Vercel:
- DATABASE_URL
- STRIPE_SECRET_KEY
- VITE_STRIPE_PUBLIC_KEY
- STRIPE_PRICE_ID
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- OPENAI_API_KEY

### 5. Repository Setup

Ensure your repository has:
- All source files committed
- `vercel.json` configuration file
- Proper package.json with build scripts
- No sensitive files (use .vercelignore)

### 6. Debug Steps

1. Check Vercel project logs for build errors
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check function logs in Vercel dashboard