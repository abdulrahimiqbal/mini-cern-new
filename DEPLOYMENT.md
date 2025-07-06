# Deployment Guide

## Overview

This Physics Research Laboratory application is configured for automatic deployment to Vercel via GitHub Actions. Every push to the main branch triggers a build and deployment process.

## Prerequisites

1. **GitHub Repository**: Code must be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: PostgreSQL database (recommended: Neon, Supabase, or PlanetScale)

## Quick Setup

### 1. Fork/Clone Repository

```bash
git clone <your-repo-url>
cd physics-research-laboratory
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to `production` for deployment

### 3. Database Setup

Choose your database provider and get the connection string:

#### Option A: Neon Database (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to your `.env` file

#### Option B: Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add to your `.env` file

#### Option C: PlanetScale
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Create a branch (main)
4. Get connection string
5. Add to your `.env` file

### 4. Vercel Setup

#### Step 1: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your repository
4. Configure environment variables

#### Step 2: Environment Variables in Vercel
Add these in your Vercel project settings:
- `DATABASE_URL`: Your database connection string
- `NODE_ENV`: `production`

#### Step 3: Get Vercel Credentials for GitHub Actions
1. Go to Vercel Dashboard > Settings > Tokens
2. Create a new token
3. Copy the token for GitHub secrets

### 5. GitHub Actions Setup

#### Step 1: Add Repository Secrets
Go to your GitHub repository > Settings > Secrets and variables > Actions

Add these secrets:
- `VERCEL_TOKEN`: Your Vercel token
- `ORG_ID`: Your Vercel organization ID
- `PROJECT_ID`: Your Vercel project ID

#### Step 2: Get Vercel IDs
Run these commands in your project directory:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Get your org and project IDs
vercel env ls
```

The `.vercel/project.json` file will contain your `orgId` and `projectId`.

## Deployment Process

### Automatic Deployment

1. **Push to Main**: Every push to the `main` branch triggers deployment
2. **Pull Request**: PRs trigger build tests but don't deploy
3. **Build Process**: 
   - Install dependencies
   - Run TypeScript checks
   - Build frontend and backend
   - Deploy to Vercel

### Manual Deployment

You can also deploy manually:

```bash
# Build locally
npm run build

# Deploy with Vercel CLI
vercel --prod
```

## Build Process

The build process includes:

1. **TypeScript Compilation**: Ensures no type errors
2. **Frontend Build**: Vite builds React app to `dist/public`
3. **Backend Build**: esbuild bundles server to `dist/index.js`
4. **Optimization**: Production optimizations applied

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string

### Optional
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 5000)
- `SESSION_SECRET`: Session encryption key

## Troubleshooting

### Common Issues

#### Build Failures
- Check TypeScript errors: `npm run check`
- Verify all dependencies: `npm install`
- Check environment variables are set

#### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Vercel
- Check database provider firewall settings

#### Deployment Failures
- Check Vercel function logs
- Verify GitHub secrets are set correctly
- Ensure `vercel.json` configuration is valid

### Debug Commands

```bash
# Check TypeScript
npm run check

# Test build locally
npm run build

# Test production build
npm run preview

# Clean build artifacts
npm run clean
```

## Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function performance
- Check error rates

### GitHub Actions
- View build logs in Actions tab
- Monitor deployment status
- Check for failed builds

## Database Considerations

Since you mentioned not setting up a database yet, here are recommendations:

### For Development
- Use SQLite with better-sqlite3
- Or use a local PostgreSQL instance

### For Production
- **Neon**: Serverless PostgreSQL, great for Vercel
- **Supabase**: Full-featured PostgreSQL with additional services
- **PlanetScale**: MySQL-compatible, excellent scaling
- **Railway**: Simple PostgreSQL hosting

### Migration Strategy
When you're ready to add a database:

1. Choose your provider
2. Update `DATABASE_URL` in environment variables
3. Run database migrations: `npm run db:push`
4. Redeploy the application

## Security Notes

- Never commit `.env` files
- Use strong passwords for database
- Rotate Vercel tokens regularly
- Enable 2FA on all accounts

## Performance Tips

- Database queries are optimized with Drizzle ORM
- Static assets are served via Vercel CDN
- WebSocket connections handled efficiently
- TypeScript ensures runtime safety

## Support

For deployment issues:
1. Check the troubleshooting section above
2. Review Vercel and GitHub Actions logs
3. Verify all environment variables
4. Test build process locally first 