# CORS Fix Solution

## Problem
Your frontend (`https://www.jyotishvishwakosh.com`) cannot access APIs on `https://www.jyotishvishwakosh.in` due to CORS policy.

## Solution 1: Fix CORS on API Server (RECOMMENDED)

You need to configure your API server (`https://www.jyotishvishwakosh.in`) to allow requests from your frontend domain.

### For Node.js/Express API Server:

Add CORS middleware:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'https://www.jyotishvishwakosh.com',
    'https://jyotishvishwakosh.com',
    'http://localhost:3000' // for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### For PHP API Server:

Add these headers in your PHP files or `.htaccess`:

```php
<?php
header('Access-Control-Allow-Origin: https://www.jyotishvishwakosh.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

Or in `.htaccess`:

```apache
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://www.jyotishvishwakosh.com"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>
```

### For Nginx Server:

Add to your API server's nginx configuration:

```nginx
location /api {
    add_header 'Access-Control-Allow-Origin' 'https://www.jyotishvishwakosh.com' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    # Your existing proxy_pass or fastcgi_pass here
}
```

## Solution 2: Use Web Server Proxy (WORKAROUND)

If you cannot modify the API server immediately, configure your frontend web server to proxy API requests.

### Nginx Configuration for Frontend Server:

Add this to your frontend server's nginx config:

```nginx
server {
    listen 443 ssl;
    server_name www.jyotishvishwakosh.com;
    
    # Your SSL configuration here
    
    # Serve frontend files
    root /path/to/your/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API requests to .in domain
    location /api {
        proxy_pass https://www.jyotishvishwakosh.in;
        proxy_set_header Host www.jyotishvishwakosh.in;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_ssl_verify off;
    }
}
```

Then update your frontend to use relative URLs (already done - it uses `/api` in production).

### Apache Configuration:

Add to your `.htaccess` or Apache config:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Proxy API requests
    RewriteCond %{REQUEST_URI} ^/api/(.*)$
    RewriteRule ^api/(.*)$ https://www.jyotishvishwakosh.in/api/$1 [P,L]
    
    # Serve frontend
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

## Quick Test

After implementing either solution, test in browser console:

```javascript
fetch('https://www.jyotishvishwakosh.in/api/locations/popular')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If it works, CORS is fixed!

## Recommendation

**Use Solution 1** (fix CORS on API server) as it's the proper way. Solution 2 is a temporary workaround.

