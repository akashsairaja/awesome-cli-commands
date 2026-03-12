---
id: vercel-monorepo-setup
stackId: vercel
type: skill
name: Deploy Monorepos on Vercel with Turborepo
description: >-
  Configure monorepo deployments on Vercel with Turborepo — remote caching,
  ignored build steps, root directory settings, and shared package management.
difficulty: intermediate
tags:
  - monorepo
  - turborepo
  - build-optimization
  - remote-caching
  - deployment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Monorepo with Turborepo
  - Vercel account
  - pnpm/npm/yarn workspaces
faq:
  - question: How do I deploy a monorepo on Vercel?
    answer: >-
      Create a separate Vercel project for each deployable app. Set each
      project's Root Directory to the app subdirectory (e.g., apps/web).
      Configure turbo-ignore as the Ignored Build Step to skip rebuilds when the
      app hasn't changed. Enable Turborepo Remote Caching for shared build
      artifacts.
  - question: What is turbo-ignore and why do I need it?
    answer: >-
      turbo-ignore is a Turborepo command that checks if a specific app or its
      dependencies changed since the last deployment. Used as Vercel's Ignored
      Build Step, it prevents unnecessary rebuilds — saving build minutes and
      deployment time in monorepos.
  - question: How does Turborepo Remote Caching work with Vercel?
    answer: >-
      Turborepo Remote Caching stores build outputs (compiled code, type-check
      results) in Vercel's cloud. When the same inputs are detected on any
      machine — local dev, CI, or Vercel — the cached output is downloaded
      instead of rebuilding. This can reduce build times by 40-80%.
relatedItems:
  - vercel-deployment-architect
  - vercel-isr-configuration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Deploy Monorepos on Vercel with Turborepo

## Overview
Monorepo deployments on Vercel require special configuration to avoid rebuilding unchanged apps, share build caches, and manage environment variables per app. Turborepo integration enables remote caching for 10x faster builds.

## Why This Matters
- **Build efficiency** — only rebuild apps that changed
- **Remote caching** — shared build cache across team and CI
- **Consistent deploys** — shared packages stay in sync
- **Cost savings** — reduced build minutes with proper caching

## How It Works

### Step 1: Monorepo Structure
```
my-monorepo/
  apps/
    web/           # Next.js app (deployed to Vercel)
    docs/          # Docs site (deployed to Vercel)
    api/           # API server (deployed elsewhere)
  packages/
    ui/            # Shared UI components
    config/        # Shared config (eslint, tsconfig)
    utils/         # Shared utilities
  turbo.json
  package.json
```

### Step 2: Configure turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Step 3: Configure Vercel Projects
```bash
# For each app, set the root directory in Vercel project settings
# web app: Root Directory = apps/web
# docs app: Root Directory = apps/docs
```

### Step 4: Ignored Build Step
```bash
# apps/web/vercel-ignore.sh
#!/bin/bash
# Only build if web app or shared packages changed
npx turbo-ignore web
```

```json
// In Vercel project settings, or vercel.json:
{
  "ignoreCommand": "npx turbo-ignore web"
}
```

### Step 5: Enable Remote Caching
```bash
# Link Turborepo to Vercel for remote caching
npx turbo login
npx turbo link

# Remote cache is now shared between local dev and Vercel CI
```

## Best Practices
- Use `turbo-ignore` to skip unchanged app builds
- Enable Turborepo Remote Caching for shared build artifacts
- Set Root Directory per Vercel project to the app subdirectory
- Share environment variables at the team level for common secrets
- Use workspace dependencies (`"ui": "workspace:*"`) for shared packages
- Configure separate Vercel projects for each deployable app

## Common Mistakes
- Not configuring Ignored Build Step (every commit rebuilds every app)
- Setting Root Directory to repository root instead of app directory
- Not enabling Remote Caching (losing build cache between deployments)
- Forgetting to include shared package outputs in turbo.json
- Environment variables set on wrong Vercel project in monorepo
