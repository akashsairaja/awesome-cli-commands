---
id: docker-image-optimization
stackId: docker
type: skill
name: Docker Image Size Optimization
description: >-
  Reduce Docker image size with .dockerignore, layer caching strategies,
  BuildKit cache mounts, slim base images, and dependency pruning techniques.
difficulty: intermediate
tags:
  - docker
  - image
  - size
  - optimization
  - security
  - deployment
  - ci-cd
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Docker Image Size Optimization skill?"
    answer: >-
      Reduce Docker image size with .dockerignore, layer caching strategies,
      BuildKit cache mounts, slim base images, and dependency pruning
      techniques. This skill provides a structured workflow for image
      optimization, multi-stage builds, networking, and container
      orchestration.
  - question: "What tools and setup does Docker Image Size Optimization require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, pip/poetry installed. Works with Docker
      projects. No additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Docker Image Size Optimization

## Overview
Large Docker images slow down CI/CD, waste registry storage, increase deployment times, and expand your attack surface. Learn techniques to reduce image size from gigabytes to megabytes.

## Why This Matters
- **Faster CI/CD** — smaller images push/pull in seconds, not minutes
- **Lower costs** — less registry storage, less bandwidth, less disk
- **Faster scaling** — new container instances start quicker
- **Better security** — fewer packages = fewer CVEs

## Step 1: Start with .dockerignore
```dockerignore
# .dockerignore
node_modules
.git
.gitignore
*.md
.env*
.vscode
.idea
coverage
.next
dist
docker-compose*.yml
Dockerfile*
```

## Step 2: Choose Slim Base Images
```bash
# Image size comparison (approximate)
node:20          # ~1.1 GB
node:20-slim     # ~200 MB
node:20-alpine   # ~130 MB
distroless       # ~120 MB (no shell)

python:3.12      # ~1.0 GB
python:3.12-slim # ~150 MB
python:3.12-alpine # ~60 MB
```

## Step 3: Optimize Layer Ordering
```dockerfile
# Bad: Invalidates npm cache on every code change
COPY . .
RUN npm ci

# Good: Dependencies cached unless package.json changes
COPY package*.json ./
RUN npm ci
COPY . .
```

## Step 4: Use BuildKit Cache Mounts
```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build
```

```dockerfile
# Python with pip cache
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt
COPY . .
```

## Step 5: Clean Up in the Same Layer
```dockerfile
# Bad: cleanup in separate layer doesn't reduce size
RUN apt-get update && apt-get install -y curl
RUN apt-get clean

# Good: cleanup in same RUN command
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

## Step 6: Analyze Image Layers
```bash
# View layer sizes
docker history myapp:latest

# Use dive for interactive analysis
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock wagoodman/dive myapp:latest

# Check final image size
docker images myapp:latest --format "{{.Size}}"
```

## Best Practices
- Always use .dockerignore to exclude unnecessary build context
- Order Dockerfile instructions from least to most frequently changing
- Combine RUN commands to reduce layer count
- Use `--no-install-recommends` with apt-get
- Remove caches and temp files in the same RUN layer
- Use multi-stage builds to exclude build dependencies

## Common Mistakes
- Forgetting .dockerignore (sending entire repo as build context)
- Installing packages you do not need in the runtime image
- Creating unnecessary layers with separate RUN commands for cleanup
- Not using slim or Alpine variants of base images
