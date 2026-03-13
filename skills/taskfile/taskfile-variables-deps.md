---
id: taskfile-variables-deps
stackId: taskfile
type: skill
name: >-
  Taskfile Variables & Dependencies
description: >-
  Master Taskfile variables, dynamic shell values, task dependencies,
  preconditions, status checks, and environment configuration — the building
  blocks for maintainable YAML-based task automation.
difficulty: advanced
tags:
  - taskfile
  - variables
  - dependencies
  - docker
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Taskfile Variables & Dependencies skill?"
    answer: >-
      Use this skill to build maintainable Taskfile.yml configurations with
      variables (static and dynamic), task dependencies (parallel and
      sequential), preconditions for safety checks, status for incremental
      builds, and environment management. Covers the patterns that separate
      simple task runners from production-grade build automation.
  - question: "What tools and setup does Taskfile Variables & Dependencies require?"
    answer: >-
      Requires Task (go-task) CLI v3.x installed. No additional tools needed.
      Taskfile uses YAML syntax and Go template expressions for variable
      interpolation. Works on Linux, macOS, and Windows.
version: "1.0.0"
lastUpdated: "2026-03-13"
---

# Taskfile Variables & Dependencies

## Overview

Variables and dependencies are the core building blocks of Taskfile automation. Variables provide reusable configuration — static strings, computed shell values, and CLI overrides. Dependencies control execution order — parallel prerequisites, sequential command chains, preconditions for safety gates, and status checks for incremental builds. Understanding these mechanisms is the difference between a flat list of shell commands and a maintainable build system.

## Variable Types and Precedence

Taskfile variables resolve in a specific precedence order (highest to lowest):

1. CLI overrides: `task build VERSION=1.2.3`
2. `vars:` on the called task
3. `vars:` in the `task:` call
4. `vars:` on the included Taskfile
5. Global `vars:` in the Taskfile
6. Environment variables

### Static Variables

```yaml
# Taskfile.yml
version: '3'

vars:
  APP_NAME: myapp
  GO_BINARY: bin/{{.APP_NAME}}
  DOCKER_REGISTRY: ghcr.io/myorg
  DOCKER_IMAGE: "{{.DOCKER_REGISTRY}}/{{.APP_NAME}}"

tasks:
  info:
    cmds:
      - echo "App={{.APP_NAME}} Binary={{.GO_BINARY}} Image={{.DOCKER_IMAGE}}"
```

Variables can reference other variables using Go template syntax `{{.VAR_NAME}}`. They resolve at task execution time, not at parse time.

### Dynamic (Shell) Variables

```yaml
vars:
  VERSION:
    sh: git describe --tags --always --dirty
  COMMIT:
    sh: git rev-parse --short HEAD
  BUILD_TIME:
    sh: date -u +%Y-%m-%dT%H:%M:%SZ
  BRANCH:
    sh: git branch --show-current
  GO_FILES:
    sh: find . -name '*.go' -not -path './vendor/*' | tr '\n' ' '
  CHANGED_FILES:
    sh: git diff --name-only HEAD~1

tasks:
  build:
    cmds:
      - go build -ldflags "-X main.version={{.VERSION}} -X main.commit={{.COMMIT}}" -o {{.GO_BINARY}} ./cmd/{{.APP_NAME}}
```

The `sh:` key runs a shell command and captures its stdout as the variable value. Dynamic variables are evaluated when the task is invoked — not when the Taskfile is loaded. This means `git describe` runs fresh every time.

### Environment Variables

```yaml
env:
  CGO_ENABLED: '0'
  GOFLAGS: '-trimpath'
  GOOS: linux
  GOARCH: amd64

tasks:
  build:
    desc: Build for Linux
    cmds:
      - go build -o {{.GO_BINARY}} ./cmd/{{.APP_NAME}}

  build-mac:
    desc: Build for macOS
    env:
      GOOS: darwin
      GOARCH: arm64
    cmds:
      - go build -o {{.GO_BINARY}}-darwin ./cmd/{{.APP_NAME}}
```

Global `env:` sets environment variables for all tasks. Task-level `env:` overrides globals for that specific task. Environment variables are available to shell commands but not to Go template expressions — use `vars:` for template interpolation.

### Task-Level Variables

```yaml
tasks:
  greet:
    desc: Greet someone
    vars:
      NAME: '{{.NAME | default "World"}}'
      GREETING: '{{.GREETING | default "Hello"}}'
    cmds:
      - echo "{{.GREETING}}, {{.NAME}}!"

  greet-team:
    cmds:
      - task: greet
        vars:
          NAME: Alice
          GREETING: Hey
      - task: greet
        vars:
          NAME: Bob
```

Task-level `vars:` provide defaults that can be overridden by CLI arguments or by the calling task's `vars:` block.

### CLI Variable Overrides

```bash
# Override any variable from the command line
task build VERSION=1.2.3
task docker-push DOCKER_REGISTRY=docker.io/myuser
task greet NAME=Alice GREETING="Good morning"

# Environment variables also work
VERSION=1.2.3 task build
```

CLI overrides have the highest precedence — they always win over Taskfile-defined values.

## Dependencies

Dependencies define tasks that must complete before the current task runs. By default, all dependencies run in parallel.

### Parallel Dependencies

```yaml
tasks:
  setup:
    desc: Install all dependencies (parallel)
    deps:
      - install-go-deps
      - install-npm-deps
      - install-tools

  install-go-deps:
    cmds:
      - go mod download

  install-npm-deps:
    cmds:
      - npm ci

  install-tools:
    cmds:
      - go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
      - go install github.com/air-verse/air@latest
```

When you run `task setup`, all three `install-*` tasks start simultaneously. Task waits for all dependencies to finish before continuing, even if one fails (unless `failfast: true` is set).

### Dependencies with Variables

```yaml
tasks:
  deploy:
    deps:
      - task: build
        vars:
          GOOS: linux
          GOARCH: amd64
      - task: build
        vars:
          GOOS: darwin
          GOARCH: arm64
    cmds:
      - echo "Both builds complete, deploying..."
```

### Sequential Execution

Commands within a task (`cmds:`) always run sequentially. For sequential task execution, use `task:` calls inside `cmds:`:

```yaml
tasks:
  ci:
    desc: Run full CI pipeline (sequential)
    cmds:
      - task: lint
      - task: test
      - task: build
      - task: docker-build

  release:
    desc: Full release pipeline
    cmds:
      - task: ci             # Run CI first
      - task: docker-push    # Push image
      - task: deploy         # Deploy to staging
```

The distinction matters: `deps:` runs in parallel (good for independent setup tasks), while `cmds: [task: ...]` runs sequentially (good for pipelines where order matters).

## Preconditions

Preconditions are safety gates — they check a condition before the task runs and abort with a message if it fails. Unlike `status:`, a failed precondition fails the task and all tasks that depend on it.

```yaml
tasks:
  deploy:
    desc: Deploy to production
    preconditions:
      - sh: test -n "$DEPLOY_TOKEN"
        msg: "DEPLOY_TOKEN environment variable is required"
      - sh: git diff --quiet
        msg: "Working directory must be clean (commit or stash changes)"
      - sh: '[ "$(git branch --show-current)" = "main" ]'
        msg: "Must be on main branch to deploy"
      - sh: command -v kubectl
        msg: "kubectl is not installed"
    cmds:
      - kubectl apply -f k8s/
      - echo "Deployed successfully"

  db-migrate:
    desc: Run database migrations
    preconditions:
      - sh: test -n "$DATABASE_URL"
        msg: "DATABASE_URL must be set"
      - sh: pg_isready -h $DB_HOST -p $DB_PORT
        msg: "Database is not reachable at $DB_HOST:$DB_PORT"
    cmds:
      - migrate -path ./migrations -database "$DATABASE_URL" up
```

Preconditions are the right place for:
- Environment variable checks
- Tool availability checks
- Git state validation (clean tree, correct branch)
- Service reachability checks
- File existence checks

## Status: Incremental Builds

The `status:` field defines conditions that determine if a task is already up-to-date. If all status commands return exit code 0, the task is skipped:

```yaml
tasks:
  build:
    desc: Build the binary
    sources:
      - '**/*.go'
      - go.mod
      - go.sum
    generates:
      - bin/{{.APP_NAME}}
    cmds:
      - go build -o bin/{{.APP_NAME}} ./cmd/{{.APP_NAME}}

  generate-proto:
    desc: Generate protobuf code
    status:
      - test -f pkg/proto/service.pb.go
      - '[ pkg/proto/service.pb.go -nt proto/service.proto ]'
    cmds:
      - protoc --go_out=. proto/service.proto
```

The `sources:` and `generates:` fields provide a fingerprint-based approach — Task hashes the source files and skips execution if the hash matches the last run. The `status:` field provides custom skip logic for cases where file hashing is not sufficient.

```yaml
tasks:
  docker-build:
    desc: Build Docker image (skip if exists)
    status:
      - docker image inspect {{.DOCKER_IMAGE}}:{{.VERSION}} > /dev/null 2>&1
    cmds:
      - docker build -t {{.DOCKER_IMAGE}}:{{.VERSION}} .
```

## Dotenv Files

Load environment variables from `.env` files:

```yaml
version: '3'

dotenv:
  - '.env'
  - '.env.local'
  - '.env.{{.ENV}}'

vars:
  ENV: '{{.ENV | default "development"}}'

tasks:
  serve:
    cmds:
      - echo "Running with DB=$DATABASE_URL"
      - go run ./cmd/server
```

Files listed in `dotenv:` are loaded in order. Later files override earlier ones. This lets you layer environment configuration: `.env` for defaults, `.env.local` for developer overrides, `.env.production` for deployment.

## Included Taskfiles

Split large Taskfiles into modular components:

```yaml
# Taskfile.yml
version: '3'

includes:
  docker:
    taskfile: ./taskfiles/Docker.yml
    vars:
      REGISTRY: ghcr.io/myorg
  k8s:
    taskfile: ./taskfiles/Kubernetes.yml
    dir: ./k8s
  test:
    taskfile: ./taskfiles/Test.yml
```

```yaml
# taskfiles/Docker.yml
version: '3'

tasks:
  build:
    cmds:
      - docker build -t {{.REGISTRY}}/{{.APP_NAME}}:{{.VERSION}} .

  push:
    deps: [build]
    cmds:
      - docker push {{.REGISTRY}}/{{.APP_NAME}}:{{.VERSION}}
```

```bash
# Run included tasks with namespace prefix
task docker:build
task docker:push
task k8s:deploy
task test:unit
```

## Real-World Example: Complete Build Pipeline

```yaml
# Taskfile.yml
version: '3'

vars:
  APP_NAME: myapp
  VERSION:
    sh: git describe --tags --always --dirty
  COMMIT:
    sh: git rev-parse --short HEAD
  DOCKER_IMAGE: ghcr.io/myorg/{{.APP_NAME}}

env:
  CGO_ENABLED: '0'

tasks:
  default:
    desc: Show available tasks
    cmds:
      - task --list

  setup:
    desc: Install all dependencies
    deps: [install-go-deps, install-tools]

  install-go-deps:
    cmds:
      - go mod download
    sources:
      - go.mod
      - go.sum

  install-tools:
    cmds:
      - go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
    status:
      - command -v golangci-lint

  lint:
    desc: Run linters
    deps: [install-tools]
    cmds:
      - golangci-lint run ./...

  test:
    desc: Run tests
    cmds:
      - go test -race -coverprofile=coverage.out ./...
    sources:
      - '**/*.go'

  build:
    desc: Build binary
    deps: [setup]
    cmds:
      - go build -ldflags "-X main.version={{.VERSION}} -X main.commit={{.COMMIT}}" -o bin/{{.APP_NAME}} ./cmd/{{.APP_NAME}}
    sources:
      - '**/*.go'
      - go.mod
    generates:
      - bin/{{.APP_NAME}}

  ci:
    desc: Run full CI pipeline
    cmds:
      - task: lint
      - task: test
      - task: build

  docker:
    desc: Build Docker image
    cmds:
      - docker build -t {{.DOCKER_IMAGE}}:{{.VERSION}} -t {{.DOCKER_IMAGE}}:latest .

  release:
    desc: Build and push release
    preconditions:
      - sh: git diff --quiet
        msg: "Uncommitted changes. Commit or stash first."
      - sh: '[ "$(git branch --show-current)" = "main" ]'
        msg: "Must be on main branch"
    cmds:
      - task: ci
      - task: docker
      - docker push {{.DOCKER_IMAGE}}:{{.VERSION}}
      - docker push {{.DOCKER_IMAGE}}:latest

  clean:
    desc: Remove build artifacts
    cmds:
      - rm -rf bin/ coverage.out
```

## Best Practices

- Use `sh:` variables for any value that comes from the environment — Git version, timestamps, file lists, current branch. These stay fresh across invocations.
- Use `deps:` for independent parallel tasks (installing dependencies) and `cmds: [task: ...]` for sequential pipelines (lint then test then build).
- Use `preconditions:` for safety checks before destructive operations. A precondition failure stops the task and all dependents.
- Use `sources:` and `generates:` for incremental builds. Avoid re-building unchanged code.
- Provide `default:` values for optional variables with `{{.VAR | default "value"}}` to make tasks work without explicit overrides.
- Split large Taskfiles using `includes:` — one file per concern (Docker, Kubernetes, testing).
- Use the `default` task to show available tasks: `cmds: [task --list]`.
- Keep `env:` for shell environment variables and `vars:` for template values. Do not confuse the two scopes.

## Common Pitfalls

- Confusing `deps:` (parallel) with sequential `cmds:`. If order matters, use `cmds: [task: lint, task: test, task: build]`, not `deps: [lint, test, build]`.
- Forgetting that `sh:` variables execute a shell command. `VERSION: v1.0` is a static string; `VERSION: { sh: echo v1.0 }` runs a shell command. The syntax difference is subtle.
- Not providing default values for optional variables — tasks fail with empty string interpolation when the variable is not set.
- Missing preconditions on destructive tasks — `task deploy` without a branch check or clean-tree check leads to accidental deployments.
- Putting dynamic variables in `env:` instead of `vars:` — environment variables do not support `sh:` syntax. Use `vars:` with `sh:` for computed values.
- Not using `sources:`/`generates:` for expensive tasks — every invocation re-runs, wasting time on unchanged code.
- Circular dependencies — Task A depends on B which depends on A. Taskfile detects this at runtime and fails with an error.
