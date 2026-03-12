---
id: hurl-ci-integration
stackId: hurl
type: skill
name: Hurl CI/CD Pipeline Integration
description: >-
  Integrate Hurl API tests into CI/CD pipelines with GitHub Actions — test
  execution, JUnit reporting, variable injection, and parallel test execution
  for automated API validation.
difficulty: intermediate
tags:
  - ci-cd
  - github-actions
  - junit
  - pipeline
  - hurl
  - automation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Hurl installed
  - GitHub Actions or equivalent CI
  - API server (Docker recommended)
faq:
  - question: How do I run Hurl tests in GitHub Actions?
    answer: >-
      Install Hurl from the .deb package, start your API with Docker Compose,
      wait for the health endpoint, then run 'hurl --test --report-junit
      results.xml tests/*.hurl'. Upload results.xml as an artifact. Hurl exits
      with non-zero code on assertion failures.
  - question: Can Hurl tests run in parallel in CI?
    answer: >-
      Yes. Since each .hurl file is independent, use xargs -P to run multiple
      files simultaneously: 'ls tests/*.hurl | xargs -P 4 -I {} hurl --test {}'.
      This cuts execution time for large test suites proportionally to the
      parallelism level.
  - question: What output formats does Hurl support for CI?
    answer: >-
      Hurl supports JUnit XML (--report-junit), HTML reports (--report-html),
      and JSON output (--json). JUnit XML integrates with GitHub Actions, GitLab
      CI, and Jenkins dashboards. HTML reports are useful for human-readable
      test summaries.
relatedItems:
  - hurl-test-patterns
  - hurl-captures-chains
  - hurl-http-testing-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Hurl CI/CD Pipeline Integration

## Overview
Hurl in CI/CD validates API behavior on every commit. Its lightweight binary, plain-text test files, and JUnit output make it ideal for CI integration — no heavy dependencies, fast startup, and clear reporting.

## How It Works

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
  hurl-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start API
        run: docker compose up -d

      - name: Wait for API
        run: |
          for i in $(seq 1 30); do
            curl -sf http://localhost:3000/health && break
            sleep 2
          done

      - name: Install Hurl
        run: |
          curl -sL https://github.com/Orange-OpenSource/hurl/releases/latest/download/hurl_amd64.deb -o hurl.deb
          sudo dpkg -i hurl.deb

      - name: Run API tests
        run: |
          hurl --test \
            --variable base_url=http://localhost:3000 \
            --report-junit results.xml \
            tests/api/*.hurl

      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: hurl-results
          path: results.xml

      - name: Stop API
        if: always()
        run: docker compose down
```

### Parallel Test Execution
```bash
# Run tests in parallel (independent test files)
ls tests/api/*.hurl | xargs -P 4 -I {} hurl --test \
  --variable base_url=http://localhost:3000 {}
```

### Reporting Options
```bash
# JUnit XML for CI dashboards
hurl --test --report-junit results.xml tests/*.hurl

# HTML report
hurl --test --report-html report/ tests/*.hurl

# JSON output
hurl --test --json tests/*.hurl > results.json
```

## Best Practices
- Install Hurl from the official .deb package for fastest CI setup
- Use --variable for all environment-specific values
- Output JUnit XML for CI dashboard integration
- Start the API server and wait for health check before running tests
- Upload test results as artifacts for debugging
- Run independent test files in parallel for faster execution

## Common Mistakes
- Not starting the API server before Hurl runs
- Hardcoded localhost URLs in .hurl files (use --variable)
- Not outputting JUnit/HTML reports (no visibility into failures)
- Running all tests sequentially when they could be parallelized
