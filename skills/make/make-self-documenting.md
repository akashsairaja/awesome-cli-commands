---
id: make-self-documenting
stackId: make
type: skill
name: Self-Documenting Makefile Pattern
description: >-
  Create self-documenting Makefiles with auto-generated help targets — every
  target gets a description, and 'make help' displays all available commands
  with explanations.
difficulty: intermediate
tags:
  - make
  - self-documenting
  - makefile
  - pattern
  - testing
  - deployment
  - docker
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Self-Documenting Makefile Pattern skill?"
    answer: >-
      Create self-documenting Makefiles with auto-generated help targets —
      every target gets a description, and 'make help' displays all available
      commands with explanations. It includes practical examples for make
      development.
  - question: "What tools and setup does Self-Documenting Makefile Pattern require?"
    answer: >-
      Requires Docker, Go toolchain installed. Works with make projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Self-Documenting Makefile Pattern

## Overview
A self-documenting Makefile includes a help target that automatically lists all available targets with descriptions. Developers type `make help` (or just `make`) to see what's available — no readme needed.

## Why This Matters
- **Discoverability** — new developers find all commands instantly
- **Up-to-date docs** — descriptions live next to the targets
- **Onboarding** — `make help` is the first command to run
- **No guessing** — every target's purpose is clear

## How It Works

### The Pattern
```makefile
.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build: ## Build the application
	go build -o bin/app ./cmd/app

.PHONY: test
test: ## Run all tests
	go test ./...

.PHONY: lint
lint: ## Run linters
	golangci-lint run

.PHONY: dev
dev: ## Start development server with hot reload
	air -c .air.toml

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t myapp:latest .

.PHONY: clean
clean: ## Remove build artifacts
	rm -rf bin/ dist/ coverage/
```

### Output
```bash
$ make help
build                Build the application
test                 Run all tests
lint                 Run linters
dev                  Start development server with hot reload
docker-build         Build Docker image
clean                Remove build artifacts
```

### Grouped Help (Advanced)
```makefile
.PHONY: help
help: ## Show available commands
	@echo "\033[1mDevelopment:\033[0m"
	@grep -E '^[a-zA-Z_-]+:.*?## Dev:' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## Dev: "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo "\033[1mTesting:\033[0m"
	@grep -E '^[a-zA-Z_-]+:.*?## Test:' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## Test: "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo "\033[1mDeployment:\033[0m"
	@grep -E '^[a-zA-Z_-]+:.*?## Deploy:' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## Deploy: "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

dev: ## Dev: Start development server
build: ## Dev: Build application
test: ## Test: Run unit tests
lint: ## Test: Run linters
deploy: ## Deploy: Deploy to production
```

## Best Practices
- **Set .DEFAULT_GOAL to help** — bare `make` shows available commands
- **Comment format: `## Description`** after target name and colon
- **Every .PHONY target gets a description** — no undocumented targets
- **Group related targets** with prefixed descriptions for large Makefiles
- **Keep descriptions under 60 characters** for clean alignment

## Common Mistakes
- No help target (developers guess at available commands)
- Descriptions that duplicate the target name ("build: Build")
- Help target not set as default goal
- Using # instead of ## (help grep misses single-# comments)
