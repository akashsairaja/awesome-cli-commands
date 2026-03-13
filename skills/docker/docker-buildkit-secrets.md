---
id: docker-buildkit-secrets
stackId: docker
type: skill
name: >-
  BuildKit Secrets & Build Arguments
description: >-
  Securely pass credentials during Docker builds using BuildKit secrets —
  access private registries, clone private repos, and configure APIs without
  leaking secrets into image layers.
difficulty: advanced
tags:
  - docker
  - buildkit
  - secrets
  - build
  - arguments
  - security
  - api
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the BuildKit Secrets & Build Arguments skill?"
    answer: >-
      Securely pass credentials during Docker builds using BuildKit secrets —
      access private registries, clone private repos, and configure APIs
      without leaking secrets into image layers. This skill provides a
      structured workflow for image optimization, multi-stage builds,
      networking, and container orchestration.
  - question: "What tools and setup does BuildKit Secrets & Build Arguments require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, pip/poetry installed. Works with Docker
      projects. No additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# BuildKit Secrets & Build Arguments

## Overview
Docker build often requires credentials — npm tokens for private packages, SSH keys for private repos, API keys for build-time operations. BuildKit secrets mount credentials temporarily during build without persisting them in any image layer.

## Why This Matters
- **ARG and ENV leak into image history** — anyone with the image can extract them
- **BuildKit secrets are ephemeral** — mounted only during the RUN command, never in layers
- **SSH agent forwarding** — clone private repos without copying SSH keys into the image
- **Compliance** — secrets in image layers fail security audits

## The Problem with ARG/ENV
```dockerfile
# DANGEROUS: Secret is visible in image history
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
RUN npm ci
RUN rm .npmrc  # Too late — it's already in a cached layer!
```

```bash
# Anyone can extract the token:
docker history myapp --no-trunc | grep NPM_TOKEN
```

## Step 1: Use BuildKit Secrets
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
# Build with secret
DOCKER_BUILDKIT=1 docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  -t myapp .
```

## Step 2: SSH Agent Forwarding for Private Repos
```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.22 AS builder
WORKDIR /app
RUN --mount=type=ssh git clone git@github.com:myorg/private-lib.git
COPY . .
RUN go build -o server .
```

```bash
# Build with SSH forwarding
eval $(ssh-agent) && ssh-add ~/.ssh/id_ed25519
docker build --ssh default -t myapp .
```

## Step 3: Multiple Secrets
```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=secret,id=pip_conf,target=/etc/pip.conf \
    --mount=type=secret,id=aws_creds,target=/root/.aws/credentials \
    pip install -r requirements.txt
COPY . .
```

```bash
docker build \
  --secret id=pip_conf,src=$HOME/.pip/pip.conf \
  --secret id=aws_creds,src=$HOME/.aws/credentials \
  -t myapp .
```

## Step 4: Docker Compose with Secrets
```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      secrets:
        - npmrc
    secrets:
      - db_password

secrets:
  npmrc:
    file: ./.npmrc
  db_password:
    file: ./secrets/db_password.txt
```

## Best Practices
- Always use `# syntax=docker/dockerfile:1` at the top for BuildKit features
- Never use ARG or ENV for secrets — they persist in image metadata
- Use SSH agent forwarding instead of copying SSH keys
- Verify secrets are not in layers: `docker history --no-trunc`
- In CI, pass secrets from environment: `--secret id=token,env=NPM_TOKEN`

## Common Mistakes
- Using ARG for tokens (visible in docker history)
- Copying secret files and deleting in a later layer (still in earlier layer)
- Not enabling BuildKit (DOCKER_BUILDKIT=1 or Docker 23+ default)
- Forgetting the `# syntax=docker/dockerfile:1` directive
