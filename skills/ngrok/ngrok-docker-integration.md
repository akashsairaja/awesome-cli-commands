---
id: ngrok-docker-integration
stackId: ngrok
type: skill
name: Use Ngrok with Docker and Docker Compose
description: >-
  Integrate ngrok with Docker Compose — expose containerized services, configure
  tunnels as containers, and set up development environments with automatic
  tunnel creation.
difficulty: intermediate
tags:
  - ngrok
  - docker
  - docker-compose
  - containers
  - development-environment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Docker and Docker Compose installed
  - ngrok account
faq:
  - question: How do I use ngrok with Docker Compose?
    answer: >-
      Add ngrok as a service in docker-compose.yml using the ngrok/ngrok:latest
      image. Mount your ngrok.yml configuration and reference other services by
      their Docker Compose service name (e.g., app:3000 instead of
      localhost:3000). Start everything with 'docker compose up'.
  - question: Why does ngrok use service names instead of localhost in Docker?
    answer: >-
      In Docker Compose, each service runs in its own container with its own
      network namespace. 'localhost' inside the ngrok container refers to ngrok
      itself, not your app. Docker Compose creates a shared network where
      services are accessible by their service name (app, db, api).
relatedItems:
  - ngrok-tunnel-architect
  - ngrok-config-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Use Ngrok with Docker and Docker Compose

## Overview
Run ngrok as a Docker container alongside your services in Docker Compose. This creates tunnels automatically when you start your development environment, with no manual ngrok commands needed.

## Why This Matters
- **One command setup** — `docker compose up` starts everything including tunnels
- **Consistent environment** — tunnel configuration is part of the stack
- **Team onboarding** — new developers get tunnels automatically
- **Service discovery** — ngrok container connects to other containers by name

## How It Works

### Step 1: Docker Compose with Ngrok
```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp

  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp

  ngrok:
    image: ngrok/ngrok:latest
    restart: unless-stopped
    command:
      - "start"
      - "--all"
      - "--config"
      - "/etc/ngrok.yml"
    volumes:
      - ./ngrok.yml:/etc/ngrok.yml
    ports:
      - "4040:4040"  # Inspection UI
    depends_on:
      - app
```

### Step 2: Ngrok Configuration for Docker
```yaml
# ngrok.yml (mounted into container)
version: "3"
agent:
  authtoken: your-auth-token

tunnels:
  app:
    addr: app:3000          # Reference by Docker service name
    proto: http
    domain: myapp-dev.ngrok.dev
```

### Step 3: Get Tunnel URL Programmatically
```typescript
// In your app, fetch the tunnel URL from ngrok API
async function getNgrokUrl(): Promise<string> {
  const response = await fetch('http://ngrok:4040/api/tunnels');
  const data = await response.json();
  return data.tunnels[0].public_url;
}
```

### Step 4: Use Environment Variables
```yaml
# docker-compose.yml
services:
  ngrok:
    image: ngrok/ngrok:latest
    environment:
      - NGROK_AUTHTOKEN=${NGROK_AUTHTOKEN}
    command:
      - "http"
      - "app:3000"
      - "--domain=myapp-dev.ngrok.dev"
```

```bash
# .env
NGROK_AUTHTOKEN=your-auth-token
```

## Best Practices
- Use Docker service names (app, api) as tunnel addresses
- Mount ngrok.yml as a volume for complex configurations
- Expose port 4040 for the inspection UI
- Use environment variables for authtoken (not in docker-compose.yml)
- Add ngrok as a depends_on for the service it tunnels
- Use .env file for secrets (gitignored)

## Common Mistakes
- Using localhost:3000 instead of service-name:3000 in Docker
- Committing ngrok authtoken in docker-compose.yml
- Not exposing port 4040 (no access to inspection UI)
- Missing depends_on (ngrok starts before the app is ready)
- Forgetting to gitignore .env file with authtoken
