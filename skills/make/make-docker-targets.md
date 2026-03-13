---
id: make-docker-targets
stackId: make
type: skill
name: >-
  Makefile Docker & Deployment Targets
description: >-
  Create Makefile targets for Docker builds, image tagging, multi-stage
  builds, container orchestration, and deployment workflows with
  environment-based configuration.
difficulty: intermediate
tags:
  - make
  - makefile
  - docker
  - deployment
  - targets
  - ci-cd
  - prompting
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Makefile Docker & Deployment Targets skill?"
    answer: >-
      Create Makefile targets for Docker builds, image tagging, multi-stage
      builds, container orchestration, and deployment workflows with
      environment-based configuration. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Makefile Docker & Deployment Targets require?"
    answer: >-
      Requires Docker, kubectl installed. Works with make projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Makefile Docker & Deployment Targets

## Overview
Makefiles excel as the interface layer for Docker and deployment workflows. `make docker-build` is clearer than a 5-flag Docker command, and `make deploy ENV=staging` wraps complex deployment logic in a memorable command.

## Why This Matters
- **Memorable commands** — `make deploy` vs long CLI strings
- **Environment safety** — built-in confirmation for production
- **Versioning** — automatic Git-based image tagging
- **Composition** — chain build, push, and deploy steps

## Docker Targets
```makefile
# Variables
APP_NAME := myapp
VERSION := $(shell git describe --tags --always --dirty)
DOCKER_REGISTRY := ghcr.io/myorg
DOCKER_IMAGE := $(DOCKER_REGISTRY)/$(APP_NAME)

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build \
		--build-arg VERSION=$(VERSION) \
		--build-arg BUILD_TIME=$(shell date -u +%Y-%m-%dT%H:%M:%SZ) \
		-t $(DOCKER_IMAGE):$(VERSION) \
		-t $(DOCKER_IMAGE):latest \
		.

.PHONY: docker-push
docker-push: ## Push Docker image to registry
	docker push $(DOCKER_IMAGE):$(VERSION)
	docker push $(DOCKER_IMAGE):latest

.PHONY: docker-run
docker-run: ## Run Docker container locally
	docker run --rm -p 8080:8080 \
		-e ENV=development \
		$(DOCKER_IMAGE):$(VERSION)

.PHONY: docker-compose-up
docker-compose-up: ## Start all services with Docker Compose
	docker compose up -d

.PHONY: docker-compose-down
docker-compose-down: ## Stop all services
	docker compose down -v
```

## Deployment Targets
```makefile
ENV ?= staging

.PHONY: deploy
deploy: ## Deploy to environment (ENV=staging|production)
ifeq ($(ENV),production)
	@echo "\033[31m⚠ Deploying to PRODUCTION\033[0m"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ]
endif
	@echo "Deploying $(APP_NAME):$(VERSION) to $(ENV)..."
	kubectl set image deployment/$(APP_NAME) \
		$(APP_NAME)=$(DOCKER_IMAGE):$(VERSION) \
		-n $(ENV)

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging
	$(MAKE) deploy ENV=staging

.PHONY: deploy-production
deploy-production: ## Deploy to production (with confirmation)
	$(MAKE) deploy ENV=production

.PHONY: rollback
rollback: ## Rollback deployment
	kubectl rollout undo deployment/$(APP_NAME) -n $(ENV)
```

## CI/CD Integration
```makefile
.PHONY: ci
ci: lint test build ## Run full CI pipeline

.PHONY: cd
cd: docker-build docker-push deploy ## Run full CD pipeline
```

## Best Practices
- **Use Git tags for Docker image versions** — always traceable
- **Add confirmation for production deploys** — prevent accidents
- **Chain targets for pipelines**: `ci: lint test build`
- **Use ENV variable** for environment switching
- **Tag both :version and :latest** for flexibility

## Common Mistakes
- Hardcoded Docker image tags (not traceable to Git)
- No confirmation prompt for production deployment
- Missing --dirty flag in Git describe (builds from uncommitted code)
- Not passing build args (version, build time) to Docker
