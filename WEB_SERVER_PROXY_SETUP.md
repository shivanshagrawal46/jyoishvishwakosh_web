# Web Server Proxy Setup (No CORS Required)

Since your backend API doesn't have CORS configured, we'll use a web server proxy. The frontend will use relative URLs (`/api`), and your web server will proxy these requests to the actual API server.

## How It Works

1. Browser makes request to: `https://www.jyotishvishwakosh.com/api/...`
2. Web server intercepts `/api` requests
3. Web server proxies to: `https://www.jyotishvishwakosh.in/api/...`
4. Browser sees same-origin request → **No CORS needed!**

## Nginx Configuration

Add this to your **frontend server** (`www.jyotishvishwakosh.com`) nginx configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name www.jyotishvishwakosh.com jyotishvishwakosh.com;
    
    # SSL configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    # Root directory for frontend files
    root /var/www/jyotishvishwakosh_web/dist;
    index index.html;
    
    # Serve frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 1. Proxy Main API requests to .in domain
    # Routes: /api/* → https://www.jyotishvishwakosh.in/api/*
    location /api {
        proxy_pass https://www.jyotishvishwakosh.in;
        proxy_set_header Host www.jyotishvishwakosh.in;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
        proxy_redirect off;
    }
    
    # 2. Proxy Auth API requests to .shop domain
    # Routes: /auth-api/* → https://www.jyotishvishwakosh.shop/api/*
    location /auth-api {
        rewrite ^/auth-api/(.*)$ /api/$1 break;
        proxy_pass https://www.jyotishvishwakosh.shop;
        proxy_set_header Host www.jyotishvishwakosh.shop;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
        proxy_redirect off;
    }
    
    # 3. Proxy Panchang API requests to kapi.jyotishvishwakosh.com
    # Routes: /panchang-api/* → https://kapi.jyotishvishwakosh.com/api/*
    location /panchang-api {
        rewrite ^/panchang-api/(.*)$ /api/$1 break;
        proxy_pass https://kapi.jyotishvishwakosh.com;
        proxy_set_header Host kapi.jyotishvishwakosh.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
        proxy_redirect off;
    }
}
```

### API Routing Summary:

| Frontend Path | Proxied To | Purpose |
|--------------|------------|---------|
| `/api/*` | `https://www.jyotishvishwakosh.in/api/*` | Main API (Kosh, Pooja, AstroShop, etc.) |
| `/auth-api/*` | `https://www.jyotishvishwakosh.shop/api/*` | Authentication API |
| `/panchang-api/*` | `https://kapi.jyotishvishwakosh.com/api/*` | Panchang & Muhurat API |

## Apache Configuration

Add this to your **frontend server** Apache configuration or `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # 1. Proxy Main API requests to .in domain
    # /api/* → https://www.jyotishvishwakosh.in/api/*
    RewriteCond %{REQUEST_URI} ^/api/(.*)$
    RewriteRule ^api/(.*)$ https://www.jyotishvishwakosh.in/api/$1 [P,L]
    
    # 2. Proxy Auth API requests to .shop domain
    # /auth-api/* → https://www.jyotishvishwakosh.shop/api/*
    RewriteCond %{REQUEST_URI} ^/auth-api/(.*)$
    RewriteRule ^auth-api/(.*)$ https://www.jyotishvishwakosh.shop/api/$1 [P,L]
    
    # 3. Proxy Panchang API requests to kapi.jyotishvishwakosh.com
    # /panchang-api/* → https://kapi.jyotishvishwakosh.com/api/*
    RewriteCond %{REQUEST_URI} ^/panchang-api/(.*)$
    RewriteRule ^panchang-api/(.*)$ https://kapi.jyotishvishwakosh.com/api/$1 [P,L]
    
    # Serve frontend files (must be last)
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Enable proxy module
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests Off
</IfModule>
```

## Testing

After configuring the proxy:

1. **Test API endpoint:**
   ```bash
   curl https://www.jyotishvishwakosh.com/api/locations/popular
   ```
   Should return data from `jyotishvishwakosh.in`

2. **Test in browser console:**
   ```javascript
   fetch('/api/locations/popular')
     .then(r => r.json())
     .then(console.log)
   ```
   Should work without CORS errors!

3. **Check Network tab:**
   - Requests should go to `www.jyotishvishwakosh.com/api/...`
   - Status should be 200 (not CORS errors)

## Important Notes

- ✅ **No CORS needed** - Browser sees same-origin requests
- ✅ **No backend changes** - API server stays as-is
- ✅ **Works immediately** - Just configure web server
- ⚠️ **Must configure web server** - This won't work without proxy setup

## Troubleshooting

### Proxy not working?
1. Check nginx/apache error logs
2. Verify proxy modules are enabled
3. Test direct API access: `curl https://www.jyotishvishwakosh.in/api/locations/popular`
4. Check firewall allows connections between servers

### Still getting CORS errors?
- Make sure proxy is configured correctly
- Check browser Network tab - requests should go to `.com` domain, not `.in`
- Clear browser cache and hard refresh (Ctrl+Shift+R)

### 502 Bad Gateway?
- API server might be down
- Check proxy_pass URL is correct
- Verify SSL certificates if using HTTPS

