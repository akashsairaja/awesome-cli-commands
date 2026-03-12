---
id: nginx-ssl-configuration
stackId: nginx
type: skill
name: Configure SSL/TLS with Let's Encrypt on Nginx
description: >-
  Set up production-grade SSL/TLS on Nginx with Let's Encrypt — certificate
  automation, HTTPS redirect, HSTS, OCSP stapling, and A+ SSL Labs rating.
difficulty: intermediate
tags:
  - ssl
  - tls
  - letsencrypt
  - https
  - certificates
  - hsts
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Nginx installed
  - Domain pointing to server
  - Root/sudo access
faq:
  - question: How do I get an A+ SSL rating on Nginx?
    answer: >-
      Enable TLS 1.2/1.3 only, use strong cipher suites (ECDHE), enable HSTS
      with includeSubDomains and preload, configure OCSP stapling, generate DH
      parameters, disable ssl_session_tickets, and set ssl_prefer_server_ciphers
      off for TLS 1.3. Test with SSL Labs to verify.
  - question: How does Let's Encrypt certificate renewal work with Nginx?
    answer: >-
      Certbot installs a systemd timer that checks for renewal twice daily.
      Certificates are renewed 30 days before expiry. After renewal, Certbot
      automatically reloads Nginx. Verify with 'sudo certbot renew --dry-run'.
      Monitor for renewal failures with alerting.
relatedItems:
  - nginx-security-hardening
  - nginx-reverse-proxy-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Configure SSL/TLS with Let's Encrypt on Nginx

## Overview
Modern HTTPS configuration requires TLS 1.2+, strong cipher suites, HSTS, and OCSP stapling. Let's Encrypt provides free, automated certificates. Proper configuration earns an A+ rating on SSL Labs.

## Why This Matters
- **Security** — encrypts all traffic between client and server
- **SEO** — Google ranks HTTPS sites higher
- **Trust** — browser padlock builds user confidence
- **Compliance** — required for PCI DSS, HIPAA, SOC2

## How It Works

### Step 1: Install Certbot
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d example.com -d www.example.com
```

### Step 2: Nginx SSL Configuration
```nginx
# /etc/nginx/conf.d/ssl-params.conf
# Shared SSL parameters for all sites

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# SSL session caching
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;

# DH parameters (generate with: openssl dhparam -out /etc/nginx/dhparam.pem 2048)
ssl_dhparam /etc/nginx/dhparam.pem;
```

### Step 3: Site Configuration
```nginx
# /etc/nginx/sites-available/example.com
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Include shared SSL parameters
    include /etc/nginx/conf.d/ssl-params.conf;

    # HSTS (31536000 seconds = 1 year)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    root /var/www/example.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Step 4: Auto-Renewal
```bash
# Certbot sets up auto-renewal automatically
# Verify with:
sudo certbot renew --dry-run

# Check renewal timer
systemctl status certbot.timer
```

### Step 5: Verify Configuration
```bash
# Test Nginx config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Test SSL (should show A+ on ssllabs.com)
curl -I https://example.com
```

## Best Practices
- Generate DH parameters: `openssl dhparam -out /etc/nginx/dhparam.pem 2048`
- Enable OCSP stapling for faster TLS handshakes
- Use shared ssl-params.conf for consistency across sites
- Enable HTTP/2 for performance (add http2 to listen directive)
- Set HSTS max-age to at least 1 year (31536000)
- Test with SSL Labs (ssllabs.com/ssltest/) — aim for A+
- Set up certificate expiry monitoring

## Common Mistakes
- Not redirecting HTTP to HTTPS (mixed content issues)
- Enabling TLS 1.0/1.1 (deprecated, fails security audits)
- Missing OCSP stapling (slower TLS handshakes)
- HSTS max-age too short (less than 6 months)
- Not testing certificate renewal (certificates expire silently)
- Forgetting to include intermediate certificates (chain errors)
