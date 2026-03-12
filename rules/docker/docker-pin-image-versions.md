---
id: docker-pin-image-versions
stackId: docker
type: rule
name: Pin Docker Image Versions
description: >-
  Always pin base image versions with exact tags or SHA256 digests — prevent
  supply chain attacks, ensure reproducible builds, and avoid unexpected
  breaking changes.
difficulty: beginner
globs:
  - '**/Dockerfile*'
  - '**/.hadolint.yaml'
  - '**/docker-compose*.yml'
tags:
  - image-pinning
  - supply-chain
  - reproducibility
  - docker-security
  - version-pinning
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
  - question: Why should I pin Docker image versions instead of using latest?
    answer: >-
      The 'latest' tag is mutable — it changes every time the publisher releases
      a new version. This means builds are not reproducible, and a new upstream
      release could introduce breaking changes or vulnerabilities. Pinning to
      specific version tags or SHA256 digests ensures every build uses the exact
      same base image.
  - question: What is the difference between a Docker image tag and a digest?
    answer: >-
      A tag (like node:20.11.1) is a mutable label — the publisher can update
      what it points to. A digest (sha256:abc123...) is an immutable hash of the
      image content. Even if a tag is updated, a pinned digest always resolves
      to the exact same image bytes, preventing supply chain tampering.
relatedItems:
  - docker-non-root-containers
  - docker-minimal-base-images
  - docker-multi-stage-builds
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Pin Docker Image Versions

## Rule
Every FROM statement MUST use a specific version tag. Never use `latest`. For maximum security, pin to SHA256 digests.

## Format
```dockerfile
# Minimum: Use specific version tag
FROM node:20.11.1-slim

# Best: Pin to SHA256 digest
FROM node:20.11.1-slim@sha256:abc123...

# Acceptable: Major.minor version (auto-patches)
FROM node:20.11-slim
```

## Good Examples
```dockerfile
# Pinned tag
FROM node:20.11.1-slim
FROM python:3.12.2-slim
FROM golang:1.22.1-alpine
FROM postgres:16.2-alpine
FROM nginx:1.25.4-alpine

# Pinned digest (most secure)
FROM node:20.11.1-slim@sha256:a1b2c3d4...
```

## Bad Examples
```dockerfile
# NEVER use latest (what version? unknown!)
FROM node:latest
FROM python
FROM ubuntu:latest

# AVOID unpinned major versions (could get 20.x or 22.x)
FROM node:lts
FROM python:3
```

## Why Digests Matter
```bash
# Tags are MUTABLE — the publisher can update what node:20.11.1 points to
# Digests are IMMUTABLE — they are a hash of the exact image content

# Get the digest for an image
docker inspect --format='{{index .RepoDigests 0}}' node:20.11.1-slim

# Use Renovate or Dependabot to auto-update pinned versions
```

## Automation
```yaml
# renovate.json — auto-update Docker image versions
{
  "extends": ["config:base"],
  "docker": {
    "pinDigests": true
  }
}
```

## Enforcement
- Use Hadolint rule DL3007 to flag `latest` tags
- Configure CI to reject Dockerfiles with unpinned images
- Use Renovate or Dependabot for automated version updates
