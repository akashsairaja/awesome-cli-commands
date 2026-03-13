---
id: go-error-handling-patterns
stackId: go
type: skill
name: Go Error Handling Best Practices
description: >-
  Master Go error handling — error wrapping with fmt.Errorf, sentinel errors,
  custom error types, errors.Is/As for matching, and idiomatic patterns for
  clean error propagation.
difficulty: beginner
tags:
  - go
  - error
  - handling
  - best
  - practices
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
  - question: "When should I use the Go Error Handling Best Practices skill?"
    answer: >-
      Master Go error handling — error wrapping with fmt.Errorf, sentinel
      errors, custom error types, errors.Is/As for matching, and idiomatic
      patterns for clean error propagation. This skill provides a structured
      workflow for concurrency patterns, error handling, testing, and
      microservice development.
  - question: "What tools and setup does Go Error Handling Best Practices require?"
    answer: >-
      Works with standard Go tooling (Go toolchain (go build, go test). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Go Error Handling Best Practices

## Overview
Go handles errors as values returned from functions, not exceptions. This makes error handling explicit and forces developers to consider failure modes at every call site.

## Why This Matters
- **Explicit** — every error path is visible in the code
- **No hidden control flow** — no try/catch surprises
- **Composable** — error wrapping builds context chains
- **Standard** — consistent pattern across the entire Go ecosystem

## Step 1: Basic Error Handling
```go
import (
    "errors"
    "fmt"
    "os"
)

func readConfig(path string) ([]byte, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("reading config %s: %w", path, err)
    }
    return data, nil
}

func main() {
    data, err := readConfig("config.json")
    if err != nil {
        log.Fatal(err) // reading config config.json: open config.json: no such file or directory
    }
    fmt.Println(string(data))
}
```

## Step 2: Sentinel Errors
```go
// Define package-level sentinel errors
var (
    ErrNotFound     = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrConflict     = errors.New("conflict")
)

func FindUser(id string) (*User, error) {
    user, err := db.Query(id)
    if err != nil {
        return nil, fmt.Errorf("finding user %s: %w", id, err)
    }
    if user == nil {
        return nil, fmt.Errorf("user %s: %w", id, ErrNotFound)
    }
    return user, nil
}

// Check with errors.Is — works through wrapping chains
if errors.Is(err, ErrNotFound) {
    http.Error(w, "User not found", http.StatusNotFound)
}
```

## Step 3: Custom Error Types
```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error on %s: %s", e.Field, e.Message)
}

func ValidateUser(u *User) error {
    if u.Email == "" {
        return &ValidationError{Field: "email", Message: "required"}
    }
    return nil
}

// Extract with errors.As
var valErr *ValidationError
if errors.As(err, &valErr) {
    fmt.Printf("Invalid field: %s\n", valErr.Field)
}
```

## Step 4: Error Wrapping Chain
```go
// Build context as errors propagate up the call stack
func (s *OrderService) PlaceOrder(ctx context.Context, req OrderRequest) error {
    user, err := s.users.FindByID(ctx, req.UserID)
    if err != nil {
        return fmt.Errorf("placing order: finding user: %w", err)
    }

    if err := s.inventory.Reserve(ctx, req.Items); err != nil {
        return fmt.Errorf("placing order: reserving inventory: %w", err)
    }

    if err := s.payments.Charge(ctx, user, req.Total); err != nil {
        return fmt.Errorf("placing order: charging payment: %w", err)
    }

    return nil
}
// Error: placing order: charging payment: stripe: card declined
```

## Best Practices
- Always wrap errors with context: `fmt.Errorf("doing X: %w", err)`
- Use `%w` verb for wrapping (enables errors.Is/As matching)
- Define sentinel errors for expected failure cases
- Use custom error types when callers need structured error data
- Check specific errors with `errors.Is` and `errors.As`
- Handle errors immediately — don't defer error checking

## Common Mistakes
- Using `%v` instead of `%w` in fmt.Errorf (loses error chain)
- Ignoring errors with `_` in production code
- Logging and returning the same error (duplicate log entries)
- Wrapping errors without adding useful context
- Using panic for recoverable errors
