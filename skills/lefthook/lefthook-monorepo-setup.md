---
id: lefthook-monorepo-setup
stackId: lefthook
type: skill
name: Monorepo Hook Configuration
description: >-
  Configure Lefthook for monorepo projects with multiple languages and packages
  — root-scoped commands, per-package hooks, and selective execution based on
  changed directories.
difficulty: intermediate
tags:
  - monorepo
  - multi-package
  - polyglot
  - root-scoping
  - lefthook
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Lefthook installed
  - Monorepo with multiple packages
faq:
  - question: How do I configure Lefthook for a monorepo?
    answer: >-
      Use the 'root' directive to scope commands to specific package
      directories. Each command gets its own root, glob, and run configuration.
      Use parallel: true to run all package checks simultaneously. Files are
      filtered relative to the root directory.
  - question: Does Lefthook only check changed files in a monorepo?
    answer: >-
      Yes, when you use {staged_files} with the root directive. Lefthook filters
      staged files to those matching the glob pattern within the root directory.
      If no matching files are staged in a package, that command is skipped
      entirely.
  - question: Can individual developers customize Lefthook hooks?
    answer: >-
      Yes. Create lefthook-local.yml (add it to .gitignore) for personal
      overrides. Developers can skip specific commands, add debugging flags, or
      adjust timeouts without affecting the team's shared configuration.
relatedItems:
  - lefthook-config-patterns
  - lefthook-remote-hooks
  - lefthook-hook-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Monorepo Hook Configuration

## Overview
Monorepos contain multiple packages, often in different languages. Lefthook's root filtering and glob patterns let you run the right tool for each package — TypeScript linting for the frontend, Python linting for the backend — without checking unrelated files.

## How It Works

### Package-Scoped Commands
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    frontend-lint:
      root: "packages/frontend/"
      glob: "*.{ts,tsx}"
      run: cd packages/frontend && npx eslint {staged_files}

    frontend-format:
      root: "packages/frontend/"
      glob: "*.{ts,tsx,css,json}"
      run: cd packages/frontend && npx prettier --check {staged_files}

    backend-lint:
      root: "packages/backend/"
      glob: "*.py"
      run: cd packages/backend && ruff check {staged_files}

    backend-typecheck:
      root: "packages/backend/"
      glob: "*.py"
      run: cd packages/backend && mypy {staged_files}

    infra-scan:
      root: "infrastructure/"
      glob: "*.tf"
      run: checkov -f {staged_files}

    shared-secrets:
      run: gitleaks protect --staged --no-banner
```

### Using lefthook-local.yml for Developer Overrides
```yaml
# lefthook-local.yml (gitignored — personal overrides)
pre-commit:
  commands:
    frontend-lint:
      skip: true  # I'm only working on backend today
```

### Pre-Push with Package-Specific Tests
```yaml
pre-push:
  parallel: true
  commands:
    frontend-test:
      root: "packages/frontend/"
      glob: "*.{ts,tsx}"
      run: cd packages/frontend && npm test -- --passWithNoTests

    backend-test:
      root: "packages/backend/"
      glob: "*.py"
      run: cd packages/backend && pytest --tb=short

    e2e-test:
      root: "packages/e2e/"
      glob: "*.spec.ts"
      run: cd packages/e2e && npx playwright test --reporter=list
```

## Best Practices
- Use `root` to scope commands to specific packages
- Run all package checks in parallel — they are independent
- Include a shared secrets scan that runs on all files
- Use `lefthook-local.yml` (gitignored) for developer-specific overrides
- Group related commands by package for clarity
- Only run tests for packages with changed files

## Common Mistakes
- Running all linters on all files (ESLint on Python, Ruff on TypeScript)
- Not using `root` scoping (commands see files from wrong directory)
- Sequential execution in monorepos (each package check adds latency)
- Not providing lefthook-local.yml for developer customization
