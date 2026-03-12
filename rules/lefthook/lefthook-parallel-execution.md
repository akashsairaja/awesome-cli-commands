---
id: lefthook-parallel-execution
stackId: lefthook
type: rule
name: Parallel Execution Requirement
description: >-
  Require parallel execution for independent Lefthook commands — lint, format,
  and security checks must run simultaneously to keep pre-commit hooks under 10
  seconds.
difficulty: beginner
globs:
  - '**/lefthook.yml'
  - '**/lefthook-local.yml'
tags:
  - parallel
  - performance
  - hook-speed
  - developer-experience
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
  - question: Why must Lefthook commands run in parallel?
    answer: >-
      Independent checks (linting, formatting, secrets scanning) have no
      dependency on each other. Running them sequentially wastes time — 3 checks
      taking 3 seconds each become 9 seconds sequential vs 3 seconds parallel.
      Fast hooks mean developers keep them enabled.
  - question: When should Lefthook commands run sequentially?
    answer: >-
      Only when there is a dependency between commands — for example, formatting
      before linting (lint results depend on formatted code). Use 'piped: true'
      for sequential execution. All other cases should use 'parallel: true'.
relatedItems:
  - lefthook-staged-files-only
  - lefthook-hook-placement
  - lefthook-config-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Parallel Execution Requirement

## Rule
All independent commands within a hook stage MUST use `parallel: true`. Sequential execution of independent checks is prohibited — it wastes developer time.

## Format
```yaml
# Good — parallel execution
pre-commit:
  parallel: true
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
    format:
      glob: "*.{ts,tsx,json}"
      run: npx prettier --check {staged_files}
    secrets:
      run: gitleaks protect --staged
```

```yaml
# Bad — sequential (3x slower)
pre-commit:
  commands:
    lint:
      run: npx eslint {staged_files}
    format:
      run: npx prettier --check {staged_files}
    secrets:
      run: gitleaks protect --staged
```

## When Sequential IS Appropriate
```yaml
# Format then lint — lint depends on formatting
pre-commit:
  piped: true
  commands:
    format:
      glob: "*.{ts,tsx}"
      run: npx prettier --write {staged_files}
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
```

## Performance Targets
| Hook Stage | Target Time | Max Time |
|------------|------------|----------|
| pre-commit | < 5 seconds | 10 seconds |
| commit-msg | < 1 second | 3 seconds |
| pre-push | < 30 seconds | 60 seconds |

## Anti-Patterns
- Sequential execution of independent lint, format, and security checks
- Missing `parallel: true` on hook stages with 2+ commands
- Pre-commit hooks exceeding 10 seconds (developers will skip)
- Running tests in pre-commit instead of pre-push
