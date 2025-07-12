# Deploy to Render

## Prerequisites
1. GitHub account with your code pushed
2. Render account (free at render.com)
3. API keys for external services (Stripe, Gemini)

## Step-by-Step Deployment

### 1. Prepare Your Repository
- Make sure your code is pushed to GitHub
- Ensure `package.json` has the correct start script: `"start": "node src/server.js"`

### 2. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with your GitHub account

### 3. Deploy Using Blueprint (Recommended)
1. Click "New +" → "Blueprint"
2. Connect your GitHub repository
3. Render will automatically detect the `render.yaml` file
4. Click "Apply" to deploy

### 4. Manual Deployment (Alternative)
If you prefer manual setup:

#### Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `google-gemini-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `google-gemini-db`
   - **Database**: `google_gemini`
   - **User**: `google_gemini_user`
   - **Plan**: Free

#### Create Redis Instance
1. Click "New +" → "Redis"
2. Configure:
   - **Name**: `google-gemini-redis`
   - **Plan**: Free

### 5. Set Environment Variables
In your web service, add these environment variables:

#### Required Variables
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render sets this automatically)
- `DATABASE_URL`: Copy from your PostgreSQL service
- `REDIS_URL`: Copy from your Redis service
- `JWT_SECRET`: Generate a secure random string
- `DB_SSL`: `true`

#### External API Keys
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `GEMINI_API_KEY`: Your Google Gemini API key

#### Optional Variables
- `RATE_LIMIT_WINDOW_MS`: `900000`
- `RATE_LIMIT_MAX_REQUESTS`: `100`

### 6. Deploy
1. Click "Create Web Service"
2. Render will build and deploy your app
3. Wait for deployment to complete (usually 2-5 minutes)

### 7. Access Your App
- Your app will be available at: `https://your-app-name.onrender.com`
- The URL will be shown in your service dashboard

## Troubleshooting

### Common Issues
1. **Build fails**: Check that all dependencies are in `package.json`
2. **Database connection fails**: Verify `DATABASE_URL` is correct
3. **Redis connection fails**: Verify `REDIS_URL` is correct
4. **App crashes**: Check logs in Render dashboard

### Viewing Logs
1. Go to your web service dashboard
2. Click "Logs" tab
3. Check for any error messages

### Environment Variables
- Make sure all required environment variables are set
- Double-check API keys are correct
- Ensure database and Redis URLs are properly formatted

## Free Tier Limitations
- **Web Services**: Sleep after 15 minutes of inactivity
- **Databases**: 1GB storage, 90 days retention
- **Redis**: 256MB storage

## Scaling Up
When ready to scale:
1. Upgrade to paid plans
2. Enable auto-scaling
3. Add custom domains
4. Set up monitoring

## Support
- Render Documentation: [docs.render.com](https://docs.render.com)
- Community: [community.render.com](https://community.render.com) 

services:
  - type: web
    name: google-gemini-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DATABASE_URL
        fromDatabase:
          name: google-gemini-db
          property: connectionString
      - key: REDIS_URL
        fromService:
          type: redis
          name: google-gemini-redis
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_PUBLISHABLE_KEY
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: DB_SSL
        value: true
      - key: RATE_LIMIT_WINDOW_MS
        value: 900000
      - key: RATE_LIMIT_MAX_REQUESTS
        value: 100

  - type: redis
    name: google-gemini-redis
    plan: free
    maxmemoryPolicy: allkeys-lru

databases:
  - name: google-gemini-db
    databaseName: google_gemini
    user: google_gemini_user
    plan: free 