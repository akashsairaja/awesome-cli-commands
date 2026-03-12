---
id: docker-buildkit-secrets
stackId: docker
type: skill
name: BuildKit Secrets & Build Arguments
description: >-
  Securely pass credentials during Docker builds using BuildKit secrets — access
  private registries, clone private repos, and configure APIs without leaking
  secrets into image layers.
difficulty: advanced
tags:
  - buildkit
  - secrets
  - docker-security
  - ssh-forwarding
  - credentials
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
prerequisites:
  - Docker 24+ with BuildKit
  - Understanding of Docker image layers
faq:
  - question: How do I securely pass secrets during Docker build?
    answer: >-
      Use BuildKit secrets with '--mount=type=secret' in your Dockerfile.
      Secrets are mounted only during the RUN command and never persist in image
      layers. Build with 'docker build --secret id=mysecret,src=./secret.txt'.
      Never use ARG or ENV for credentials — they are visible in docker history.
  - question: Why is using ARG for Docker build secrets dangerous?
    answer: >-
      ARG values are saved in the image metadata and can be extracted by anyone
      with access to the image using 'docker history --no-trunc'. Even if you
      delete a file created with an ARG in a later layer, the ARG value itself
      remains in the build history. BuildKit secrets solve this completely.
  - question: How do I clone private Git repos during Docker build?
    answer: >-
      Use BuildKit SSH agent forwarding: add '--mount=type=ssh' to the RUN
      command in your Dockerfile, then build with 'docker build --ssh default'.
      This forwards your local SSH agent into the build without copying any keys
      into the image.
relatedItems:
  - docker-multi-stage-builds
  - docker-security-hardener
version: 1.0.0
lastUpdated: '2026-03-11'
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
