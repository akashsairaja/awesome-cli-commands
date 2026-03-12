---
id: snyk-dependency-scanning
stackId: snyk
type: skill
name: Dependency Vulnerability Scanning
description: >-
  Scan project dependencies for known vulnerabilities with Snyk Open Source —
  detect CVEs in npm, pip, Maven, Go, and other package ecosystems with
  remediation guidance.
difficulty: beginner
tags:
  - dependency-scanning
  - npm
  - vulnerabilities
  - open-source
  - snyk
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Snyk CLI installed
  - Snyk account
  - Project with package manager
faq:
  - question: How do I scan npm dependencies with Snyk?
    answer: >-
      Run 'snyk test' in your project directory. Snyk reads package-lock.json
      (or yarn.lock) and checks all dependencies against its vulnerability
      database. Use '--severity-threshold=high' to focus on actionable issues.
      Run 'snyk monitor' to enable continuous monitoring with alerts.
  - question: What is the difference between snyk test and snyk monitor?
    answer: >-
      snyk test runs a one-time scan and reports vulnerabilities immediately —
      use it in CI/CD. snyk monitor takes a snapshot of your dependencies and
      continuously watches for new vulnerabilities, sending alerts when new CVEs
      affect your project — use it on main branch.
  - question: Does Snyk scan transitive dependencies?
    answer: >-
      Yes. Snyk scans the entire dependency tree, including transitive
      (indirect) dependencies. Most vulnerabilities are in transitive
      dependencies that you did not explicitly install. Snyk shows the full
      dependency path so you know which direct dependency introduces the risk.
relatedItems:
  - snyk-fix-workflow
  - snyk-ci-integration
  - snyk-devsecops-engineer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Dependency Vulnerability Scanning

## Overview
Snyk Open Source scans your project's dependency tree for known vulnerabilities. It detects CVEs in direct and transitive dependencies, provides fix recommendations, and can automatically create pull requests with version bumps.

## How It Works

### Step 1: Authenticate and Test
```bash
# Authenticate with Snyk
snyk auth

# Test current project for vulnerabilities
snyk test

# Test with specific severity threshold
snyk test --severity-threshold=high

# Test a specific package manager file
snyk test --file=package-lock.json
snyk test --file=requirements.txt
snyk test --file=go.sum
```

### Step 2: Review Results
```bash
# Output shows:
# - Vulnerability name and CVE ID
# - Severity (CRITICAL, HIGH, MEDIUM, LOW)
# - Snyk priority score (1-1000)
# - Introduced through (dependency path)
# - Fix available (upgrade version or patch)

# JSON output for processing
snyk test --json > snyk-results.json

# SARIF for GitHub Security tab
snyk test --sarif > snyk.sarif
```

### Step 3: Monitor for New Vulnerabilities
```bash
# Take a snapshot for continuous monitoring
snyk monitor

# Monitor with project name
snyk monitor --project-name="my-api-backend"

# Monitor specific org
snyk monitor --org=my-team
```

### Step 4: Fix Vulnerabilities
```bash
# Interactive fix wizard
snyk fix

# Auto-fix with PR (when integrated with GitHub)
# Snyk creates PRs automatically for monitored projects

# Apply patches for vulnerabilities without upgrades
snyk protect
```

### Step 5: Check License Compliance
```bash
# Test for license issues alongside vulnerabilities
snyk test --show-vulnerable-paths=all

# The Snyk dashboard shows license information for all dependencies
```

## Best Practices
- Run `snyk test` in CI on every PR to catch new vulnerabilities
- Use `snyk monitor` on main branch for continuous tracking
- Review Snyk's automated fix PRs within 48 hours
- Set severity threshold in CI: `--severity-threshold=high`
- Check both direct and transitive dependencies
- Use `--all-projects` for monorepos with multiple package files

## Common Mistakes
- Only scanning direct dependencies (transitive deps have most vulnerabilities)
- Not monitoring projects after initial scan (new CVEs appear daily)
- Ignoring Snyk fix PRs (they contain tested, minimal changes)
- Testing only one package file in a monorepo (use --all-projects)
