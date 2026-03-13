---
id: playwright-ci-pipeline
stackId: playwright
type: skill
name: Playwright CI/CD Pipeline Setup
description: >-
  Configure Playwright tests in CI/CD pipelines with GitHub Actions — parallel
  execution, artifact collection, sharding, and trace uploads for debugging
  failures.
difficulty: intermediate
tags:
  - playwright
  - cicd
  - pipeline
  - setup
  - deployment
  - ci-cd
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Playwright CI/CD Pipeline Setup skill?"
    answer: >-
      Configure Playwright tests in CI/CD pipelines with GitHub Actions —
      parallel execution, artifact collection, sharding, and trace uploads for
      debugging failures. This skill provides a structured workflow for
      end-to-end testing, visual regression, API testing, and CI/CD
      integration.
  - question: "What tools and setup does Playwright CI/CD Pipeline Setup require?"
    answer: >-
      Requires npm/yarn/pnpm, pip/poetry, Playwright installed. Works with
      Playwright projects. Review the configuration section for
      project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Playwright CI/CD Pipeline Setup

## Overview
Running Playwright tests in CI/CD catches regressions before deployment. A properly configured pipeline runs tests in parallel across browsers, collects traces for failed tests, and provides clear reports — all within reasonable build times.

## How It Works

### Step 1: Configure playwright.config.ts for CI
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html']],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 2: GitHub Actions Workflow
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test --shard=${{ matrix.shard }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: playwright-report/
          retention-days: 14

      - name: Upload traces
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: traces-${{ strategy.job-index }}
          path: test-results/
          retention-days: 7
```

### Step 3: Merge Sharded Reports
```yaml
  merge-reports:
    if: always()
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Download all reports
        uses: actions/download-artifact@v4
        with:
          pattern: playwright-report-*
          path: all-reports

      - name: Merge reports
        run: npx playwright merge-reports --reporter=html all-reports

      - name: Upload merged report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report-merged
          path: playwright-report/
```

## Best Practices
- Use sharding to split tests across parallel CI jobs (4 shards cuts time by ~75%)
- Set `retries: 2` in CI to handle infrastructure flakiness
- Collect traces only on first retry (`trace: 'on-first-retry'`) to save storage
- Upload artifacts on `failure()` condition for debugging
- Use `forbidOnly: true` in CI to prevent `.only` from silently skipping tests
- Cache Playwright browsers with `actions/cache` for faster installs

## Common Mistakes
- Not installing browser dependencies (`--with-deps` flag)
- Running tests sequentially instead of using sharding
- Forgetting to upload artifacts — makes CI failures impossible to debug
- Not setting timeouts — tests hang indefinitely on infrastructure issues
- Using `retries` in local development (masks real failures)
