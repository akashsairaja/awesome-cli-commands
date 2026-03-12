---
id: nginx-proxy-pass-standards
stackId: nginx
type: rule
name: Reverse Proxy Configuration Standards
description: >-
  Standards for Nginx reverse proxy configuration — required headers, upstream
  blocks, timeout settings, buffering rules, and WebSocket support requirements.
difficulty: intermediate
globs:
  - '**/nginx/**/*.conf'
tags:
  - nginx
  - reverse-proxy
  - upstream
  - websocket
  - standards
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why must I forward X-Forwarded-For in Nginx reverse proxy?
    answer: >-
      Without X-Forwarded-For, your backend sees all requests coming from
      Nginx's IP address. This breaks IP-based rate limiting, geo-location,
      analytics, and audit logging. The header preserves the original client IP
      through the proxy chain.
  - question: Why use upstream blocks even for a single backend server?
    answer: >-
      Upstream blocks enable keepalive connections (reducing latency), health
      checks, easy scaling (add more servers later), and load balancing
      configuration. Even with one server, the keepalive and failure handling
      features improve reliability.
relatedItems:
  - nginx-reverse-proxy-architect
  - nginx-config-structure
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Reverse Proxy Configuration Standards

## Rule
All reverse proxy configurations MUST forward proper headers, set timeouts, and use upstream blocks for backend servers.

## Required Proxy Headers
```nginx
# /etc/nginx/conf.d/proxy-params.conf
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Port $server_port;
```

## Required Timeouts
```nginx
proxy_connect_timeout 30s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

## Upstream Configuration
```nginx
# GOOD: Use upstream block
upstream backend {
    least_conn;
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    location / {
        proxy_pass http://backend;
        include /etc/nginx/conf.d/proxy-params.conf;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}

# BAD: Direct proxy_pass without upstream
location / {
    proxy_pass http://127.0.0.1:3000;
}
```

## WebSocket Proxying
```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400s;  # 24 hours for long-lived connections
}
```

## Rules
1. ALWAYS forward X-Real-IP and X-Forwarded-For headers
2. ALWAYS set explicit timeouts on proxy connections
3. Use upstream blocks for backend servers (even single server)
4. Enable keepalive connections to upstream servers
5. Use proxy_http_version 1.1 for upstream keepalive
6. Disable proxy_buffering for streaming/SSE endpoints
7. Add WebSocket headers for WebSocket locations

## Enforcement
Validate proxy headers with backend logging.
Test timeout behavior under load.
Monitor 502/504 errors for proxy misconfiguration.
