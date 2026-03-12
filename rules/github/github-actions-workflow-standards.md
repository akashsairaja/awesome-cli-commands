---
id: github-actions-workflow-standards
stackId: github
type: rule
name: GitHub Actions Workflow Standards
description: >-
  Enforce security and performance standards for GitHub Actions workflows —
  SHA-pinned actions, least-privilege permissions, timeouts, concurrency, and
  caching requirements.
difficulty: intermediate
globs:
  - '**/.github/workflows/*.yml'
  - '**/.github/workflows/*.yaml'
tags:
  - github-actions
  - workflow
  - security
  - performance
  - standards
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: What are the essential standards for GitHub Actions workflows?
    answer: >-
      Every workflow should: pin actions to SHA (not tags), set permissions to
      least-privilege, include timeout-minutes on all jobs, use concurrency
      groups to cancel redundant runs, cache dependencies, and use path filters
      to skip irrelevant workflow runs.
  - question: How do I validate GitHub Actions workflows locally?
    answer: >-
      Use actionlint — a static checker for GitHub Actions workflow files. It
      validates syntax, checks for common mistakes, verifies action references,
      and catches security issues. Install with 'brew install actionlint' and
      run 'actionlint' in your repo root.
relatedItems:
  - github-actions-architect
  - github-actions-security
  - github-branch-protection-rules
version: 1.0.0
lastUpdated: '2026-03-11'
---

# GitHub Actions Workflow Standards

## Rule
All GitHub Actions workflows MUST follow these security and performance requirements.

## Format
```yaml
name: Descriptive Workflow Name

on:
  <trigger>:
    branches: [main]

concurrency:
  group: <workflow>-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  <job-name>:
    runs-on: ubuntu-latest
    timeout-minutes: <limit>
    steps:
      - uses: <owner>/<repo>@<full-sha> # vX.Y.Z
```

## Requirements

### Security
- Pin ALL third-party actions to full SHA (not tags)
- Set `permissions: contents: read` at workflow level
- Grant additional permissions per-job only when needed
- Never use `pull_request_target` with PR code checkout
- Store secrets in GitHub Secrets, never in workflow files
- Use OIDC for cloud provider authentication when available

### Performance
- Set `timeout-minutes` on every job
- Use `concurrency` groups with `cancel-in-progress: true`
- Cache dependencies using setup-*/cache actions
- Use `paths` filter to skip irrelevant workflows

### Naming
- Workflow file: kebab-case (`deploy-production.yml`)
- Workflow name: Title Case (`Deploy Production`)
- Job names: kebab-case (`build-and-test`)
- Step names: Sentence case (`Install dependencies`)

## Examples

### Good
```yaml
name: CI

on:
  pull_request:
    branches: [main]
    paths:
      - 'src/**'
      - 'package.json'

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@a5ac7e51b41094c92402da3b24376905380afc29 # v4.1.7
      - uses: actions/setup-node@60edb5dd545a775178f52524783378180af0d1f8 # v4.0.2
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

### Bad
```yaml
name: test
on: push
# No permissions block (defaults to write-all)
# No concurrency (wastes Actions minutes)
jobs:
  test:
    runs-on: ubuntu-latest
    # No timeout (can run forever)
    steps:
      - uses: actions/checkout@v4  # Tag, not SHA
      - run: npm install  # No caching
      - run: npm test
```

## Enforcement
Use actionlint for local validation and add it as a CI check.
Configure organization-level policies to restrict allowed Actions.
