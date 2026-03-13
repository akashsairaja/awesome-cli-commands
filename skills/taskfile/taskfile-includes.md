---
id: taskfile-includes
stackId: taskfile
type: skill
name: >-
  Taskfile Includes & Modular Configuration
description: >-
  Split large Taskfile configurations into modular includes — namespaced task
  groups, shared variables, monorepo support, and DRY patterns for complex
  projects.
difficulty: intermediate
tags:
  - taskfile
  - includes
  - modular
  - configuration
  - testing
  - deployment
  - api
  - docker
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Taskfile Includes & Modular Configuration skill?"
    answer: >-
      Split large Taskfile configurations into modular includes — namespaced
      task groups, shared variables, monorepo support, and DRY patterns for
      complex projects. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does Taskfile Includes & Modular Configuration require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, pip/poetry installed. Works with
      taskfile projects. Review the configuration section for project-specific
      setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Taskfile Includes & Modular Configuration

## Overview
Taskfile includes let you split a large configuration into multiple files, each responsible for a domain (docker, testing, deployment). Included files get namespaced automatically, preventing name collisions and keeping each file focused.

## Why This Matters
- **Maintainability** — small focused files instead of one massive Taskfile
- **Namespacing** — docker:build, test:unit, deploy:staging
- **Reusability** — shared task definitions across projects
- **Monorepo support** — per-package Taskfiles with shared root

## How It Works

### Step 1: Split into Files
```
project/
├── Taskfile.yml              # Root (includes others)
├── taskfiles/
│   ├── docker.yml            # Docker tasks
│   ├── test.yml              # Testing tasks
│   └── deploy.yml            # Deployment tasks
```

### Step 2: Root Taskfile with Includes
```yaml
# Taskfile.yml
version: '3'

vars:
  APP_NAME: myapp
  VERSION:
    sh: git describe --tags --always

includes:
  docker: ./taskfiles/docker.yml
  test: ./taskfiles/test.yml
  deploy: ./taskfiles/deploy.yml

tasks:
  default:
    desc: Show available commands
    cmds:
      - task --list

  dev:
    desc: Start development environment
    deps:
      - docker:compose-up
    cmds:
      - npm run dev

  ci:
    desc: Run full CI pipeline
    cmds:
      - task: test:lint
      - task: test:unit
      - task: docker:build
```

### Step 3: Included Taskfile
```yaml
# taskfiles/docker.yml
version: '3'

tasks:
  build:
    desc: Build Docker image
    cmds:
      - docker build -t {{.APP_NAME}}:{{.VERSION}} .

  push:
    desc: Push Docker image
    cmds:
      - docker push {{.APP_NAME}}:{{.VERSION}}

  compose-up:
    desc: Start Docker Compose services
    cmds:
      - docker compose up -d

  compose-down:
    desc: Stop Docker Compose services
    cmds:
      - docker compose down -v
```

### Step 4: Usage
```bash
# Tasks are namespaced by include key
task docker:build          # From docker.yml
task test:unit             # From test.yml
task deploy:staging        # From deploy.yml

# Root tasks don't have a prefix
task dev                   # From root Taskfile.yml
task ci

# List all tasks across includes
task --list
```

### Monorepo Pattern
```yaml
# Root Taskfile.yml
version: '3'

includes:
  api:
    taskfile: ./services/api/Taskfile.yml
    dir: ./services/api
  web:
    taskfile: ./services/web/Taskfile.yml
    dir: ./services/web
  shared:
    taskfile: ./packages/shared/Taskfile.yml
    dir: ./packages/shared

tasks:
  build-all:
    desc: Build all services
    deps:
      - api:build
      - web:build
```

## Best Practices
- **One file per domain** — docker.yml, test.yml, deploy.yml
- **Use dir with includes** for monorepo packages (sets working directory)
- **Share variables** from root — included files inherit root vars
- **Namespace consistently** — docker:build, docker:push, docker:run
- **Keep root Taskfile thin** — orchestration only, details in includes

## Common Mistakes
- Too many includes (diminishing returns past 5-6)
- Not setting dir for monorepo includes (wrong working directory)
- Circular includes (A includes B includes A)
- Duplicating variables in included files (inherit from root)
