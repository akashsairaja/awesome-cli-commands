---
id: taskfile-caching
stackId: taskfile
type: skill
name: >-
  Taskfile Smart Caching with Sources & Generates
description: >-
  Use Taskfile's sources and generates for intelligent task caching — skip
  tasks when inputs haven't changed, fingerprint-based detection, and status
  commands for custom cache logic.
difficulty: intermediate
tags:
  - taskfile
  - smart
  - caching
  - sources
  - generates
  - debugging
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
  - question: "When should I use the Taskfile Smart Caching with Sources & Generates skill?"
    answer: >-
      Use Taskfile's sources and generates for intelligent task caching — skip
      tasks when inputs haven't changed, fingerprint-based detection, and
      status commands for custom cache logic. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Taskfile Smart Caching with Sources & Generates require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, Go toolchain installed. Works with
      taskfile projects. Review the configuration section for project-specific
      setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Taskfile Smart Caching with Sources & Generates

## Overview
Taskfile can skip tasks when source files haven't changed since the last run. This makes builds incremental — only rebuild what's needed. Configure `sources` (inputs) and `generates` (outputs) for automatic detection, or use `status` for custom logic.

## Why This Matters
- **Faster builds** — skip unchanged tasks
- **Incremental CI** — only re-lint changed files
- **Smart dependencies** — rebuild only when sources change
- **No manual cache invalidation** — Taskfile tracks fingerprints

## How It Works

### Step 1: File-Based Caching
```yaml
tasks:
  build:
    desc: Build Go binary
    sources:
      - cmd/**/*.go
      - internal/**/*.go
      - go.mod
      - go.sum
    generates:
      - bin/myapp
    cmds:
      - go build -o bin/myapp ./cmd/myapp
    # Skips if no .go files or go.mod changed since last build
```

### Step 2: Status-Based Caching
```yaml
tasks:
  install-deps:
    desc: Install npm dependencies
    status:
      - test -d node_modules
      - test node_modules/.package-lock.json -nt package-lock.json
    cmds:
      - npm ci
    # Skips if node_modules exists and is newer than lockfile

  docker-build:
    desc: Build Docker image
    status:
      - docker image inspect myapp:{{.VERSION}} > /dev/null 2>&1
    cmds:
      - docker build -t myapp:{{.VERSION}} .
    # Skips if image already exists
```

### Step 3: Combining Sources and Status
```yaml
tasks:
  generate-proto:
    desc: Generate protobuf Go code
    sources:
      - proto/**/*.proto
    generates:
      - gen/**/*.pb.go
    cmds:
      - protoc --go_out=gen/ proto/**/*.proto
    # Skips if .proto files haven't changed AND .pb.go files exist

  lint:
    desc: Run linters
    sources:
      - "**/*.go"
      - .golangci.yml
    cmds:
      - golangci-lint run
    # Re-lints only when Go files or config change
```

### Step 4: Force Run (Bypass Cache)
```bash
# Force run a cached task
task build --force

# Run with verbose output (shows cache decisions)
task build --verbose
```

## Caching Methods
| Method | Use When |
|--------|----------|
| sources + generates | File transformation (compile, generate) |
| sources only | Validation tasks (lint, test) |
| status | Custom conditions (Docker image exists, deps installed) |
| --force | Bypass all caching |

## Best Practices
- **Use sources for all build tasks** — makes them incremental
- **Use status for installation checks** — skip if already installed
- **Use glob patterns**: `**/*.go` matches all Go files recursively
- **Use --verbose** to debug cache decisions
- **Combine sources + status** for complex cache logic

## Common Mistakes
- Not using sources/generates (every run rebuilds from scratch)
- Too broad glob patterns (cache never hits)
- Too narrow glob patterns (misses changed files)
- Forgetting --force when debugging cache issues
