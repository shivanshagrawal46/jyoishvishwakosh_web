# Troubleshooting "Failed to Fetch" Errors in Production

If you're seeing "Failed to fetch" errors in production, follow these steps:

## 1. Check Browser Console

Open your browser's developer console (F12) and look for:
- The API Configuration log (should show on page load)
- Network errors in the Network tab
- CORS errors

## 2. Verify Environment Variables

Make sure your `.env` file is set up correctly:

```env
# IMPORTANT: Do NOT include /api at the end
VITE_API_BASE_URL=https://www.jyotishvishwakosh.in
VITE_AUTH_API_BASE_URL=https://www.jyotishvishwakosh.shop
```

**Note:** The `/api` suffix is added automatically by the code.

## 3. Rebuild After Changing Environment Variables

**CRITICAL:** After changing `.env` file, you MUST rebuild:

```bash
npm run build
```

Environment variables are embedded at BUILD TIME, not runtime!

## 4. Check API Server CORS Configuration

Your API servers need to allow requests from your production domain. Make sure your API servers have CORS headers like:

```
Access-Control-Allow-Origin: https://your-production-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 5. Verify API URLs

Check the browser console for the "🔧 API Configuration" log. It should show:
- `isDevelopment: false` (in production)
- Correct `API_BASE_URL` and `AUTH_API_BASE_URL`

## 6. Test API Endpoints Directly

Try accessing the API endpoints directly in your browser:
- `https://www.jyotishvishwakosh.in/api/kosh-category/1`
- `https://www.jyotishvishwakosh.shop/api/auth/google`

If these don't work, the issue is with the API server, not the frontend.

## 7. Common Issues

### Issue: Environment variables not working
**Solution:** Make sure:
- `.env` file is in the root directory (same level as `package.json`)
- File is named exactly `.env` (not `.env.production` or `.env.local`)
- Variables start with `VITE_`
- You rebuilt after changing `.env`

### Issue: CORS errors
**Solution:** Configure your API server to allow your production domain

### Issue: Network errors
**Solution:** 
- Check if API server is running
- Check if API server is accessible from the internet
- Check firewall/security settings

### Issue: Wrong API URLs
**Solution:** Check the console log for actual URLs being used and verify they're correct

## 8. Debug Mode

The code now logs API configuration on page load. Check your browser console for:
```
🔧 API Configuration: {
  isDevelopment: false,
  API_BASE_URL: "...",
  AUTH_API_BASE_URL: "...",
  ...
}
```

This will help you verify the URLs are correct.

