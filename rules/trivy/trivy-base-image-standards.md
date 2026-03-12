---
id: trivy-base-image-standards
stackId: trivy
type: rule
name: Base Image Selection Standards
description: >-
  Define approved base images for container builds — prefer minimal images
  (Alpine, Distroless), pin versions by digest, and require regular updates to
  reduce vulnerability surface.
difficulty: intermediate
globs:
  - '**/Dockerfile*'
  - '**/docker-compose*'
  - '**/.dockerignore'
tags:
  - base-images
  - distroless
  - alpine
  - container-hardening
  - trivy
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
  - question: Why should I use Alpine or Distroless base images?
    answer: >-
      Minimal base images have fewer packages, which means fewer
      vulnerabilities. An Alpine-based Node.js image has ~50 CVEs vs ~200+ in
      the full Debian-based image. Distroless goes further — no shell, no
      package manager, and the smallest possible attack surface.
  - question: Should I pin Docker base images by digest?
    answer: >-
      Yes for production. Tags like 'node:20-alpine' can point to different
      images over time. Digests (sha256:abc123...) are immutable — your build
      always uses the exact same base. Update digests deliberately when you want
      to pull in security patches.
relatedItems:
  - trivy-scan-before-push
  - trivy-ignore-policy
  - trivy-container-scanning
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Base Image Selection Standards

## Rule
All container images MUST use approved base images. Prefer minimal images to reduce attack surface. Pin versions by digest for reproducibility.

## Approved Base Images (Priority Order)
1. **Distroless** — no shell, no package manager, smallest attack surface
2. **Alpine** — minimal Linux with musl libc, ~5MB base
3. **Slim variants** — Debian slim, Ubuntu minimal
4. **Full OS images** — only when dependencies require it (document reason)

## Examples

### Good
```dockerfile
# Best — Distroless for production
FROM gcr.io/distroless/nodejs20-debian12@sha256:abc123...

# Good — Alpine with pinned version
FROM node:20.11-alpine3.19

# Acceptable — Slim variant with pin
FROM python:3.12-slim-bookworm
```

### Bad
```dockerfile
# Bad — latest tag (unpinned, changes without notice)
FROM node:latest

# Bad — full OS image without justification
FROM ubuntu:22.04

# Bad — no version pin
FROM python
```

## Multi-Stage Build Pattern
```dockerfile
# Build stage — can use full image
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage — minimal image
FROM gcr.io/distroless/nodejs20-debian12
COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
WORKDIR /app
CMD ["dist/server.js"]
```

## Update Policy
- Base images must be updated within 7 days of a security advisory
- Run weekly automated scans of all base images in use
- Track base image versions in a central registry

## Anti-Patterns
- Using `latest` tag (unpredictable, breaks reproducibility)
- Using full OS images for simple applications
- Not using multi-stage builds (build dependencies in production)
- Pinning tags but not digests (tags can be moved)
- Never updating base images after initial setup
