---
id: taskfile-variables-deps
stackId: taskfile
type: skill
name: Taskfile Variables & Dependencies
description: >-
  Master Taskfile variables, dynamic values, task dependencies, and environment
  configuration — the building blocks for maintainable YAML-based task
  automation.
difficulty: beginner
tags:
  - taskfile-variables
  - dependencies
  - dynamic-values
  - preconditions
  - configuration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Task installed
  - Basic YAML knowledge
faq:
  - question: How do Taskfile variables work?
    answer: >-
      Define variables in the top-level 'vars' section. Static: 'APP_NAME:
      myapp'. Dynamic: 'VERSION: {sh: git describe --tags}'. Use in tasks with
      Go template syntax: '{{.VERSION}}'. Override from CLI: 'task build
      VERSION=1.2.3'.
  - question: What is the difference between deps and cmds in Taskfile?
    answer: >-
      deps run in parallel before the task's cmds. Use deps for independent
      setup tasks (install Go deps + npm deps simultaneously). cmds run
      sequentially within a task. Use 'task:' in cmds for ordered execution
      (lint, then test, then build).
relatedItems:
  - taskfile-yaml-runner
  - taskfile-caching
  - taskfile-includes
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Taskfile Variables & Dependencies

## Overview
Taskfile variables and dependencies control how tasks get their configuration and execution order. Variables define reusable values (static and dynamic), while deps and preconditions control when and how tasks run.

## Why This Matters
- **Reusable configuration** — define once, use in all tasks
- **Dynamic values** — compute versions, dates, hashes at runtime
- **Parallel execution** — deps run in parallel, cmds run sequentially
- **Conditional logic** — skip tasks based on preconditions

## How It Works

### Step 1: Define Variables
```yaml
# Taskfile.yml
version: '3'

vars:
  APP_NAME: myapp
  VERSION:
    sh: git describe --tags --always --dirty
  BUILD_TIME:
    sh: date -u +%Y-%m-%dT%H:%M:%SZ
  GO_FILES:
    sh: find . -name '*.go' -not -path './vendor/*'

# Environment variables
env:
  CGO_ENABLED: '0'
  GOFLAGS: '-trimpath'
```

### Step 2: Use Variables in Tasks
```yaml
tasks:
  build:
    desc: Build the application
    cmds:
      - go build -ldflags "-X main.version={{.VERSION}}" -o bin/{{.APP_NAME}} ./cmd/{{.APP_NAME}}

  docker-build:
    desc: Build Docker image
    cmds:
      - docker build -t {{.APP_NAME}}:{{.VERSION}} .

  info:
    desc: Show build information
    cmds:
      - echo "App={{.APP_NAME}} Version={{.VERSION}} Built={{.BUILD_TIME}}"
```

### Step 3: Task Dependencies
```yaml
tasks:
  # Dependencies run in PARALLEL
  setup:
    desc: Install all dependencies
    deps:
      - install-go-deps
      - install-npm-deps
      - install-tools

  install-go-deps:
    desc: Install Go dependencies
    cmds:
      - go mod download

  install-npm-deps:
    desc: Install npm dependencies
    cmds:
      - npm ci

  install-tools:
    desc: Install development tools
    cmds:
      - go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

  # Sequential with deps
  ci:
    desc: Run full CI pipeline
    cmds:
      - task: lint
      - task: test
      - task: build
```

### Step 4: Task Variables (Per-Task Override)
```yaml
tasks:
  greet:
    desc: Greet someone
    vars:
      NAME: '{{.NAME | default "World"}}'
    cmds:
      - echo "Hello, {{.NAME}}!"

  # Call with variable:
  # task greet NAME=Alice
```

### Step 5: Preconditions
```yaml
tasks:
  deploy:
    desc: Deploy to production
    preconditions:
      - sh: test -n "$DEPLOY_TOKEN"
        msg: "DEPLOY_TOKEN environment variable is required"
      - sh: git diff --quiet
        msg: "Working directory must be clean (no uncommitted changes)"
    cmds:
      - ./deploy.sh
```

## Best Practices
- **Use sh: for dynamic values** — Git version, date, file lists
- **Use deps for parallel tasks** — install dependencies simultaneously
- **Use cmds with task: for sequential** — lint, then test, then build
- **Use preconditions** for safety checks before destructive operations
- **Override with CLI**: `task build VERSION=1.2.3`

## Common Mistakes
- Confusing deps (parallel) with sequential cmds
- Forgetting that sh: variables run a shell command
- Not providing default values for optional variables
- Missing preconditions on deployment tasks
