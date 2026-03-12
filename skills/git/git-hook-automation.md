---
id: git-hook-automation
stackId: git
type: skill
name: Git Hooks & Pre-Commit Automation
description: >-
  Automate code quality checks with Git hooks — run linters, formatters, tests,
  and security scans automatically before every commit and push.
difficulty: intermediate
tags:
  - hooks
  - pre-commit
  - husky
  - lefthook
  - lint-staged
  - automation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Git 2.30+
  - Node.js (for husky/lint-staged) or Python (for pre-commit framework)
faq:
  - question: What are Git hooks and why should I use them?
    answer: >-
      Git hooks are scripts that run automatically at key points in your Git
      workflow — before commits, after merges, before pushes. They automate code
      quality checks like linting, formatting, testing, and secret scanning,
      catching issues before they reach the repository.
  - question: 'Which Git hook tool should I use — Husky, Lefthook, or pre-commit?'
    answer: >-
      Use Husky for Node.js/JavaScript projects (most popular, integrates with
      lint-staged). Use Lefthook for polyglot projects (faster,
      language-agnostic, parallel execution). Use the pre-commit framework for
      Python projects (large ecosystem of community hooks).
  - question: How do I keep Git hooks fast so developers don't skip them?
    answer: >-
      Three rules: (1) Use lint-staged to check only staged files, not the
      entire codebase. (2) Keep pre-commit hooks under 10 seconds — move slow
      checks to pre-push or CI. (3) Run checks in parallel when possible
      (Lefthook supports this natively).
relatedItems:
  - git-commit-conventions
  - git-trunk-based-development
  - lefthook-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Git Hooks & Pre-Commit Automation

## Overview
Git hooks are scripts that run automatically at key points in the Git workflow. Use them to enforce code quality, run tests, scan for secrets, and format code — catching issues before they reach the repository.

## Available Hooks
| Hook | When It Runs | Common Use |
|------|-------------|-----------|
| `pre-commit` | Before commit is created | Lint, format, type-check |
| `commit-msg` | After message is written | Validate commit message format |
| `pre-push` | Before push to remote | Run tests, security scan |
| `prepare-commit-msg` | Before editor opens | Add issue number to message |
| `post-merge` | After merge completes | Install dependencies |

## Setup with Husky (Node.js Projects)
```bash
# Install husky
npm install -D husky
npx husky init

# Pre-commit: lint and format staged files
echo 'npx lint-staged' > .husky/pre-commit

# Commit-msg: enforce conventional commits
echo 'npx --no -- commitlint --edit $1' > .husky/commit-msg

# Pre-push: run tests
echo 'npm test' > .husky/pre-push
```

## Setup with Lefthook (Any Language)
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{js,ts,tsx,json,md}"
      run: npx prettier --check {staged_files}
    secrets:
      run: gitleaks protect --staged

commit-msg:
  commands:
    validate:
      run: npx commitlint --edit {1}

pre-push:
  commands:
    test:
      run: npm test
    typecheck:
      run: npx tsc --noEmit
```

## Setup with pre-commit Framework (Python)
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 24.3.0
    hooks:
      - id: black

  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

## Best Practices
- Run hooks on STAGED files only (not all files) for speed
- Use `lint-staged` to target only changed files
- Keep pre-commit hooks fast (< 10 seconds)
- Move slow checks (full test suite) to pre-push or CI
- Always include secret scanning (gitleaks, detect-secrets)
- Share hook configuration via config files (not .git/hooks/)
- Never skip hooks with --no-verify in normal workflow

## Common Mistakes
- Installing hooks in .git/hooks/ (not shareable with team)
- Running full test suite in pre-commit (too slow, people skip)
- Not using lint-staged (checking all files instead of staged)
- Forgetting to install hooks after cloning (add to package.json scripts)
