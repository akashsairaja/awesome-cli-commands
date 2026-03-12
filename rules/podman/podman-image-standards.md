---
id: podman-image-standards
stackId: podman
type: rule
name: Container Image Standards for Podman
description: >-
  Enforce container image best practices — Containerfile naming, multi-stage
  builds, non-root users, pinned versions, and registry configuration for Podman
  workflows.
difficulty: beginner
globs:
  - '**/Containerfile'
  - '**/Dockerfile'
  - '**/.containerignore'
tags:
  - containerfile
  - image-best-practices
  - multi-stage-build
  - non-root
  - pinned-versions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Should I use Containerfile or Dockerfile with Podman?
    answer: >-
      Use Containerfile — it is the OCI-standard name and Podman's convention.
      Podman searches for Containerfile first, then falls back to Dockerfile.
      The syntax is identical. Using Containerfile signals that your project
      supports Podman natively.
  - question: Why use numeric UIDs in the USER directive?
    answer: >-
      Numeric UIDs (e.g., USER 1001) are portable across container runtimes.
      Username-based UIDs require the user to exist in /etc/passwd inside the
      container. Numeric UIDs work even in distroless images that have no passwd
      file and are compatible with Kubernetes SecurityContext runAsUser.
relatedItems:
  - podman-rootless-first
  - podman-quadlet-standards
  - podman-rootless-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Container Image Standards for Podman

## Rule
All container images MUST use Containerfiles (not Dockerfiles) with pinned versions, non-root users, and multi-stage builds.

## Format
```dockerfile
# Use Containerfile as the filename (Podman convention)
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.3 AS builder
# Build stage...

FROM registry.access.redhat.com/ubi9/ubi-micro:9.3
COPY --from=builder /app /app
USER 1001
ENTRYPOINT ["/app/server"]
```

## Requirements
1. **File naming** — use `Containerfile` (Podman convention), not `Dockerfile`
2. **Pinned versions** — always pin base image tags; use digests for production
3. **Non-root USER** — set numeric UID (not username) for portability
4. **Multi-stage builds** — separate build and runtime stages
5. **Minimal base** — prefer ubi-micro, distroless, or Alpine
6. **Labels** — include maintainer, version, and description OCI labels
7. **No secrets** — never COPY credentials; use `--mount=type=secret`

## Examples

### Good
```dockerfile
# Containerfile
FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM docker.io/library/node:20-alpine
LABEL org.opencontainers.image.source="https://github.com/org/app"
LABEL org.opencontainers.image.version="1.2.0"
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER 1001
EXPOSE 3000
ENTRYPOINT ["node", "dist/server.js"]
```

### Bad
```dockerfile
FROM node:latest
COPY . .
COPY .env .env
RUN npm install
CMD node server.js
# No USER, no multi-stage, latest tag, secrets copied
```

## Enforcement
Lint Containerfiles with `hadolint` in CI. Reject images without USER directive, with :latest tags, or with COPY .env commands.
