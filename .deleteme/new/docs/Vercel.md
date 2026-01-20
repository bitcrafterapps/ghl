# Vercel Deployment Guide

This guide covers the deployment process for both the frontend and backend applications on Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A [GitHub account](https://github.com/signup) with your repository pushed
- [Vercel CLI](https://vercel.com/download) installed (optional but recommended)
- A PostgreSQL database (e.g., Vercel Postgres, Supabase, or any other provider)

## Frontend Deployment

### 1. Connect Your Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the repository you want to deploy

### 2. Configure Project Settings

1. Set the following configuration:
   - Framework Preset: `Next.js`
   - Root Directory: `apps/frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

2. Add environment variables:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   ```

### 3. Deploy Frontend

1. Click "Deploy"
2. Wait for the build to complete
3. Your frontend will be available at: `https://your-project.vercel.app`

## Backend Deployment

### 1. Create a New Project

1. In Vercel Dashboard, click "Add New" → "Project"
2. Import the same repository
3. This time, select the backend configuration

### 2. Configure Project Settings

1. Set the following configuration:
   - Framework Preset: `Other`
   - Root Directory: `apps/backend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. Add environment variables:
   ```env
   PORT=8080
   POSTGRES_USER=your_db_user
   POSTGRES_HOST=your_db_host
   POSTGRES_PASSWORD=your_db_password
   POSTGRES_DATABASE=your_db_name
   JWT_SECRET=your_secure_jwt_secret
   JWT_EXPIRES_IN=24h
   NODE_ENV=production
   ```

### 3. Set Up Database

#### Using Vercel Postgres

1. Go to "Storage" in Vercel Dashboard
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. Vercel will automatically add the required environment variables

OR

#### Using External PostgreSQL Database

1. Set up a PostgreSQL database with your preferred provider
2. Add the database connection details to your environment variables
3. Ensure the database is accessible from Vercel's servers

### 4. Configure vercel.json

Create a `vercel.json` file in the backend root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 5. Deploy Backend

1. Click "Deploy"
2. Wait for the build to complete
3. Your backend API will be available at: `https://your-api-project.vercel.app`

## Post-Deployment Steps

### 1. Update Frontend Configuration

1. Go to your frontend project settings
2. Update `NEXT_PUBLIC_API_URL` to point to your deployed backend URL
3. Redeploy the frontend if necessary

### 2. Initialize Database

1. Connect to your database using the Vercel CLI or dashboard
2. Run migrations:
   ```bash
   vercel env pull .env.production.local
   npm run db:migrate
   ```
3. Seed the database:
   ```bash
   npm run db:seed
   ```

### 3. Verify Deployment

1. Test the frontend application
2. Verify API endpoints are working
3. Check database connections
4. Test user authentication

## Custom Domains (Optional)

### Frontend Domain

1. Go to frontend project settings
2. Click "Domains"
3. Add your domain
4. Configure DNS settings

### Backend Domain

1. Go to backend project settings
2. Click "Domains"
3. Add your API domain
4. Configure DNS settings
5. Update frontend's `NEXT_PUBLIC_API_URL`

## Monitoring and Logs

### Frontend Monitoring

1. Access frontend analytics in Vercel Dashboard
2. Monitor build logs
3. Check runtime logs
4. Set up error tracking

### Backend Monitoring

1. Access backend analytics
2. Monitor API performance
3. Check database metrics
4. Set up logging service

## Troubleshooting

### Common Frontend Issues

1. Build Failures
   - Check build logs
   - Verify dependencies
   - Check environment variables

2. Runtime Errors
   - Check browser console
   - Verify API connections
   - Check authentication flow

### Common Backend Issues

1. Database Connection
   - Verify connection strings
   - Check network access
   - Verify SSL requirements

2. API Errors
   - Check logs in Vercel Dashboard
   - Verify environment variables
   - Check CORS configuration

## Security Considerations

1. Environment Variables
   - Use strong JWT secret
   - Rotate database credentials
   - Secure API keys

2. Database Security
   - Enable SSL connections
   - Set up proper firewall rules
   - Regular backups

3. API Security
   - Enable CORS properly
   - Rate limiting
   - Request validation

## Maintenance

### Regular Tasks

1. Monitor application performance
2. Check error logs
3. Update dependencies
4. Backup database
5. Rotate credentials

### Updates and Rollbacks

1. Use Vercel's Git integration for updates
2. Test changes in preview deployments
3. Use rollback feature if needed
4. Monitor after deployments

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel CLI Documentation](https://vercel.com/docs/cli) 