---
id: mkcert-docker-https
stackId: mkcert
type: skill
name: HTTPS for Docker Compose with mkcert
description: >-
  Configure trusted HTTPS in Docker Compose development environments —
  certificate mounting, CA trust in containers, Nginx TLS termination, and
  inter-service secure communication.
difficulty: advanced
tags:
  - mkcert
  - https
  - docker
  - compose
  - security
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
  - question: "When should I use the HTTPS for Docker Compose with mkcert skill?"
    answer: >-
      Configure trusted HTTPS in Docker Compose development environments —
      certificate mounting, CA trust in containers, Nginx TLS termination, and
      inter-service secure communication. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does HTTPS for Docker Compose with mkcert require?"
    answer: >-
      Requires Docker installed. Works with mkcert projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# HTTPS for Docker Compose with mkcert

## Overview
Docker containers do not inherit your host machine's trust store. To use mkcert certificates inside Docker Compose, you must mount the certificates and CA into containers and configure the reverse proxy for TLS termination.

## Why This Matters
- **Production parity** — develop with HTTPS just like production
- **Cookie security** — test Secure and SameSite cookie behavior
- **API authentication** — test OAuth callbacks that require HTTPS
- **Inter-service TLS** — verify service-to-service HTTPS communication

## How It Works

### Step 1: Generate Certificates
```bash
# Generate certs for all your local services
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 \
  myapp.local api.myapp.local db.myapp.local

# Find your mkcert CA location
mkcert -CAROOT
# e.g., /Users/you/Library/Application Support/mkcert
```

### Step 2: Configure Nginx as TLS Proxy
```nginx
# nginx/default.conf
server {
    listen 443 ssl;
    server_name myapp.local;

    ssl_certificate     /etc/nginx/certs/local-cert.pem;
    ssl_certificate_key /etc/nginx/certs/local-key.pem;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }

    location /api {
        proxy_pass http://api:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### Step 3: Docker Compose Configuration
```yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - api

  frontend:
    build: ./frontend
    volumes:
      - ./frontend/src:/app/src

  api:
    build: ./api
    volumes:
      - ./api/src:/app/src
    environment:
      # If the API calls other HTTPS services, it needs the CA
      - NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/rootCA.pem

  # For containers that need to trust the mkcert CA
  api-with-ca:
    build: ./api
    volumes:
      - "$(mkcert -CAROOT)/rootCA.pem:/usr/local/share/ca-certificates/rootCA.pem:ro"
    environment:
      - NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/rootCA.pem
```

### Step 4: Update /etc/hosts
```bash
# Add custom domains
echo "127.0.0.1 myapp.local api.myapp.local" | sudo tee -a /etc/hosts
```

### Step 5: Verify
```bash
docker compose up -d
curl https://myapp.local  # Should work without --insecure
```

## Best Practices
- Use Nginx or Caddy for TLS termination, not individual services
- Mount only the CA certificate (rootCA.pem), never the CA key
- Use `NODE_EXTRA_CA_CERTS` for Node.js containers that need CA trust
- For non-Node containers, update the system trust store in the Dockerfile
- Document the mkcert and /etc/hosts setup in project README

## Common Mistakes
- Mounting the CA key into containers (security risk)
- Using `NODE_TLS_REJECT_UNAUTHORIZED=0` instead of proper CA trust
- Forgetting to update /etc/hosts for custom domains
- Not mounting certificates as read-only (:ro)
