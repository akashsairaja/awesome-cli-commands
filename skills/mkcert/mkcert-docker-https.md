---
id: mkcert-docker-https
stackId: mkcert
type: skill
name: HTTPS for Docker Compose with mkcert
description: >-
  Configure trusted HTTPS in Docker Compose development environments —
  certificate generation, Nginx and Caddy TLS termination, CA trust injection
  into containers, inter-service HTTPS, and multi-developer team setup.
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
      Use this skill when your local Docker Compose development environment
      needs trusted HTTPS — testing Secure/SameSite cookies, OAuth callbacks
      that require HTTPS, service-to-service TLS, WebSocket Secure (wss://),
      or any feature gated behind HTTPS in browsers and APIs.
  - question: "What tools and setup does HTTPS for Docker Compose with mkcert require?"
    answer: >-
      Requires mkcert installed on the host machine and Docker Compose.
      Run 'mkcert -install' once to create and trust the local CA. Certificates
      are mounted into containers as volumes — mkcert itself does not need to
      be installed inside Docker.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# HTTPS for Docker Compose with mkcert

## Overview

Docker containers do not inherit your host machine's trust store. When you run `mkcert` on your host and generate certificates, your browser trusts them because mkcert installed its CA into the host's trust store. But containers start with a clean slate — they do not know about your local CA. To use trusted HTTPS inside Docker Compose, you mount the certificates into a reverse proxy for TLS termination and inject the CA certificate into any container that needs to make outbound HTTPS calls to other local services.

## Why Local HTTPS Matters

Browser and API behaviors differ between HTTP and HTTPS in ways that break real development:

- **Secure cookies** — cookies with `Secure` and `SameSite=None` attributes only work over HTTPS. OAuth flows, session management, and cross-site authentication require them.
- **OAuth callbacks** — Google, GitHub, and most OAuth providers reject non-HTTPS redirect URIs (except localhost in some cases).
- **Mixed content** — browsers block HTTP requests from HTTPS pages. If your production frontend is HTTPS, your development frontend should be too.
- **WebSocket Secure** — `wss://` requires TLS. Testing WebSocket features locally needs HTTPS.
- **Service Workers** — only register on HTTPS origins (except localhost).
- **HTTP/2** — browsers require TLS for HTTP/2 connections.

## Step 1: Generate Certificates

```bash
# Create a certs directory in your project
mkdir -p certs

# Generate certificates for all local domains
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 ::1 \
  myapp.local api.myapp.local admin.myapp.local

# Note your CA root location (needed for container trust)
mkcert -CAROOT
# Output: /Users/you/Library/Application Support/mkcert (macOS)
# Output: /home/you/.local/share/mkcert (Linux)
```

The certificate covers all listed domains and IPs. Include `localhost` and `127.0.0.1` as fallbacks. Add every custom domain your services use.

## Step 2: Configure /etc/hosts

```bash
# Add custom domains (run once)
echo "127.0.0.1 myapp.local api.myapp.local admin.myapp.local" | \
  sudo tee -a /etc/hosts
```

On Windows, the hosts file is at `C:\Windows\System32\drivers\etc\hosts`. On macOS/Linux, it is `/etc/hosts`.

## Step 3: Nginx TLS Termination

Nginx handles TLS and proxies to your application containers over plain HTTP:

```nginx
# nginx/default.conf
upstream frontend {
    server frontend:3000;
}

upstream api {
    server api:8080;
}

server {
    listen 443 ssl http2;
    server_name myapp.local;

    ssl_certificate     /etc/nginx/certs/local-cert.pem;
    ssl_certificate_key /etc/nginx/certs/local-key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # API
    location /api/ {
        proxy_pass http://api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name myapp.local;
    return 301 https://$host$request_uri;
}
```

## Alternative: Caddy (Zero-Config TLS)

Caddy's configuration is significantly simpler than Nginx for TLS:

```
# Caddyfile
{
    auto_https off
}

myapp.local {
    tls /etc/caddy/certs/local-cert.pem /etc/caddy/certs/local-key.pem

    handle /api/* {
        reverse_proxy api:8080
    }

    handle {
        reverse_proxy frontend:3000
    }
}
```

## Step 4: Docker Compose Configuration

```yaml
# docker-compose.yml
services:
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - frontend
      - api
    networks:
      - app

  frontend:
    build: ./frontend
    volumes:
      - ./frontend/src:/app/src
    environment:
      - NEXT_PUBLIC_API_URL=https://myapp.local/api
    networks:
      - app

  api:
    build: ./api
    volumes:
      - ./api/src:/app/src
    environment:
      - FRONTEND_URL=https://myapp.local
      - CORS_ORIGIN=https://myapp.local
    networks:
      - app

networks:
  app:
    driver: bridge
```

## Step 5: CA Trust for Inter-Service HTTPS

If your API container makes HTTPS calls to other local services (or to itself through the proxy), it needs to trust the mkcert CA. Without this, you get `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or `certificate verify failed` errors.

### Node.js Containers

```yaml
services:
  api:
    build: ./api
    volumes:
      - ./api/src:/app/src
      - ${MKCERT_CA:-~/.local/share/mkcert}/rootCA.pem:/usr/local/share/ca-certificates/rootCA.pem:ro
    environment:
      - NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/rootCA.pem
```

The `NODE_EXTRA_CA_CERTS` environment variable tells Node.js to trust additional CA certificates beyond the built-in set. This is the correct approach — never use `NODE_TLS_REJECT_UNAUTHORIZED=0`, which disables all TLS verification.

### Python Containers

```yaml
services:
  worker:
    build: ./worker
    volumes:
      - ${MKCERT_CA:-~/.local/share/mkcert}/rootCA.pem:/usr/local/share/ca-certificates/rootCA.pem:ro
    environment:
      - REQUESTS_CA_BUNDLE=/usr/local/share/ca-certificates/rootCA.pem
      - SSL_CERT_FILE=/usr/local/share/ca-certificates/rootCA.pem
```

### Go Containers

```yaml
services:
  service:
    build: ./service
    volumes:
      - ${MKCERT_CA:-~/.local/share/mkcert}/rootCA.pem:/usr/local/share/ca-certificates/rootCA.pem:ro
    environment:
      - SSL_CERT_FILE=/usr/local/share/ca-certificates/rootCA.pem
```

### System-Level CA Trust (Any Language)

For containers where environment variables are not sufficient, update the system trust store in the Dockerfile:

```dockerfile
FROM python:3.12-slim

# Copy CA cert and update system trust store
COPY rootCA.pem /usr/local/share/ca-certificates/rootCA.crt
RUN update-ca-certificates

WORKDIR /app
COPY . .
CMD ["python", "main.py"]
```

Note the `.crt` extension — `update-ca-certificates` requires it on Debian-based images.

## Team Setup with Environment Variables

Different developers have their mkcert CA in different locations. Use environment variables to make the setup portable:

```bash
# .env (each developer creates their own, gitignored)
MKCERT_CA=/Users/alice/Library/Application Support/mkcert
```

```yaml
# docker-compose.yml
services:
  api:
    volumes:
      - "${MKCERT_CA}/rootCA.pem:/usr/local/share/ca-certificates/rootCA.pem:ro"
```

Document the setup in your project README:

```bash
# One-time setup for each developer
mkcert -install
mkdir -p certs
mkcert -cert-file certs/local-cert.pem -key-file certs/local-key.pem \
  localhost 127.0.0.1 myapp.local api.myapp.local
echo "MKCERT_CA=$(mkcert -CAROOT)" > .env
echo "127.0.0.1 myapp.local api.myapp.local" | sudo tee -a /etc/hosts
```

## Verification

```bash
# Start the stack
docker compose up -d

# Verify HTTPS works without --insecure
curl https://myapp.local
# Should succeed with no TLS warnings

# Verify the certificate
openssl s_client -connect myapp.local:443 -servername myapp.local < /dev/null 2>/dev/null | \
  openssl x509 -noout -subject -issuer
# subject: O=mkcert development CA, ...
# issuer: O=mkcert development CA, ...

# Test from inside a container (if CA is mounted)
docker compose exec api curl https://myapp.local
# Should succeed without TLS errors
```

## Gitignore Configuration

```bash
# .gitignore
certs/
.env

# Do NOT gitignore:
# nginx/default.conf (or Caddyfile)
# docker-compose.yml
```

The certificate and key files are development-only and should not be committed. The Nginx/Caddy config and Compose file are safe to commit — they reference file paths, not secrets.

## Best Practices

- Use a reverse proxy (Nginx or Caddy) for TLS termination — do not configure TLS in individual application containers.
- Mount certificates and CA as read-only (`:ro`) volumes.
- Mount only `rootCA.pem` into containers that need CA trust — never mount `rootCA-key.pem`. The CA key can sign arbitrary certificates.
- Use `NODE_EXTRA_CA_CERTS` for Node.js, `REQUESTS_CA_BUNDLE`/`SSL_CERT_FILE` for Python, and `SSL_CERT_FILE` for Go. These are the standard mechanisms each runtime provides.
- Never set `NODE_TLS_REJECT_UNAUTHORIZED=0` — it disables all TLS verification, not just for local certificates.
- Keep certificates in a gitignored `certs/` directory. Document the generation command in your README.
- Use environment variables for the CA root path so the setup works across macOS, Linux, and Windows developers.

## Common Pitfalls

- Mounting `rootCA-key.pem` into containers — this is the CA's private key. Anyone with it can mint trusted certificates. Only mount `rootCA.pem` (the public certificate).
- Using `NODE_TLS_REJECT_UNAUTHORIZED=0` instead of proper CA trust — this mask hides real TLS issues and often leaks into production configurations.
- Forgetting to update `/etc/hosts` — browsers resolve custom domains via DNS, and `myapp.local` does not resolve without a hosts entry.
- Not mounting certificates as read-only — containers should not be able to modify certificates.
- Committing `.pem` files to Git — they are development artifacts, not project code. Gitignore the entire `certs/` directory.
- Running `mkcert -install` inside Docker — mkcert needs to modify the host trust store. Always run it on the host machine.
