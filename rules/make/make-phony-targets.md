---
id: make-phony-targets
stackId: make
type: rule
name: Makefile .PHONY Declaration Rules
description: >-
  Enforce .PHONY declarations for all non-file targets in Makefiles — prevent
  incorrect caching, improve performance, and ensure targets always run when
  invoked.
difficulty: beginner
globs:
  - '**/Makefile'
  - '**/makefile'
  - '**/*.mk'
tags:
  - phony
  - targets
  - caching
  - best-practices
  - makefile-syntax
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
  - question: Why must I declare .PHONY for Makefile targets?
    answer: >-
      Without .PHONY, Make checks if a file with the target's name exists. If a
      file called 'test' exists, 'make test' says 'test is up to date' and does
      nothing. .PHONY tells Make to always run the target regardless of file
      existence.
  - question: Should I group .PHONY declarations or declare per-target?
    answer: >-
      Both work. Per-target declarations are easier to maintain (add/remove
      targets individually). Grouped declarations are more compact. Most modern
      Makefiles use per-target for clarity: '.PHONY: build' immediately above
      'build:'.
relatedItems:
  - make-target-organization
  - make-self-documenting
  - make-build-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Makefile .PHONY Declaration Rules

## Rule
Every target that does NOT produce a file with the same name MUST be declared as .PHONY. This prevents Make from skipping targets when a file with that name exists.

## Why
Without .PHONY, if a file named `test` or `build` exists in the directory, Make considers that target "up to date" and skips it. .PHONY tells Make to always run the target.

## Format
```makefile
# Good: declare .PHONY before each target
.PHONY: build
build:
	go build -o bin/app ./cmd/app

.PHONY: test
test:
	go test ./...

.PHONY: clean
clean:
	rm -rf bin/ dist/

# Also acceptable: grouped declaration
.PHONY: build test clean lint dev deploy
```

## Good
```makefile
.PHONY: test
test: ## Run tests
	npm test
```

## Bad
```makefile
test:  ## Run tests — MISSING .PHONY
	npm test
# If a file named "test" exists, this target is silently skipped!
```

## When .PHONY is NOT Needed
```makefile
# File targets don't need .PHONY
bin/app: cmd/app/main.go
	go build -o $@ ./$(<D)
# This produces a file called "bin/app" — Make checks if it's up to date
```
