---
id: docker-health-checks
stackId: docker
type: rule
name: Define Health Checks in Every Dockerfile
description: >-
  Every production Dockerfile must include a HEALTHCHECK instruction to enable
  container orchestrators to detect and replace unhealthy instances
  automatically.
difficulty: beginner
globs:
  - '**/Dockerfile*'
  - '**/docker-compose*.yml'
tags:
  - health-check
  - monitoring
  - container-orchestration
  - reliability
  - docker-compose
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
  - question: Why are Docker health checks important?
    answer: >-
      Health checks allow Docker and orchestrators to detect when a container is
      running but not functioning correctly (e.g., deadlocked, out of memory,
      unable to connect to database). Without health checks, Docker only knows
      if the process is running, not if it is serving requests correctly.
  - question: What is the difference between Docker HEALTHCHECK and Kubernetes probes?
    answer: >-
      Docker HEALTHCHECK is defined in the Dockerfile and checks container
      health at the Docker daemon level. Kubernetes has three separate probes:
      liveness (restart if unhealthy), readiness (remove from load balancer if
      not ready), and startup (wait for slow-starting containers). In
      Kubernetes, use probes instead of HEALTHCHECK.
relatedItems:
  - docker-compose-architect
  - kubernetes-health-probes
  - docker-non-root-containers
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Define Health Checks in Every Dockerfile

## Rule
Every production Dockerfile MUST include a HEALTHCHECK instruction. Docker Compose services MUST define health checks for dependency ordering.

## Format
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD <health check command>
```

## Good Examples

### HTTP Service
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/health"]
```

### PostgreSQL
```dockerfile
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD ["pg_isready", "-U", "postgres"]
```

### Redis
```dockerfile
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD ["redis-cli", "ping"]
```

### Docker Compose
```yaml
services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

  db:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    depends_on:
      db:
        condition: service_healthy
```

## Bad Examples
```dockerfile
# BAD: No health check at all
FROM node:20-slim
CMD ["node", "index.js"]

# BAD: Using curl in distroless (curl not available)
HEALTHCHECK CMD curl -f http://localhost:3000/health
```

## Parameter Guide
| Parameter | Purpose | Recommended |
|-----------|---------|-------------|
| `--interval` | Time between checks | 10-30s |
| `--timeout` | Max time per check | 3-5s |
| `--start-period` | Grace period on startup | 10-60s |
| `--retries` | Failures before unhealthy | 3-5 |

## Enforcement
- Hadolint rule to flag missing HEALTHCHECK
- CI pipeline check for HEALTHCHECK in production Dockerfiles
- Kubernetes liveness/readiness probes supplement Docker health checks
