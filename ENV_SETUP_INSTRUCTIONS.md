# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in the root directory of your project with the following variables:

```env
# Google OAuth Client ID (Required for Google Login)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here

# API Base URL (Optional - defaults to https://www.jyotishvishwakosh.shop)
VITE_API_BASE_URL=https://www.jyotishvishwakosh.shop
```

## How to Get Google Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. **IMPORTANT**: Add authorized JavaScript origins:
   - `http://localhost:3000` (for development - CHECK YOUR VITE PORT!)
   - `https://www.jyotishvishwakosh.shop` (for production)
   
   **Note**: The port must match exactly where your app runs. Check `vite.config.js` to confirm your port.

7. Copy the Client ID and paste it in `.env` file

## Fixing "origin_mismatch" Error

If you see **Error 400: origin_mismatch**, it means your local URL is not registered:

1. Go back to Google Cloud Console → Credentials
2. Click on your OAuth 2.0 Client ID
3. Under "Authorized JavaScript origins", make sure you have:
   - `http://localhost:3000` (or whatever port your dev server uses)
4. Click **Save**
5. Wait 1-2 minutes for changes to propagate
6. Clear browser cache or use incognito mode
7. Restart your dev server

## Important Notes

- **VITE_GOOGLE_CLIENT_ID** is REQUIRED - without it, Google login will not work
- The `VITE_` prefix is mandatory in Vite projects for client-side environment variables
- Never commit `.env` file to version control (it's already in .gitignore)
- Restart the development server after adding/changing .env variables

## File Location

The `.env` file should be in the root directory:
```
jyoishvishwakosh_web/
├── .env          ← Create this file here
├── src/
├── package.json
└── ...
```

