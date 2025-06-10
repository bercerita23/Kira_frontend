# Kira Frontend - AWS Amplify Deployment Guide

This guide covers deploying the Kira frontend application to AWS Amplify.

## Prerequisites

- AWS Account with Amplify access
- GitHub repository containing your frontend code
- Backend API already deployed and accessible at `https://kira-api.com`

## Project Configuration

The frontend has been configured for Amplify deployment with the following optimizations:

### Files Added/Modified:
- ✅ `amplify.yml` - Build specification for AWS Amplify
- ✅ `next.config.js` - Next.js configuration optimized for Amplify
- ✅ `.gitignore` - Updated with proper ignore patterns
- ✅ `DEPLOYMENT.md` - This deployment guide
- ✅ `.env.example` - Environment variables documentation
- ✅ API routes updated to use environment variables (defaults to `https://kira-api.com`)

## Deployment Steps

### 1. Environment Configuration (Optional)

The application is pre-configured to use `https://kira-api.com` as the backend API. If you need to use a different API URL for different environments, you can set:

#### Optional Environment Variables:
- `NEXT_PUBLIC_API_URL`: Override the default backend API URL

**For most deployments, you don't need to set any environment variables** as the app will use `https://kira-api.com` by default.

### 2. AWS Amplify Console Setup

1. **Connect Repository**:
   - Go to AWS Amplify Console
   - Click "New app" → "Host web app"
   - Connect your GitHub repository
   - Select the branch you want to deploy (typically `main` or `master`)

2. **Build Settings**:
   - Amplify will automatically detect the `amplify.yml` file
   - Review the build settings (should be automatically configured)
   - The build specification includes:
     - `npm ci` for dependency installation
     - `npm run build` for building the Next.js app
     - Proper caching for node_modules and .next/cache

3. **Environment Variables (Optional)**:
   - **Skip this step if using the default `https://kira-api.com` backend**
   - If you need a different API URL, go to "App settings" → "Environment variables"
   - Add:
     ```
     NEXT_PUBLIC_API_URL = https://your-custom-backend-url.com
     ```

4. **Deploy**:
   - Click "Save and deploy"
   - Amplify will automatically build and deploy your application

### 3. Domain Configuration (Optional)

If you want to use a custom domain:

1. Go to "App settings" → "Domain management"
2. Add your custom domain
3. Follow the DNS configuration instructions provided by Amplify

## Build Configuration Details

### amplify.yml
The `amplify.yml` file in the root directory contains the build specification:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Next.js Configuration
The `next.config.js` file is configured for Amplify deployment with:
- Image optimization disabled (`unoptimized: true`)
- Trailing slashes enabled for better static hosting
- ESLint errors ignored during builds
- TypeScript build errors enabled for quality control

## API Integration

The frontend is configured with flexible API URL handling:

- **Default**: Uses `https://kira-api.com` (your backend)
- **Override**: Set `NEXT_PUBLIC_API_URL` environment variable for different environments
- **Local Development**: Can override for local testing (e.g., `http://localhost:8000`)

All API routes (`/app/api/*`) act as proxies to your backend API, allowing for:
- CORS handling
- Request/response transformation
- Error handling

## Post-Deployment

After successful deployment:

1. **Test the Application**: Visit your Amplify app URL and test all functionality
2. **Monitor Builds**: Check the build logs for any issues
3. **Set up Notifications**: Configure build notifications in Amplify Console

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check environment variables are set correctly (if using custom API URL)
   - Review build logs in Amplify Console
   - Ensure all dependencies are in `package.json`

2. **API Connection Issues**:
   - Verify your `https://kira-api.com` backend is accessible
   - If using custom API URL, verify `NEXT_PUBLIC_API_URL` is set correctly
   - Review CORS configuration on your backend

3. **Static Asset Issues**:
   - Ensure images are in the `public/` directory
   - Check that `unoptimized: true` is set in `next.config.js`

## Automatic Deployments

Once set up, Amplify will automatically:
- Deploy on every push to your connected branch
- Run builds and tests
- Update the live application

## Environment-Specific Deployments

You can set up multiple environments:
- **Development**: Connected to `dev` branch (can use different API URL)
- **Staging**: Connected to `staging` branch (can use staging API URL)
- **Production**: Connected to `main` branch (uses `https://kira-api.com`)

Each environment can have its own API URL configuration if needed.

## Build Verification

The project has been tested and builds successfully with:
```bash
npm run build
```

The build produces optimized static files ready for deployment with `https://kira-api.com` as the default backend. 