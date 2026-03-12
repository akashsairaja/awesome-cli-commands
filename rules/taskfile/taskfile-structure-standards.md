---
id: taskfile-structure-standards
stackId: taskfile
type: rule
name: Taskfile.yml Structure Standards
description: >-
  Enforce organized Taskfile.yml structure with version declaration, variable
  grouping, description requirements, and consistent task ordering for
  maintainable configurations.
difficulty: beginner
globs:
  - '**/Taskfile.yml'
  - '**/Taskfile.yaml'
  - '**/taskfiles/**'
tags:
  - taskfile-structure
  - organization
  - yaml
  - standards
  - configuration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: How should I organize a Taskfile.yml?
    answer: >-
      Start with 'version: 3', then vars, env, includes, and tasks (in that
      order). Every task must have a desc field. Include a default task that
      runs 'task --list'. Follow the same standard task names as Makefiles:
      setup, dev, build, test, lint, clean.
  - question: Why must every Taskfile task have a desc field?
    answer: >-
      The desc field enables self-documentation — 'task --list' shows all tasks
      with descriptions. Without desc, tasks don't appear in the list, making
      them undiscoverable. It's the Taskfile equivalent of Makefile's ## comment
      pattern.
relatedItems:
  - taskfile-yaml-runner
  - taskfile-naming-conventions
  - taskfile-variables-deps
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Taskfile.yml Structure Standards

## Rule
All Taskfile.yml files MUST declare version 3, include descriptions on every task, organize sections in a consistent order, and group related tasks logically.

## Format
```yaml
# Taskfile.yml
version: '3'

# ─── Variables ─────────────────────────────────────
vars:
  APP_NAME: myapp
  VERSION:
    sh: git describe --tags --always

# ─── Environment ───────────────────────────────────
env:
  CGO_ENABLED: '0'

# ─── Includes ─────────────────────────────────────
includes:
  docker: ./taskfiles/docker.yml

# ─── Tasks ─────────────────────────────────────────
tasks:
  default:
    desc: Show available commands
    cmds:
      - task --list

  setup:
    desc: First-time project setup
    cmds:
      - npm ci

  dev:
    desc: Start development server
    cmds:
      - npm run dev

  build:
    desc: Build for production
    cmds:
      - npm run build

  test:
    desc: Run test suite
    cmds:
      - npm test

  lint:
    desc: Run linters
    cmds:
      - npm run lint

  clean:
    desc: Remove build artifacts
    cmds:
      - rm -rf dist/ node_modules/.cache/
```

## Requirements
1. **version: '3'** at the top (always)
2. **desc on every task** (no exceptions)
3. **Section order**: vars → env → includes → tasks
4. **default task** that shows available commands
5. **Standard task names**: setup, dev, build, test, lint, clean

## Good
```yaml
version: '3'
tasks:
  build:
    desc: Build the application
    cmds:
      - go build -o bin/app ./cmd/app
```

## Bad
```yaml
# Missing version, missing desc
tasks:
  build:
    cmds:
      - go build -o bin/app
```
