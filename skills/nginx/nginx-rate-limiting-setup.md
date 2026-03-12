---
id: nginx-rate-limiting-setup
stackId: nginx
type: skill
name: Implement Rate Limiting in Nginx
description: >-
  Configure Nginx rate limiting — per-IP request limits, burst handling, zone
  configuration, and different limits for API endpoints vs static content.
difficulty: intermediate
tags:
  - nginx
  - rate-limiting
  - security
  - ddos
  - api-protection
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Nginx installed
  - Understanding of expected traffic patterns
faq:
  - question: How does Nginx rate limiting work?
    answer: >-
      Nginx uses the leaky bucket algorithm. You define a rate (e.g., 10r/s) and
      a zone (memory area tracking client IPs). Requests within the rate pass
      through. Excess requests either queue (up to burst limit) or are rejected
      with 429 status. Each zone tracks clients independently.
  - question: What is the difference between burst with nodelay vs delay in Nginx?
    answer: >-
      With nodelay, burst requests are processed immediately — if 20 requests
      arrive at once and burst=20, all 20 are served instantly. With delay=10,
      the first 10 are served immediately, and the remaining 10 are queued and
      released at the configured rate. Nodelay is better for APIs, delay for web
      pages.
relatedItems:
  - nginx-security-hardening
  - nginx-reverse-proxy-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Implement Rate Limiting in Nginx

## Overview
Nginx rate limiting controls how many requests a client can make in a given time window. It protects against brute-force attacks, DDoS, and API abuse by limiting requests per IP address or other identifiers.

## Why This Matters
- **DDoS protection** — limits request flood impact
- **Brute-force prevention** — slows credential stuffing attacks
- **API abuse prevention** — enforces fair usage limits
- **Resource protection** — prevents server overload

## How It Works

### Step 1: Define Rate Limit Zones
```nginx
# In http {} block
# 10 requests per second per IP
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

# 5 requests per second for login
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/s;

# 30 requests per second for API
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

# 1 request per second for expensive operations
limit_req_zone $binary_remote_addr zone=expensive:10m rate=1r/s;
```

### Step 2: Apply Rate Limits
```nginx
server {
    # General rate limit for all routes
    limit_req zone=general burst=20 nodelay;
    limit_req_status 429;
    limit_req_log_level warn;

    # Stricter limit for login
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://backend;
    }

    # API endpoints
    location /api/ {
        limit_req zone=api burst=50 delay=30;
        proxy_pass http://backend;
    }

    # Expensive operations (export, report generation)
    location /api/export {
        limit_req zone=expensive burst=3 nodelay;
        proxy_pass http://backend;
    }

    # No rate limit on static assets
    location /static/ {
        limit_req off;
        expires 1y;
    }
}
```

### Step 3: Connection Limiting
```nginx
# Limit concurrent connections per IP
limit_conn_zone $binary_remote_addr zone=addr:10m;

server {
    limit_conn addr 100;  # Max 100 concurrent connections per IP
    limit_conn_status 429;
}
```

### Step 4: Custom Error Page
```nginx
error_page 429 /429.html;
location = /429.html {
    root /var/www/errors;
    internal;
}
```

## Rate Limit Parameters
| Parameter | Effect |
|-----------|--------|
| `rate=10r/s` | 10 requests per second sustained rate |
| `burst=20` | Allow 20 excess requests to queue |
| `nodelay` | Process burst immediately (no queuing) |
| `delay=10` | Process first 10 burst requests immediately, queue rest |

## Best Practices
- Use different zones for different endpoint types
- Set burst to handle legitimate traffic spikes
- Use nodelay for API endpoints (reject excess, don't queue)
- Use delay for web pages (queue briefly for better UX)
- Return 429 status code (standard for rate limiting)
- Log rate limit events for monitoring
- Exempt known-good IPs (load balancers, monitoring)

## Common Mistakes
- No burst setting (rejects legitimate bursty traffic)
- Same rate limit for login and static assets
- Not returning 429 status (clients cannot distinguish rate limit from errors)
- Rate limiting internal health check endpoints
- Not logging rate limit events (invisible abuse attempts)
