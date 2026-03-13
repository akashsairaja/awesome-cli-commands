---
id: flux-bootstrap-cluster
stackId: flux
type: skill
name: Bootstrap Flux on a Kubernetes Cluster
description: >-
  Step-by-step guide to bootstrapping Flux CD on a Kubernetes cluster with
  GitHub, configuring source controllers, and deploying your first
  Kustomization.
difficulty: advanced
tags:
  - flux
  - bootstrap
  - kubernetes
  - cluster
  - deployment
  - ci-cd
  - machine-learning
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
  - question: "When should I use the Bootstrap Flux on a Kubernetes Cluster skill?"
    answer: >-
      Step-by-step guide to bootstrapping Flux CD on a Kubernetes cluster with
      GitHub, configuring source controllers, and deploying your first
      Kustomization. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Bootstrap Flux on a Kubernetes Cluster require?"
    answer: >-
      Requires kubectl installed. Works with flux projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Bootstrap Flux on a Kubernetes Cluster

## Overview
Bootstrapping Flux installs the GitOps toolkit controllers on your cluster and connects them to a Git repository. Once bootstrapped, Flux continuously reconciles cluster state with the manifests in Git — any change pushed to the repo is automatically applied.

## Why This Matters
- **Single source of truth** — all cluster state lives in Git
- **Auditability** — every change is a Git commit with author and timestamp
- **Disaster recovery** — re-bootstrap on a new cluster to restore everything
- **No kubectl apply** — developers push to Git, Flux handles deployment

## How It Works

### Step 1: Install the Flux CLI
```bash
# macOS
brew install fluxcd/tap/flux

# Linux
curl -s https://fluxcd.io/install.sh | sudo bash

# Verify installation
flux --version
```

### Step 2: Check Cluster Prerequisites
```bash
# Verify your cluster meets Flux requirements
flux check --pre

# Expected output:
# ► checking prerequisites
# ✔ Kubernetes 1.28.0 >=1.25.0-0
# ✔ prerequisites checks passed
```

### Step 3: Bootstrap with GitHub
```bash
# Export your GitHub personal access token
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Bootstrap Flux — creates the repo structure and installs controllers
flux bootstrap github \
  --owner=my-org \
  --repository=fleet-infra \
  --branch=main \
  --path=clusters/staging \
  --personal
```

### Step 4: Verify Controllers Are Running
```bash
# Check all Flux components
flux check

# List all Flux resources
flux get all

# Watch reconciliation status
flux get kustomizations --watch
```

### Step 5: Add Your First Application
```bash
# Create a GitRepository source pointing to your app repo
flux create source git my-app \
  --url=https://github.com/my-org/my-app \
  --branch=main \
  --interval=1m \
  --export > clusters/staging/my-app-source.yaml

# Create a Kustomization to deploy the app
flux create kustomization my-app \
  --source=GitRepository/my-app \
  --path="./deploy/staging" \
  --prune=true \
  --interval=5m \
  --health-check="Deployment/my-app.default" \
  --export > clusters/staging/my-app-kustomization.yaml

# Push to Git — Flux picks it up automatically
git add -A && git commit -m "feat: add my-app deployment"
git push
```

## Best Practices
- Use `--path` to separate cluster configs (clusters/staging, clusters/production)
- Always set `--prune=true` to garbage-collect removed resources
- Add health checks to detect failed deployments
- Export manifests to files (`--export`) instead of applying directly
- Use separate repos for infrastructure and application manifests

## Common Mistakes
- Bootstrapping without `--path` (all clusters share one directory)
- Forgetting to set `GITHUB_TOKEN` (bootstrap fails silently)
- Not checking prerequisites first (`flux check --pre`)
- Applying Flux manifests with kubectl instead of using `flux bootstrap`
- Missing `--prune=true` on Kustomizations (orphaned resources)
