---
id: bruno-ci-runner
stackId: bruno
type: skill
name: Bruno CLI Runner for CI/CD
description: >-
  Run Bruno collections in CI/CD pipelines with the CLI runner — environment
  selection, JUnit output, exit codes for build gating, and GitHub Actions
  integration.
difficulty: beginner
tags:
  - bruno
  - cli
  - runner
  - cicd
  - testing
  - deployment
  - debugging
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Bruno CLI Runner for CI/CD skill?"
    answer: >-
      Run Bruno collections in CI/CD pipelines with the CLI runner —
      environment selection, JUnit output, exit codes for build gating, and
      GitHub Actions integration. This skill provides a structured workflow
      for development tasks.
  - question: "What tools and setup does Bruno CLI Runner for CI/CD require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, pip/poetry installed. Works with bruno
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Bruno CLI Runner for CI/CD

## Overview
Bruno CLI runs collections from the command line, enabling automated API testing in CI/CD pipelines. Configure environments, capture JUnit results, and use exit codes to gate deployments on API test success.

## How It Works

### Basic CLI Usage
```bash
# Run entire collection
npx @usebruno/cli run --env dev

# Run specific folder
npx @usebruno/cli run --folder Auth --env dev

# Run specific request
npx @usebruno/cli run --file Auth/Login.bru --env dev
```

### CI Output Formats
```bash
# JUnit XML for CI dashboards
npx @usebruno/cli run --env staging --output junit --output-file results.xml

# JSON output for processing
npx @usebruno/cli run --env staging --output json > results.json
```

### GitHub Actions Workflow
```yaml
# .github/workflows/api-tests.yml
name: API Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  api-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Start API server
        run: docker compose up -d

      - name: Wait for API
        run: |
          for i in $(seq 1 30); do
            curl -s http://localhost:3000/health && break
            sleep 2
          done

      - name: Install Bruno CLI
        run: npm install -g @usebruno/cli

      - name: Run API tests
        run: |
          cd api-tests
          bru run --env ci --output junit --output-file ../results.xml

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: api-test-results
          path: results.xml

      - name: Stop API server
        if: always()
        run: docker compose down
```

### Environment Variables in CI
```bash
# Pass secrets via CLI environment variables
bru run --env ci \
  --env-var "API_TOKEN=${{ secrets.API_TOKEN }}" \
  --env-var "BASE_URL=http://localhost:3000"
```

## Best Practices
- Use a dedicated CI environment with appropriate base URLs
- Pass secrets via --env-var, not committed environment files
- Output JUnit XML for CI dashboard integration
- Start the API server in the same workflow (Docker Compose)
- Run the full collection, not just individual requests
- Upload results as artifacts for debugging failures

## Common Mistakes
- Committing environment files with real credentials
- Not starting the API server before running tests
- Not waiting for the API to be healthy before testing
- Missing --output flag (no machine-readable results for CI)
