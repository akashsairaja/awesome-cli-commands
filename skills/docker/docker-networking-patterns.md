---
id: docker-networking-patterns
stackId: docker
type: skill
name: >-
  Docker Networking & Service Discovery
description: >-
  Configure Docker networking for multi-container applications — bridge
  networks, DNS-based service discovery, network isolation, and
  troubleshooting connectivity issues.
difficulty: advanced
tags:
  - docker
  - networking
  - service
  - discovery
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
  - question: "When should I use the Docker Networking & Service Discovery skill?"
    answer: >-
      Configure Docker networking for multi-container applications — bridge
      networks, DNS-based service discovery, network isolation, and
      troubleshooting connectivity issues. It includes practical examples for
      container development.
  - question: "What tools and setup does Docker Networking & Service Discovery require?"
    answer: >-
      Requires Docker installed. Works with Docker projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Docker Networking & Service Discovery

## Overview
Docker networking enables containers to communicate securely. Understanding bridge networks, DNS resolution, and network isolation is essential for building reliable multi-service applications.

## Why This Matters
- **Service discovery** — containers find each other by name, not IP
- **Network isolation** — separate frontend, backend, and database traffic
- **Security** — only expose what needs to be public
- **Portability** — same networking works across environments

## Network Types

### Bridge Network (Default for Compose)
```bash
# Create a custom bridge network
docker network create --driver bridge app-network

# Run containers on the network
docker run -d --name api --network app-network myapi:1.0
docker run -d --name db --network app-network postgres:16

# api can reach db via hostname "db"
docker exec api ping db
```

### Docker Compose Networking
```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    networks:
      - frontend-net

  api:
    build: ./api
    networks:
      - frontend-net
      - backend-net
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/app

  db:
    image: postgres:16
    networks:
      - backend-net
    volumes:
      - pgdata:/var/lib/postgresql/data

networks:
  frontend-net:
    driver: bridge
  backend-net:
    driver: bridge
    internal: true  # No external access

volumes:
  pgdata:
```

## DNS-Based Service Discovery
```bash
# In Docker Compose, service names ARE hostnames
# api service connects to database as:
postgresql://user:pass@db:5432/mydb
#                       ^^ service name = hostname

# Redis connection:
redis://redis:6379
#       ^^^^^ service name

# Multiple replicas get round-robin DNS
docker compose up --scale api=3
# Other services reach any replica via "api" hostname
```

## Network Isolation Patterns
```yaml
# Three-tier isolation
networks:
  public:       # Internet-facing (frontend + reverse proxy)
    driver: bridge
  internal:     # API tier (api + workers)
    driver: bridge
    internal: true
  data:         # Database tier (db + cache)
    driver: bridge
    internal: true

services:
  nginx:
    networks: [public, internal]    # Bridge between public and API
  api:
    networks: [internal, data]      # Bridge between API and data
  db:
    networks: [data]                # Only accessible from data network
```

## Troubleshooting
```bash
# List all networks
docker network ls

# Inspect a network (see connected containers)
docker network inspect app-network

# Test connectivity from inside a container
docker exec -it api sh -c "nslookup db"
docker exec -it api sh -c "curl http://api:3000/health"

# Check if port is listening
docker exec -it db sh -c "netstat -tlnp"
```

## Best Practices
- Always use custom bridge networks (not the default bridge)
- Mark database networks as `internal: true` to block external access
- Use service names for inter-container communication, never IPs
- Expose only the minimum required ports to the host
- Use separate networks per security tier

## Common Mistakes
- Using `network_mode: host` in production (bypasses Docker networking)
- Hardcoding container IPs (they change on restart)
- Putting all services on one flat network (no isolation)
- Exposing database ports to the host when only API needs access
