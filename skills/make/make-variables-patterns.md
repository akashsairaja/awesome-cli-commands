---
id: make-variables-patterns
stackId: make
type: skill
name: >-
  Makefile Variables & Pattern Rules
description: >-
  Master Makefile variables, pattern rules, and functions — environment
  overrides, conditional logic, automatic variables, and DRY patterns for
  maintainable build files.
difficulty: intermediate
tags:
  - make
  - makefile
  - variables
  - pattern
  - rules
  - docker
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Makefile Variables & Pattern Rules skill?"
    answer: >-
      Master Makefile variables, pattern rules, and functions — environment
      overrides, conditional logic, automatic variables, and DRY patterns for
      maintainable build files. It includes practical examples for make
      development.
  - question: "What tools and setup does Makefile Variables & Pattern Rules require?"
    answer: >-
      Requires Docker, Go toolchain installed. Works with make projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Makefile Variables & Pattern Rules

## Overview
Makefile variables and pattern rules eliminate duplication and make build files maintainable. Variables define reusable values, pattern rules handle repetitive targets, and functions transform strings — all essential for Makefiles beyond trivial use.

## Why This Matters
- **DRY builds** — define once, use everywhere
- **Environment overrides** — `make deploy ENV=staging`
- **Pattern rules** — one rule handles many files
- **Maintainability** — change a version/path in one place

## Variable Types

### Simple vs Recursive
```makefile
# Immediate (simple) — evaluated once at definition
VERSION := $(shell git describe --tags --always)
BUILD_TIME := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)

# Recursive — evaluated each time used
GOFLAGS = -ldflags "-X main.version=$(VERSION)"

# Overridable default — user can override from CLI
ENV ?= development
PORT ?= 8080

# Conditional
ifdef CI
  GOFLAGS += -v
endif
```

### Using Variables
```makefile
APP_NAME := myapp
VERSION := $(shell git describe --tags --always)
DOCKER_IMAGE := $(APP_NAME):$(VERSION)
GO_FILES := $(shell find . -name '*.go' -not -path './vendor/*')

.PHONY: build
build: ## Build the application
	go build $(GOFLAGS) -o bin/$(APP_NAME) ./cmd/$(APP_NAME)

.PHONY: docker-build
docker-build: ## Build Docker image
	docker build -t $(DOCKER_IMAGE) .

# Override from command line:
# make build GOFLAGS="-race"
# make deploy ENV=production
```

## Pattern Rules
```makefile
# Compile all .proto files to .go
%.pb.go: %.proto
	protoc --go_out=. $<

# Build all cmd/ binaries
bin/%: cmd/%/main.go
	go build -o $@ ./$(<D)

# Generate all .css from .scss
dist/%.css: src/%.scss
	sass $< $@
```

## Automatic Variables
| Variable | Meaning | Example |
|----------|---------|---------|
| `$@` | Target name | bin/myapp |
| `$<` | First prerequisite | cmd/myapp/main.go |
| `$^` | All prerequisites | file1.go file2.go |
| `$*` | Pattern stem | myapp (from bin/%) |
| `$(@D)` | Directory of target | bin/ |
| `$(<D)` | Directory of first prereq | cmd/myapp/ |

## Functions
```makefile
# Find files
SOURCES := $(wildcard src/*.go)
TESTS := $(wildcard *_test.go)

# String manipulation
OBJECTS := $(SOURCES:.go=.o)
BINARIES := $(addprefix bin/,app1 app2 app3)

# Shell execution
GIT_HASH := $(shell git rev-parse --short HEAD)
```

## Best Practices
- **Use := for most variables** — predictable evaluation
- **Use ?= for overridable defaults** — CLI-friendly
- **Use pattern rules** for repetitive file transformations
- **Group variables at the top** of the Makefile
- **Use $(shell ...) sparingly** — each call spawns a subshell

## Common Mistakes
- Using = when := is intended (unexpected lazy evaluation)
- Not quoting shell commands inside $(shell ...)
- Forgetting that each recipe line runs in a separate shell
- Using pattern rules for targets that aren't file-based
