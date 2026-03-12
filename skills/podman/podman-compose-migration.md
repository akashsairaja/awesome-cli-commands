---
id: podman-compose-migration
stackId: podman
type: skill
name: Migrate from Docker Compose to Podman
description: >-
  Step-by-step migration guide from Docker Compose to Podman — compatibility
  setup, compose file adjustments, networking differences, and production
  deployment patterns.
difficulty: intermediate
tags:
  - podman-compose
  - docker-migration
  - compose-compatibility
  - rootless-compose
  - container-orchestration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Podman 3.0+
  - podman-compose or docker-compose installed
  - Existing Docker Compose project
faq:
  - question: Can I use my existing Docker Compose files with Podman?
    answer: >-
      Yes. Most Docker Compose files work unchanged with 'podman compose'.
      Common adjustments needed: map ports > 1024 for rootless mode, use
      --userns=keep-id for bind mount permissions, and set the DOCKER_HOST
      variable to the Podman socket if using docker-compose binary.
  - question: What is the difference between podman-compose and podman compose?
    answer: >-
      'podman compose' is a built-in Podman subcommand (Podman 3.0+) that
      delegates to an external compose provider (docker-compose or
      podman-compose). 'podman-compose' is a standalone Python tool that
      reimplements compose functionality natively for Podman. Both work with
      standard docker-compose.yml files.
relatedItems:
  - podman-rootless-setup
  - podman-quadlet-services
  - podman-rootless-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Migrate from Docker Compose to Podman

## Overview
Podman provides Docker Compose compatibility through the `podman compose` subcommand (using docker-compose or podman-compose as a backend). Most Docker Compose files work unchanged, but some adjustments are needed for rootless mode, networking, and volume ownership.

## Why This Matters
- **No daemon dependency** — eliminates Docker daemon as a single point of failure
- **Rootless by default** — better security posture
- **Kubernetes path** — generate Kubernetes YAML from Podman pods
- **Drop-in replacement** — minimal changes to existing workflows

## How It Works

### Step 1: Install Podman Compose Support
```bash
# Option A: Use built-in podman compose (Podman 3.0+)
# Requires docker-compose or podman-compose installed as backend
pip3 install podman-compose

# Option B: Docker Compose with Podman socket
systemctl --user start podman.socket
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
# Now docker-compose commands use Podman
```

### Step 2: Adjust Compose File for Podman
```yaml
# docker-compose.yml — works with both Docker and Podman
version: "3.8"
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "8080:80"      # Use port > 1024 for rootless
    volumes:
      - web-data:/usr/share/nginx/html
    # Podman-specific: userns for rootless UID mapping
    # userns_mode: "keep-id"  # Uncomment if volume permissions fail

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: dev-only
    volumes:
      - db-data:/var/lib/postgresql/data
    # For rootless Podman, ensure the container user matches
    # user: "999:999"  # postgres user UID:GID

volumes:
  web-data:
  db-data:
```

### Step 3: Handle Common Compatibility Issues
```bash
# Issue: Volume permission denied in rootless mode
# Fix: Use --userns=keep-id to map container UID to host UID
podman run --userns=keep-id -v ./data:/data myimage

# Issue: Container cannot resolve other container names
# Fix: Podman creates a default network — ensure containers are on it
podman network create myapp
podman compose --project-name myapp up

# Issue: Port < 1024 in rootless mode
# Fix: Use higher port mapping or adjust sysctl
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=80
```

### Step 4: Run and Verify
```bash
# Start services
podman compose up -d

# Check status
podman compose ps
podman compose logs -f

# Verify networking between containers
podman compose exec web curl http://db:5432

# Stop and clean up
podman compose down
```

### Step 5: Generate Kubernetes YAML (Bonus)
```bash
# Convert running Podman pod to Kubernetes YAML
podman generate kube myapp-pod > k8s-deployment.yaml

# Deploy to Kubernetes
kubectl apply -f k8s-deployment.yaml
```

## Best Practices
- Test compose files with `podman compose config` before running
- Use `--userns=keep-id` for bind mounts with rootless Podman
- Map ports > 1024 for rootless compatibility
- Use named volumes instead of bind mounts where possible
- Generate Kubernetes YAML from working pods for production migration

## Common Mistakes
- Expecting Docker socket at /var/run/docker.sock (use Podman socket instead)
- Not handling UID mapping for rootless volume permissions
- Using `depends_on` without health checks (same issue as Docker)
- Assuming `docker` CLI alias exists (create it: `alias docker=podman`)
