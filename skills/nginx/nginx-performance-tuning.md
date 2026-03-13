---
id: nginx-performance-tuning
stackId: nginx
type: skill
name: Tune Nginx for High Performance
description: >-
  Optimize Nginx performance — worker processes, connection handling, gzip
  compression, static file caching, buffer tuning, and keepalive
  configuration.
difficulty: intermediate
tags:
  - nginx
  - tune
  - high
  - performance
  - optimization
  - api
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Tune Nginx for High Performance skill?"
    answer: >-
      Optimize Nginx performance — worker processes, connection handling, gzip
      compression, static file caching, buffer tuning, and keepalive
      configuration. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Tune Nginx for High Performance require?"
    answer: >-
      Works with standard nginx tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Tune Nginx for High Performance

## Overview
Nginx performance tuning involves optimizing worker processes, connection handling, compression, caching, and buffer sizes. A well-tuned Nginx can handle tens of thousands of concurrent connections on modest hardware.

## Why This Matters
- **Throughput** — handle more requests per second
- **Latency** — faster response times for users
- **Cost** — fewer servers needed for the same traffic
- **Stability** — prevent resource exhaustion under load

## How It Works

### Step 1: Worker Configuration
```nginx
# /etc/nginx/nginx.conf
worker_processes auto;        # One per CPU core
worker_rlimit_nofile 65535;   # File descriptor limit

events {
    worker_connections 4096;  # Max connections per worker
    multi_accept on;          # Accept multiple connections at once
    use epoll;                # Linux: efficient event processing
}
```

### Step 2: HTTP Optimization
```nginx
http {
    # Connection keepalive
    keepalive_timeout 65;
    keepalive_requests 100;

    # Buffer tuning
    client_body_buffer_size 16k;
    client_header_buffer_size 1k;
    client_max_body_size 16m;
    large_client_header_buffers 4 8k;

    # File handling
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Mime types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log combined buffer=512k flush=1m;
    error_log /var/log/nginx/error.log warn;
}
```

### Step 3: Gzip Compression
```nginx
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 4;
gzip_min_length 256;
gzip_types
    text/plain
    text/css
    text/javascript
    application/javascript
    application/json
    application/xml
    image/svg+xml
    font/woff2;
```

### Step 4: Static File Caching
```nginx
# Cache static assets
location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location ~* \.(css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}

location ~* \.(woff|woff2|ttf|otf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

### Step 5: Proxy Cache for Dynamic Content
```nginx
# Define cache zone
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m use_temp_path=off;

server {
    location /api/ {
        proxy_pass http://backend;
        proxy_cache app_cache;
        proxy_cache_valid 200 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## Best Practices
- Set worker_processes to auto (matches CPU cores)
- Enable sendfile, tcp_nopush, tcp_nodelay for efficient I/O
- Use gzip_comp_level 4-6 (beyond 6 has diminishing returns)
- Cache static assets with long expiry and immutable flag
- Buffer access logs to reduce disk I/O
- Use proxy_cache for cacheable API responses
- Monitor with stub_status module

## Common Mistakes
- Setting worker_connections too low (limits concurrency)
- Gzip compression level too high (CPU wasted for minimal gain)
- Not enabling sendfile (copies files through userspace unnecessarily)
- No buffered logging (disk I/O on every request)
- Caching dynamic content without proper cache-control headers
- Not setting worker_rlimit_nofile (file descriptor limit errors)
