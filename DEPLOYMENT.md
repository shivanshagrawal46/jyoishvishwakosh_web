# Deployment Guide

This project is now configured for production deployment with proper API handling.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Main API Base URL (for most endpoints)
# IMPORTANT: Do NOT include /api at the end - it will be added automatically
VITE_API_BASE_URL=https://www.jyotishvishwakosh.in

# Auth API Base URL (for authentication endpoints)
# IMPORTANT: Do NOT include /api at the end - it will be added automatically
VITE_AUTH_API_BASE_URL=https://www.jyotishvishwakosh.shop

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Important Notes:**
- The `.env` file is already in `.gitignore` and will not be committed to the repository
- **DO NOT** include `/api` at the end of URLs - the code adds it automatically
- Environment variables are embedded at **BUILD TIME**, so you must rebuild after changing `.env`
- Make sure your API servers have proper CORS configuration for your production domain

## API Configuration

The application automatically detects the environment:

- **Development (localhost)**: Uses proxy configured in `vite.config.js` to avoid CORS issues
- **Production**: Uses direct API URLs from environment variables or defaults

### API Endpoints

- **Main API**: `https://www.jyotishvishwakosh.in/api`
- **Auth API**: `https://www.jyotishvishwakosh.shop/api`
- **Panchang API**: `https://kapi.jyotishvishwakosh.com/api` (hardcoded, always direct)

## Building for Production

```bash
npm run build
```

This will create a `dist` folder with optimized production files.

## Deployment Steps

1. **Set Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your production API URLs (WITHOUT `/api` suffix) and Google Client ID
   - **DO NOT** include `/api` at the end - the code adds it automatically

2. **Build the Project**
   ```bash
   npm run build
   ```
   **CRITICAL:** Always rebuild after changing `.env` file!

3. **Verify Build**
   - Check the `dist` folder was created
   - Optionally test locally: `npm run preview`

4. **Deploy the `dist` folder**
   - Upload the contents of the `dist` folder to your web server
   - Ensure your server is configured to serve static files
   - Set up proper HTTPS/SSL certificate

5. **Server Configuration**
   - **CORS is critical!** Ensure your API servers allow requests from your production domain
   - The frontend will make direct API calls in production (no proxy)
   - Add CORS headers on your API servers:
     ```
     Access-Control-Allow-Origin: https://your-production-domain.com
     Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
     Access-Control-Allow-Headers: Content-Type, Authorization
     ```

6. **Verify Deployment**
   - Open browser console (F12) and check for "🔧 API Configuration" log
   - Verify `isDevelopment: false` and correct API URLs
   - Test API calls and check Network tab for any errors

## Important Notes

- The proxy configuration in `vite.config.js` is **only for development**
- In production, all API calls use direct URLs
- Make sure your API servers have proper CORS headers configured for your production domain
- The application will automatically detect the environment and use the appropriate API URLs

## Security Features

- Right-click disabled
- Developer tools shortcuts disabled
- Text cursor hidden (except in input fields)
- Environment variables are not exposed in the client bundle (only VITE_* variables are)

## Testing Production Build Locally

To test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the production build on a local server so you can verify everything works before deploying.

