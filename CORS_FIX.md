# Fixing "Failed to fetch" Error for Google Login

## The Problem
After selecting a Google account, you're getting "Failed to fetch" error. This is typically a **CORS (Cross-Origin Resource Sharing)** issue.

## Why It Happens
When your frontend (running on `http://localhost:3000`) tries to call the backend API (`https://www.jyotishvishwakosh.shop`), the browser blocks the request unless the backend explicitly allows it.

## Solution: Backend Must Allow CORS

The backend server at `https://www.jyotishvishwakosh.shop` needs to allow requests from `http://localhost:3000`.

### Backend Configuration Needed

Your backend API (`/api/auth/google`) needs to include these CORS headers:

```javascript
// Example Node.js/Express CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',        // Development
    'https://www.jyotishvishwakosh.shop'  // Production
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Or specifically for the `/api/auth/google` endpoint:

```javascript
app.post('/api/auth/google', (req, res) => {
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  // Your login logic here
  // ...
});
```

## Quick Checks

1. **Check if the endpoint exists**: Try accessing `https://www.jyotishvishwakosh.shop/api/auth/google` directly (it should return an error, not "not found")

2. **Check browser console**: Open Developer Tools (F12) → Network tab → Look for the failed request → Check if it shows CORS error

3. **Test with curl/Postman**: 
   ```bash
   curl -X POST https://www.jyotishvishwakosh.shop/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"idToken":"test"}'
   ```

## Temporary Workaround (For Testing Only)

If you need to test immediately and can't modify the backend, you can temporarily disable CORS in Chrome (NOT RECOMMENDED for production):

1. Close all Chrome windows
2. Run: `chrome.exe --user-data-dir="C:/temp/chrome_dev" --disable-web-security`
3. Test your app (THIS IS UNSAFE - only for development!)

## For Production

When you deploy, make sure to:
1. Add your production domain to CORS allowed origins
2. Remove localhost from allowed origins (or keep it for development API)

## Contact Backend Team

Ask your backend developer to:
- ✅ Enable CORS for `http://localhost:3000` 
- ✅ Enable CORS for `https://www.jyotishvishwakosh.shop`
- ✅ Allow `POST` method with `Content-Type: application/json` header
- ✅ Allow credentials if needed

