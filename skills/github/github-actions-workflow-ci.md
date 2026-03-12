---
id: github-actions-workflow-ci
stackId: github
type: skill
name: Build a Production CI/CD Pipeline with GitHub Actions
description: >-
  Create a complete CI/CD pipeline with GitHub Actions — lint, test, build, and
  deploy with caching, matrix builds, environment protection rules, and reusable
  workflows.
difficulty: intermediate
tags:
  - github-actions
  - ci-cd
  - pipeline
  - deployment
  - reusable-workflows
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - GitHub repository
  - Node.js project (examples use npm)
  - Basic YAML knowledge
faq:
  - question: How do I set up a CI/CD pipeline with GitHub Actions?
    answer: >-
      Create a .github/workflows/ci.yml file that triggers on push and
      pull_request events. Define jobs for linting, testing, building, and
      deploying. Use concurrency groups for efficiency, cache dependencies, and
      add environment protection rules for production deployments.
  - question: What are reusable workflows in GitHub Actions?
    answer: >-
      Reusable workflows use the workflow_call trigger to create shared CI/CD
      templates. Other workflows call them with 'uses:
      org/repo/.github/workflows/reusable.yml@main'. They accept inputs and
      secrets, eliminating duplication across multiple repositories.
  - question: How do I reduce GitHub Actions minutes usage?
    answer: >-
      Four key strategies: (1) Cache dependencies with actions/cache or built-in
      package manager caching. (2) Use concurrency groups with
      cancel-in-progress to stop superseded runs. (3) Split fast checks (lint)
      from slow checks (e2e) so PRs fail fast. (4) Use path filters to skip
      irrelevant workflows.
relatedItems:
  - github-actions-architect
  - github-codeowners-setup
  - github-dependabot-config
version: 1.0.0
lastUpdated: '2026-03-11'
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
