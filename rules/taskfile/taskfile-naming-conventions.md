---
id: taskfile-naming-conventions
stackId: taskfile
type: rule
name: Taskfile Task Naming Conventions
description: >-
  Standards for naming Taskfile tasks — kebab-case format, verb-noun patterns,
  namespace prefixes for includes, and consistent naming across projects.
difficulty: beginner
globs:
  - '**/Taskfile.yml'
  - '**/Taskfile.yaml'
tags:
  - naming-conventions
  - kebab-case
  - task-names
  - standards
  - consistency
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
  - question: How should I name Taskfile tasks?
    answer: >-
      Use kebab-case with verb-noun pattern: build-app, run-tests, docker-push.
      Use single verbs for standard actions: build, test, lint, clean.
      Namespaces from includes use colons: docker:build, test:unit. Never use
      camelCase or snake_case.
  - question: What standard task names should every project use?
    answer: >-
      Use consistent names across all projects: setup (first-time setup), dev
      (development mode), build (production build), test (run tests), lint (code
      quality), clean (remove artifacts), deploy (deployment). These names
      should mean the same thing in every project.
relatedItems:
  - taskfile-structure-standards
  - taskfile-yaml-runner
  - make-target-organization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Taskfile Task Naming Conventions

## Rule
All Taskfile tasks MUST use kebab-case naming with verb-noun patterns. Included tasks use colon-separated namespaces.

## Format
```yaml
tasks:
  # Good: kebab-case, verb-noun
  build-app:
    desc: Build the application
  run-tests:
    desc: Run test suite
  docker-build:
    desc: Build Docker image
  deploy-staging:
    desc: Deploy to staging

  # Namespaced (from includes)
  # docker:build, docker:push, test:unit, test:e2e
```

## Naming Patterns
| Pattern | Example | Use Case |
|---------|---------|----------|
| Simple verb | build, test, lint, clean | Standard actions |
| Verb-noun | docker-build, run-tests | Specific actions |
| Namespace:verb | docker:build, test:unit | Included tasks |

## Standard Names (Use These)
| Task | Purpose |
|------|---------|
| setup | First-time project setup |
| dev | Start development mode |
| build | Build production artifact |
| test | Run all tests |
| lint | Run all linters |
| clean | Remove artifacts |
| deploy | Deploy to target |

## Good
```yaml
build-docker:
  desc: Build Docker image

test-unit:
  desc: Run unit tests
```

## Bad
```yaml
buildDocker:    # camelCase — wrong
Build_Docker:   # snake_case with caps — wrong
bd:             # Too short, undescriptive
```
