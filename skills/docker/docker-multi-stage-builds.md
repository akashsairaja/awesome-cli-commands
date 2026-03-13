---
id: docker-multi-stage-builds
stackId: docker
type: skill
name: Multi-Stage Docker Builds
description: >-
  Master multi-stage Docker builds to create minimal production images —
  separate build dependencies from runtime, reduce image size by 90%, and
  eliminate security vulnerabilities.
difficulty: advanced
tags:
  - docker
  - multi-stage
  - builds
  - deployment
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Multi-Stage Docker Builds skill?"
    answer: >-
      Master multi-stage Docker builds to create minimal production images —
      separate build dependencies from runtime, reduce image size by 90%, and
      eliminate security vulnerabilities. This skill provides a structured
      workflow for image optimization, multi-stage builds, networking, and
      container orchestration.
  - question: "What tools and setup does Multi-Stage Docker Builds require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker installed. Works with Docker projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Multi-Stage Docker Builds

## Overview
Multi-stage builds use multiple FROM statements in a single Dockerfile. Each stage can use a different base image, and you selectively copy artifacts from build stages into the final runtime image. This produces minimal images without build tools, compilers, or dev dependencies.

## Why This Matters
- **Smaller images** — production images can be 10-50x smaller than single-stage builds
- **Fewer CVEs** — no build tools, compilers, or package managers in runtime image
- **Faster deployments** — smaller images push/pull faster across registries
- **Better caching** — Docker caches each stage independently

## Step 1: Understand the Problem

### Single-Stage Build (Bad)
```dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Image includes: node, npm, dev dependencies, source code, build tools
# Size: ~1.2 GB
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

## Step 2: Convert to Multi-Stage

### Multi-Stage Build (Good)
```dockerfile
# Stage 1: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
# Image includes: only Node.js runtime, compiled code, prod dependencies
# Size: ~130 MB
EXPOSE 3000
CMD ["dist/index.js"]
```

## Step 3: Advanced Patterns

### Separate Dependency Install from Build
```dockerfile
# Stage 1: Dependencies
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules prod_modules
RUN npm ci

# Stage 2: Build
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=deps /app/prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["dist/index.js"]
```

### Go Binary (Scratch Image)
```dockerfile
FROM golang:1.22 AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server .

FROM scratch
COPY --from=builder /app/server /server
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
EXPOSE 8080
ENTRYPOINT ["/server"]
# Final image: ~15 MB
```

## Step 4: Use BuildKit Secrets for Private Registries
```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm ci
COPY . .
RUN npm run build
```

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t myapp .
```

## Best Practices
- Name stages clearly: `AS builder`, `AS deps`, `AS runtime`
- Use `--from=<stage>` to copy only what the runtime needs
- Install prod dependencies separately from dev dependencies
- Use distroless or scratch for the final stage when possible
- Leverage BuildKit cache mounts: `--mount=type=cache,target=/root/.npm`

## Common Mistakes
- Copying the entire `node_modules` including dev dependencies into the runtime image
- Not using `.dockerignore` — sending `node_modules` and `.git` as build context
- Using a full OS base image (ubuntu, debian) in the runtime stage
- Forgetting to copy SSL certificates into scratch images
