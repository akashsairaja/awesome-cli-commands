---
id: lefthook-config-patterns
stackId: lefthook
type: skill
name: Lefthook Configuration Patterns
description: >-
  Design lefthook.yml configurations with parallel execution, glob filtering,
  staged file targeting, and multi-hook orchestration for fast, focused Git hook
  workflows.
difficulty: beginner
tags:
  - configuration
  - parallel
  - glob-filtering
  - lefthook-yml
  - lefthook
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Lefthook installed
  - Git repository
faq:
  - question: How do I configure Lefthook for a new project?
    answer: >-
      Create lefthook.yml in your project root. Define hooks (pre-commit,
      commit-msg, pre-push) with commands. Each command specifies a glob pattern
      and a run command. Use 'parallel: true' for independent checks. Run
      'lefthook install' to activate hooks.
  - question: How does Lefthook handle staged files?
    answer: >-
      Use {staged_files} in the run command to pass only staged files to your
      tool. Combined with glob filtering, this means only relevant, staged files
      are checked — for example, ESLint runs only on staged .ts files, not the
      entire codebase.
  - question: Can Lefthook run different tools for different file types?
    answer: >-
      Yes. Define multiple commands with different glob patterns: one for *.ts
      (ESLint), one for *.css (Stylelint), one for *.py (Ruff). Each command
      runs only when matching files are staged. With parallel: true, they all
      run simultaneously.
relatedItems:
  - lefthook-monorepo-setup
  - lefthook-remote-hooks
  - lefthook-hook-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Lefthook Configuration Patterns

## Overview
Lefthook's configuration file (lefthook.yml) defines what runs at each Git hook stage. Well-designed configurations run checks in parallel, target only relevant files, and keep execution under 10 seconds.

## How It Works

### Basic Configuration
```yaml
# lefthook.yml
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{js,ts,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{js,ts,tsx,json,md,css}"
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
```

### Glob Filtering
```yaml
pre-commit:
  parallel: true
  commands:
    eslint:
      glob: "*.{js,jsx,ts,tsx}"
      exclude: "*.test.{js,ts}"  # skip test files for linting speed
      run: npx eslint {staged_files}
    stylelint:
      glob: "*.{css,scss}"
      run: npx stylelint {staged_files}
    python-lint:
      glob: "*.py"
      run: ruff check {staged_files}
    go-lint:
      glob: "*.go"
      run: golangci-lint run {staged_files}
```

### Root and Subdirectory Filtering
```yaml
pre-commit:
  commands:
    frontend-lint:
      root: "frontend/"
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
    backend-lint:
      root: "backend/"
      glob: "*.py"
      run: ruff check {staged_files}
```

### Scripts Instead of Inline Commands
```yaml
pre-commit:
  scripts:
    "check-secrets.sh":
      runner: bash
    "lint-staged.sh":
      runner: bash
```

```bash
# .lefthook/pre-commit/check-secrets.sh
#!/bin/bash
gitleaks protect --staged --no-banner
```

### Conditional Execution
```yaml
pre-commit:
  commands:
    lint:
      glob: "*.{js,ts}"
      run: npx eslint {staged_files}
      skip:
        - merge
        - rebase
```

## Best Practices
- Use `parallel: true` for independent checks in the same hook stage
- Use `{staged_files}` in pre-commit to check only staged files
- Keep pre-commit under 10 seconds — move slow checks to pre-push
- Use `glob` to run tools only on relevant file types
- Use `root` for monorepo subdirectory scoping
- Skip hooks during merge/rebase to avoid blocking conflict resolution

## Common Mistakes
- Not using `parallel: true` (checks run sequentially, twice as slow)
- Checking all files instead of `{staged_files}` (lints entire codebase)
- Running tests in pre-commit (too slow, belongs in pre-push)
- Not using `glob` filtering (ESLint runs on .md files, Prettier on .go files)
