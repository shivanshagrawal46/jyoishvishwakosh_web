# Fixing Google OAuth "origin_mismatch" Error

## The Problem
You're seeing **Error 400: origin_mismatch** because the URL where your app is running is not registered as an authorized JavaScript origin in Google Cloud Console.

## The Solution

You need to add your local development URL to the Google Cloud Console:

### Step 1: Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Edit Your OAuth 2.0 Client ID
1. Find your OAuth 2.0 Client ID (the one you're using in `.env` file)
2. Click on it to edit

### Step 3: Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add:
```
http://localhost:3000
```

If your app runs on a different port, add that port instead (e.g., `http://localhost:5173` for default Vite).

### Step 4: Add Authorized Redirect URIs (if needed)
If you're using redirects, also add to **Authorized redirect URIs**:
```
http://localhost:3000
```

### Step 5: Save and Wait
- Click **Save**
- **Important**: Wait 1-2 minutes for changes to propagate
- Clear your browser cache or try in an incognito window

## For Production

When you deploy to production, you'll also need to add:
```
https://www.jyotishvishwakosh.shop
```

## Quick Checklist

✅ OAuth 2.0 Client ID created  
✅ JavaScript origin added: `http://localhost:3000` (or your dev port)  
✅ Redirect URI added (if using redirects)  
✅ Changes saved  
✅ Waited 1-2 minutes  
✅ Browser cache cleared or incognito window used  

## Still Not Working?

1. Check that your `.env` file has the correct `VITE_GOOGLE_CLIENT_ID`
2. Restart your dev server after adding the origin
3. Try in an incognito/private browser window
4. Check browser console for any other errors

