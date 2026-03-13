---
id: snyk-ci-integration
stackId: snyk
type: skill
name: Snyk CI/CD Pipeline Integration
description: >-
  Integrate Snyk security scanning into CI/CD pipelines with GitHub Actions —
  dependency tests, container scans, and IaC checks with severity-based build
  gating.
difficulty: intermediate
tags:
  - snyk
  - cicd
  - pipeline
  - integration
  - security
  - ci-cd
  - docker
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Snyk CI/CD Pipeline Integration skill?"
    answer: >-
      Integrate Snyk security scanning into CI/CD pipelines with GitHub
      Actions — dependency tests, container scans, and IaC checks with
      severity-based build gating. This skill provides a structured workflow
      for dependency scanning, SAST analysis, container scanning, and
      vulnerability remediation.
  - question: "What tools and setup does Snyk CI/CD Pipeline Integration require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, Terraform CLI installed. Works with Snyk
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Snyk CI/CD Pipeline Integration

## Overview
Snyk in CI/CD creates automated security gates — every PR is tested for vulnerabilities in dependencies, containers, and IaC before merge. Severity-based thresholds prevent critical issues from reaching production.

## How It Works

### GitHub Actions Workflow
```yaml
# .github/workflows/snyk.yml
name: Snyk Security
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  snyk-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Snyk Open Source test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Snyk Container test
        uses: snyk/actions/docker@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          image: myapp:${{ github.sha }}
          args: --severity-threshold=high

      - name: Snyk IaC test
        uses: snyk/actions/iac@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

      - name: Monitor on main branch
        if: github.ref == 'refs/heads/main'
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          command: monitor
```

### CLI-Based Pipeline
```bash
# Install Snyk
npm install -g snyk

# Authenticate
snyk auth $SNYK_TOKEN

# Test dependencies (fail on HIGH+)
snyk test --severity-threshold=high

# Test container
snyk container test myapp:latest --severity-threshold=high

# Test IaC
snyk iac test ./terraform/ --severity-threshold=high

# Monitor on main branch
snyk monitor --project-name="myapp-${BRANCH_NAME}"
```

## Best Practices
- Use `--severity-threshold=high` in CI to avoid blocking on LOW/MEDIUM
- Run `snyk monitor` only on main branch (not on every PR)
- Upload SARIF results to GitHub Security tab for centralized tracking
- Use Snyk's GitHub integration for automatic PR checks
- Cache Snyk database for faster CI runs
- Separate dependency, container, and IaC scans for clear failure attribution

## Common Mistakes
- Using `--severity-threshold=low` in CI (blocks everything, causes fatigue)
- Not running `snyk monitor` on main (misses continuous vulnerability alerts)
- Storing SNYK_TOKEN in code instead of CI secrets
- Running Snyk without `npm ci` first (incomplete dependency tree)
