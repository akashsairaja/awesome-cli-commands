---
id: lefthook-hook-placement
stackId: lefthook
type: rule
name: Check Placement by Hook Stage
description: >-
  Define which checks belong in pre-commit vs pre-push — fast checks (lint,
  format, secrets) in pre-commit, slow checks (tests, typecheck, build) in
  pre-push.
difficulty: beginner
globs:
  - '**/lefthook.yml'
  - '**/lefthook-local.yml'
tags:
  - hook-stages
  - pre-commit
  - pre-push
  - performance
  - lefthook
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
  - question: Should I run tests in Lefthook pre-commit hooks?
    answer: >-
      No. Tests typically take 10-60 seconds and need the full project context
      (not just staged files). Put tests in pre-push hooks, which run less
      frequently and have a higher time budget. Pre-commit hooks should stay
      under 10 seconds.
  - question: What checks belong in pre-commit vs pre-push?
    answer: >-
      Pre-commit: fast checks on staged files — linting (1-3s), formatting
      (1-2s), secrets scanning (1-2s). Pre-push: slower checks on the full
      project — test suite (10-60s), type checking (5-30s), build verification
      (10-60s). E2E tests belong in CI only.
relatedItems:
  - lefthook-parallel-execution
  - lefthook-staged-files-only
  - lefthook-hook-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Check Placement by Hook Stage

## Rule
Checks MUST be placed in the appropriate hook stage based on execution time. Pre-commit is for fast checks (< 10s). Pre-push is for slow checks (< 60s). Tests go in pre-push, never pre-commit.

## Check Placement Guide
| Check | Hook Stage | Typical Time | Reason |
|-------|-----------|-------------|--------|
| ESLint / Ruff | pre-commit | 1-3s | Fast, staged files only |
| Prettier / Black | pre-commit | 1-2s | Fast formatting check |
| Gitleaks / secrets | pre-commit | 1-2s | Security, must not be skipped |
| Commitlint | commit-msg | < 1s | Message validation |
| Jest / Pytest | pre-push | 10-60s | Too slow for pre-commit |
| tsc --noEmit | pre-push | 5-30s | Needs full project |
| npm run build | pre-push | 10-60s | Full build verification |
| E2E tests | CI only | 2-10min | Too slow for any hook |

## Configuration
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{ts,tsx,json,md}"
      run: npx prettier --check {staged_files}
    secrets:
      run: gitleaks protect --staged --no-banner

commit-msg:
  commands:
    validate:
      run: npx commitlint --edit {1}

pre-push:
  parallel: true
  commands:
    test:
      run: npm test -- --passWithNoTests
    typecheck:
      run: npx tsc --noEmit
    build:
      run: npm run build
```

## Anti-Patterns
- Running `npm test` in pre-commit (30+ second hooks get skipped)
- Running `tsc --noEmit` in pre-commit (needs full project context)
- Running E2E tests in any hook (too slow, use CI)
- Putting formatting checks in pre-push (should give immediate feedback)
- Not having any pre-push checks (tests never run before push)
