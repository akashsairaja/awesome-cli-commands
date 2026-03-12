---
id: docker-non-root-containers
stackId: docker
type: rule
name: Always Run Containers as Non-Root
description: >-
  Enforce non-root user execution in all Docker containers — create dedicated
  users, set proper file ownership, and configure runtime security to prevent
  privilege escalation.
difficulty: beginner
globs:
  - '**/Dockerfile*'
  - '**/.hadolint.yaml'
tags:
  - non-root
  - docker-security
  - least-privilege
  - hadolint
  - container-security
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
  - question: Why must Docker containers run as non-root?
    answer: >-
      Running as root inside a container means a container escape vulnerability
      gives the attacker root access on the host system. Non-root execution
      limits blast radius — even if the container is compromised, the attacker
      has restricted permissions. It is the single most impactful Docker
      security control.
  - question: How do I create a non-root user in a Dockerfile?
    answer: >-
      Use 'RUN addgroup --system --gid 1001 appgroup && adduser --system --uid
      1001 --ingroup appgroup appuser' to create a system user, then 'USER
      appuser' to switch to it. For Node.js images, use the built-in 'node'
      user. Use --chown flag on COPY to set file ownership.
relatedItems:
  - docker-pin-image-versions
  - docker-minimal-base-images
  - kubernetes-pod-security
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Always Run Containers as Non-Root

## Rule
Every Dockerfile MUST include a non-root USER directive. Production containers MUST NOT run as root.

## Why This Matters
Running as root inside a container means a container escape vulnerability gives the attacker root access on the host. Non-root execution is the single most impactful Docker security control.

## Format
```dockerfile
# Create a non-root user and switch to it
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser
USER appuser
```

## Good Examples

### Node.js
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci --only=production
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Python
```dockerfile
FROM python:3.12-slim
RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /app
COPY --chown=app:app requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY --chown=app:app . .
USER app
EXPOSE 8000
CMD ["gunicorn", "main:app"]
```

### Go (Scratch)
```dockerfile
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o server .

FROM scratch
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /app/server /server
USER 65534:65534
ENTRYPOINT ["/server"]
```

## Bad Examples
```dockerfile
# BAD: No USER directive — runs as root
FROM node:20
WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "index.js"]

# BAD: Explicitly sets root
USER root
CMD ["node", "index.js"]
```

## Runtime Enforcement
```bash
# Run with --user flag
docker run --user 1001:1001 myapp

# Prevent privilege escalation
docker run --security-opt no-new-privileges myapp

# Verify running user
docker exec myapp whoami
```

## Enforcement
- Lint Dockerfiles with Hadolint: `hadolint --failure-threshold error Dockerfile`
- Add to CI: reject builds where final stage has no USER or uses USER root
- Use OPA/Gatekeeper policies in Kubernetes to reject root containers
