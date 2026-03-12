---
id: docker-minimal-base-images
stackId: docker
type: rule
name: Use Minimal Base Images
description: >-
  Choose the smallest possible base image for production containers —
  distroless, Alpine, or scratch to minimize attack surface, reduce CVEs, and
  speed up deployments.
difficulty: beginner
globs:
  - '**/Dockerfile*'
tags:
  - base-images
  - distroless
  - alpine
  - scratch
  - image-size
  - security
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
  - question: What is a distroless Docker image?
    answer: >-
      Distroless images from Google (gcr.io/distroless) contain only the
      language runtime and your application — no shell, no package manager, no
      OS utilities. This minimizes attack surface and CVE count. Available for
      Node.js, Python, Java, Go, Rust, and .NET.
  - question: When should I use Alpine vs distroless vs scratch?
    answer: >-
      Use scratch for statically compiled binaries (Go, Rust) — it is literally
      an empty filesystem. Use distroless for interpreted languages (Node.js,
      Python, Java) in production — minimal attack surface. Use Alpine when you
      need a shell for debugging or apk for additional system packages.
relatedItems:
  - docker-non-root-containers
  - docker-pin-image-versions
  - docker-multi-stage-builds
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Use Minimal Base Images

## Rule
Production containers MUST use minimal base images. Never use full OS images (ubuntu, debian) as the runtime base. Use distroless, Alpine, or scratch.

## Image Selection Guide
| Use Case | Recommended Base | Size |
|----------|-----------------|------|
| Node.js | `gcr.io/distroless/nodejs20-debian12` | ~120 MB |
| Python | `python:3.12-slim` | ~150 MB |
| Go | `scratch` or `gcr.io/distroless/static` | ~2-15 MB |
| Rust | `scratch` or `gcr.io/distroless/cc` | ~2-20 MB |
| Java | `gcr.io/distroless/java21-debian12` | ~220 MB |
| General | `alpine:3.19` | ~7 MB |

## Good Examples
```dockerfile
# Node.js — distroless (no shell, no package manager)
FROM gcr.io/distroless/nodejs20-debian12
COPY --from=builder /app/dist ./dist
CMD ["dist/index.js"]

# Go — scratch (literally empty)
FROM scratch
COPY --from=builder /app/server /server
ENTRYPOINT ["/server"]

# Python — slim variant
FROM python:3.12-slim
# 150 MB vs 1 GB for full python:3.12
```

## Bad Examples
```dockerfile
# BAD: Full Ubuntu image (~77 MB base + packages)
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y nodejs
# Hundreds of unnecessary packages, dozens of CVEs

# BAD: Full Node.js image (~1.1 GB)
FROM node:20
# Includes: npm, yarn, git, build-essential, python3...
```

## Alpine vs Distroless vs Scratch
| Feature | Alpine | Distroless | Scratch |
|---------|--------|------------|---------|
| Shell access | Yes (ash) | No | No |
| Package manager | Yes (apk) | No | No |
| Debugging | Easy | Hard | Hardest |
| CVE surface | Small | Minimal | None |
| Best for | Dev/debug | Production | Static binaries |

## Enforcement
- Hadolint custom rules to flag ubuntu/debian base images in production
- CI policy to reject images over a size threshold
- Regular CVE scanning with Trivy to compare image variants
