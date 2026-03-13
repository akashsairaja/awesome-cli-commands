---
id: github-actions-workflow-ci
stackId: github
type: skill
name: Build a Production CI/CD Pipeline with GitHub Actions
description: >-
  Create a complete CI/CD pipeline with GitHub Actions — lint, test, build,
  and deploy with caching, matrix builds, environment protection rules, and
  reusable workflows.
difficulty: beginner
tags:
  - github
  - build
  - production
  - cicd
  - pipeline
  - actions
  - testing
  - deployment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Build a Production CI/CD Pipeline with GitHub Actions skill?"
    answer: >-
      Create a complete CI/CD pipeline with GitHub Actions — lint, test,
      build, and deploy with caching, matrix builds, environment protection
      rules, and reusable workflows. This skill provides a structured workflow
      for CI/CD workflows, PR automation, issue management, and repository
      configuration.
  - question: "What tools and setup does Build a Production CI/CD Pipeline with GitHub Actions require?"
    answer: >-
      Requires npm/yarn/pnpm, pip/poetry installed. Works with GitHub
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Build a Production CI/CD Pipeline with GitHub Actions

## Overview
A production-grade CI/CD pipeline on GitHub Actions goes beyond basic test-and-deploy. It includes dependency caching, parallel jobs, matrix testing, environment gates, concurrency management, and reusable workflows for multi-repo consistency.

## Why This Matters
- **Catch bugs early** — run tests on every push and PR
- **Deploy with confidence** — automated staging/production pipelines
- **Save money** — caching and concurrency reduce Actions minutes by 40-60%
- **Scale across repos** — reusable workflows eliminate duplication

## How It Works

### Step 1: Create the CI Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        if: matrix.node-version == 20
        with:
          name: coverage
          path: coverage/

  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

### Step 2: Add Deployment with Environment Protection
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  deploy-staging:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - run: npx vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-output
          path: dist/
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - run: npx vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Step 3: Create a Reusable Workflow
```yaml
# .github/workflows/reusable-ci.yml
name: Reusable CI

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
      run-e2e:
        type: boolean
        default: false
    secrets:
      NPM_TOKEN:
        required: false

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint && npm run typecheck
      - run: npm test
      - if: inputs.run-e2e
        run: npx playwright test
```

## Best Practices
- Use `concurrency` groups to cancel superseded runs on the same branch
- Cache dependencies with setup-node's built-in cache or actions/cache
- Set `timeout-minutes` on every job to prevent hung workflows
- Use `permissions: contents: read` as default, grant more only when needed
- Upload artifacts for build outputs shared between jobs
- Use environment protection rules for production deployments

## Common Mistakes
- Not using concurrency cancellation (wasting Actions minutes)
- Missing timeout-minutes (jobs can run indefinitely)
- Granting write-all permissions to GITHUB_TOKEN
- Not caching dependencies (rebuilding from scratch every run)
- Using `pull_request_target` when `pull_request` is sufficient
