---
id: cypress-ci-setup
stackId: cypress
type: skill
name: Cypress CI/CD Pipeline Configuration
description: >-
  Set up Cypress in CI/CD with GitHub Actions — parallel test execution, video
  recording, screenshot capture, and spec balancing for optimal build times.
difficulty: intermediate
tags:
  - cypress
  - cicd
  - pipeline
  - configuration
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
faq:
  - question: "When should I use the Cypress CI/CD Pipeline Configuration skill?"
    answer: >-
      Set up Cypress in CI/CD with GitHub Actions — parallel test execution,
      video recording, screenshot capture, and spec balancing for optimal
      build times. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Cypress CI/CD Pipeline Configuration require?"
    answer: >-
      Requires npm/yarn/pnpm, pip/poetry, Cypress installed. Works with
      cypress projects. Review the configuration section for project-specific
      setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Cypress CI/CD Pipeline Configuration

## Overview
Running Cypress in CI ensures every PR is validated with E2E tests. A properly configured pipeline starts the application, runs tests in parallel, captures artifacts on failure, and keeps build times under 10 minutes.

## How It Works

### Step 1: GitHub Actions Workflow
```yaml
# .github/workflows/cypress.yml
name: Cypress E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  cypress:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        containers: [1, 2, 3]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm start
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          record: true
          parallel: true
          group: 'E2E Tests'
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-screenshots-${{ matrix.containers }}
          path: cypress/screenshots/
          retention-days: 7

      - name: Upload videos
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: cypress-videos-${{ matrix.containers }}
          path: cypress/videos/
          retention-days: 3
```

### Step 2: Cypress Configuration for CI
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,    // CI retries
      openMode: 0,   // Local — no retries
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
  },
});
```

### Step 3: Optimize with Spec Balancing
```bash
# Use Cypress Cloud for automatic spec balancing
# Slow specs get distributed across containers
npx cypress run --record --parallel --group "E2E"
```

## Best Practices
- Use `wait-on` to ensure the app is ready before tests start
- Enable `retries: 2` in CI to handle infrastructure flakiness
- Upload screenshots on `failure()` and videos on `always()` conditions
- Use 3-4 parallel containers for suites with 50+ specs
- Cache `node_modules` and Cypress binary between runs
- Set `video: false` locally, `video: true` in CI to save disk space

## Common Mistakes
- Not waiting for the application to start (`wait-on` is essential)
- Running all tests sequentially (parallel cuts time by 60-75%)
- Not uploading artifacts — makes CI failures impossible to debug
- Setting timeout too low for CI environments (network is slower than local)
