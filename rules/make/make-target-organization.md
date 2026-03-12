---
id: make-target-organization
stackId: make
type: rule
name: Makefile Target Organization Standards
description: >-
  Standards for organizing Makefile targets — section grouping, naming
  conventions, dependency ordering, and required targets for every project
  Makefile.
difficulty: beginner
globs:
  - '**/Makefile'
  - '**/makefile'
  - '**/*.mk'
tags:
  - organization
  - naming-conventions
  - required-targets
  - structure
  - standards
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
  - question: What targets should every Makefile have?
    answer: >-
      Every Makefile should have: help (list commands), build (create artifact),
      test (run tests), lint (check code quality), and clean (remove artifacts).
      Recommended additions: dev (start development), setup (first-time
      installation), and deploy (deployment).
  - question: How should I name Makefile targets?
    answer: >-
      Use kebab-case with verb-noun pattern: docker-build, docker-push,
      test-unit, test-integration. Group related targets with common prefixes.
      Keep names short (1-2 words) and descriptive. Always add ## comments for
      the help target.
relatedItems:
  - make-phony-targets
  - make-self-documenting
  - make-build-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Makefile Target Organization Standards

## Rule
All Makefiles MUST include help, build, test, lint, and clean targets. Targets must be organized by category with comment headers and follow consistent naming.

## Format
```makefile
# ─── Variables ─────────────────────────────────────
APP_NAME := myapp
VERSION := $(shell git describe --tags --always)

# ─── Default Target ───────────────────────────────
.DEFAULT_GOAL := help

# ─── Help ──────────────────────────────────────────
.PHONY: help
help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | ...

# ─── Development ───────────────────────────────────
.PHONY: dev
dev: ## Start dev server

.PHONY: setup
setup: ## First-time setup

# ─── Building ──────────────────────────────────────
.PHONY: build
build: ## Build application

# ─── Testing ───────────────────────────────────────
.PHONY: test
test: ## Run tests

.PHONY: lint
lint: ## Run linters

# ─── Deployment ────────────────────────────────────
.PHONY: deploy
deploy: ## Deploy application

# ─── Cleanup ───────────────────────────────────────
.PHONY: clean
clean: ## Remove artifacts
```

## Required Targets
| Target | Required? | Purpose |
|--------|-----------|---------|
| help | Yes | List available commands |
| build | Yes | Build production artifact |
| test | Yes | Run test suite |
| lint | Yes | Run linters/formatters |
| clean | Yes | Remove build artifacts |
| dev | Recommended | Start dev server |
| setup | Recommended | First-time setup |
| deploy | Optional | Deploy to environment |

## Naming Conventions
- Use **kebab-case**: `docker-build` not `docker_build` or `dockerBuild`
- Use **verb-noun** pattern: `docker-push` not `push-docker`
- Group with prefixes: `docker-build`, `docker-push`, `docker-run`

## Good
```makefile
.DEFAULT_GOAL := help
# Variables at top, help first, organized sections
```

## Bad
```makefile
# No help, no organization, no .PHONY
build:
	...
some-random-target:
	...
```
