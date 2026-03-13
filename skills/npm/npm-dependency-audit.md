---
id: npm-dependency-audit
stackId: npm
type: skill
name: >-
  NPM Dependency Auditing & Security
description: >-
  Audit npm dependencies for security vulnerabilities — npm audit workflows,
  automated fixing, CI/CD integration, and evaluating dependency health before
  adoption.
difficulty: advanced
tags:
  - npm
  - dependency
  - auditing
  - security
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
  - question: "When should I use the NPM Dependency Auditing & Security skill?"
    answer: >-
      Audit npm dependencies for security vulnerabilities — npm audit
      workflows, automated fixing, CI/CD integration, and evaluating
      dependency health before adoption. This skill provides a structured
      workflow for dependency management, monorepo architecture, script
      automation, and package publishing.
  - question: "What tools and setup does NPM Dependency Auditing & Security require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with npm/pnpm/yarn projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# NPM Dependency Auditing & Security

## Overview
Every npm dependency is a potential attack vector. Regular auditing, automated vulnerability checking in CI, and careful evaluation of new packages protect your application from supply chain attacks.

## Why This Matters
- **Supply chain attacks** — compromised packages affect millions of projects
- **Known vulnerabilities** — unpatched dependencies have published exploits
- **Compliance** — security audits are required for SOC2, HIPAA, PCI
- **Production safety** — one vulnerable dependency can expose user data

## Step 1: Run npm audit
```bash
# Check for vulnerabilities
npm audit

# See detailed report
npm audit --json

# Only show high and critical
npm audit --audit-level=high

# Auto-fix compatible vulnerabilities
npm audit fix

# Fix with major version updates (breaking changes possible)
npm audit fix --force  # Review changes carefully!
```

## Step 2: CI/CD Integration
```yaml
# GitHub Actions
- name: Security audit
  run: npm audit --audit-level=high
  # Fails the build if high/critical vulnerabilities exist

# Or use a dedicated action
- name: Audit
  uses: oke-py/npm-audit-action@v2
  with:
    audit_level: high
    production_flag: true
```

## Step 3: Evaluate Before Installing
```bash
# Check package health before adding
npm info <package> # View metadata, versions, maintainers
npm view <package> dependencies # Check dependency tree
npx bundlephobia <package> # Check bundle size impact

# Key questions:
# 1. Weekly downloads? (>10K = good adoption)
# 2. Last published? (>1 year = potentially unmaintained)
# 3. Open issues? (many unresolved = risk)
# 4. Dependencies? (fewer = less supply chain risk)
# 5. TypeScript types? (included or @types available?)
```

## Step 4: Lock File Security
```bash
# Always commit package-lock.json
# Use npm ci in CI/CD (installs from lock file exactly)
npm ci

# Verify lock file integrity
npm ci --ignore-scripts  # Skip postinstall scripts for safety
```

## Step 5: Override Vulnerable Transitive Dependencies
```json
{
  "overrides": {
    "vulnerable-package": ">=2.0.0"
  }
}
```

## Best Practices
- Run `npm audit` in every CI/CD pipeline
- Fail builds on high/critical vulnerabilities
- Update dependencies regularly (monthly minimum)
- Use `npm ci` (not `npm install`) in CI for reproducible builds
- Evaluate package health before adding new dependencies
- Use `overrides` for transitive dependency vulnerabilities
- Consider using Socket.dev or Snyk for deeper supply chain analysis

## Common Mistakes
- Ignoring npm audit warnings for months
- Running `npm audit fix --force` without reviewing changes
- Not committing package-lock.json (no reproducible builds)
- Adding heavy dependencies for trivial functionality
- Using deprecated packages without checking for alternatives
