---
id: go-formatting-gofmt
stackId: go
type: rule
name: Mandatory gofmt Formatting
description: >-
  All Go code must be formatted with gofmt — no exceptions, no alternatives, no
  debates. Configure editors and CI to format automatically on save and reject
  unformatted code.
difficulty: beginner
globs:
  - '**/*.go'
  - '**/go.mod'
  - '**/.golangci.yml'
tags:
  - gofmt
  - formatting
  - code-style
  - goimports
  - consistency
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why is gofmt mandatory for all Go code?
    answer: >-
      gofmt eliminates all formatting debates — every Go project looks the same.
      This reduces code review friction (no style comments), simplifies tooling
      (consistent AST), and makes switching between Go projects effortless. The
      Go community consensus is absolute: 'gofmt is not optional.'
  - question: What is the difference between gofmt and goimports?
    answer: >-
      goimports does everything gofmt does (formatting) plus it manages import
      statements — removing unused imports, adding missing ones, and grouping
      them (standard library, third-party, internal). Most Go developers use
      goimports as their default formatter since it is a strict superset of
      gofmt.
relatedItems:
  - go-naming-conventions
  - go-error-handling
  - go-interface-design
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Mandatory gofmt Formatting

## Rule
ALL Go code MUST be formatted with `gofmt` (or `goimports` which includes gofmt). CI MUST reject code that is not gofmt-compliant. No project-specific style overrides.

## Format
```bash
# Format a file
gofmt -w main.go

# Format entire project
gofmt -w .

# Check without modifying (CI)
gofmt -l .  # Lists unformatted files
test -z "$(gofmt -l .)"  # Exit 1 if any unformatted

# goimports = gofmt + import organization
goimports -w .
```

## Good: Just Run gofmt
```go
// gofmt handles all formatting decisions:
// - Tabs for indentation
// - Alignment of struct fields
// - Spacing around operators
// - Brace placement
// - Import grouping (with goimports)

package main

import (
    "context"
    "fmt"
    "log"

    "github.com/myorg/myapp/internal/user"
    "github.com/myorg/myapp/internal/order"
)

type Config struct {
    Host    string
    Port    int
    Timeout time.Duration
}
```

## Bad: Fighting gofmt
```go
// BAD: Manually formatted — gofmt will rewrite this
package main
import (
  "fmt"      // 2-space indent — gofmt uses tabs
  "log"
)

type Config struct {
  Host string    // 2-space indent
  Port int
}
```

## Editor Setup
```json
// VS Code settings.json
{
  "[go]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "golang.go"
  },
  "go.formatTool": "goimports"
}
```

## Enforcement
- CI: `test -z "$(gofmt -l .)" || (echo "Run gofmt" && exit 1)`
- Pre-commit hook: run gofmt on staged .go files
- Editor: format on save with goimports
- golangci-lint includes gofmt check by default
