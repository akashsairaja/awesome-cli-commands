---
id: taskfile-caching-rules
stackId: taskfile
type: rule
name: Taskfile Caching Requirements
description: >-
  Require sources/generates or status fields on all build and generation tasks
  for intelligent caching — preventing unnecessary rebuilds and speeding up
  workflows.
difficulty: intermediate
globs:
  - '**/Taskfile.yml'
  - '**/Taskfile.yaml'
tags:
  - caching
  - sources
  - generates
  - performance
  - incremental-builds
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Which Taskfile tasks need caching?
    answer: >-
      All build, compilation, code generation, and lint tasks should have
      sources/generates or status. Quick tasks (dev server, clean, deploy) don't
      need caching. The rule: if a task transforms inputs into outputs, it
      should be cached.
  - question: What is the difference between sources/generates and status?
    answer: >-
      sources/generates uses file fingerprinting — Taskfile checks if source
      files changed since last run. status uses custom shell commands — the task
      is skipped if all status commands return exit code 0. Use sources for file
      transformations, status for installation checks.
relatedItems:
  - taskfile-caching
  - taskfile-structure-standards
  - taskfile-yaml-runner
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Taskfile Caching Requirements

## Rule
All build, compilation, and code generation tasks MUST include sources/generates or status fields for intelligent caching. Tasks should only run when inputs change.

## Required Caching
```yaml
# MUST have caching: build tasks
build:
  desc: Build application
  sources:
    - cmd/**/*.go
    - internal/**/*.go
    - go.mod
    - go.sum
  generates:
    - bin/myapp
  cmds:
    - go build -o bin/myapp ./cmd/myapp

# MUST have caching: generation tasks
generate:
  desc: Generate code from proto
  sources:
    - proto/**/*.proto
  generates:
    - gen/**/*.pb.go
  cmds:
    - protoc --go_out=gen/ proto/*.proto

# MUST have status: installation tasks
install-deps:
  desc: Install dependencies
  status:
    - test -d node_modules
  cmds:
    - npm ci
```

## Exempt from Caching
```yaml
# OK without caching: quick/stateless tasks
dev:
  desc: Start development server
  cmds:
    - npm run dev

clean:
  desc: Remove artifacts
  cmds:
    - rm -rf bin/ dist/

deploy:
  desc: Deploy (always run)
  cmds:
    - ./deploy.sh
```

## Caching Decision Table
| Task Type | Caching Method |
|-----------|---------------|
| Build/compile | sources + generates |
| Code generation | sources + generates |
| Lint/format | sources only |
| Install deps | status |
| Dev server | None (always run) |
| Clean | None (always run) |
| Deploy | None (always run) |

## Good
```yaml
build:
  sources: ["**/*.go", "go.mod"]
  generates: ["bin/app"]
  cmds: ["go build -o bin/app"]
```

## Bad
```yaml
build:
  cmds: ["go build -o bin/app"]
# No caching — rebuilds every time even if nothing changed
```
