---
id: go-error-handling
stackId: go
type: rule
name: Error Handling Conventions
description: >-
  Handle every error explicitly in Go — never ignore returned errors, wrap
  errors with context using fmt.Errorf, and use errors.Is/As for type checking
  instead of string comparison.
difficulty: beginner
globs:
  - '**/*.go'
  - '**/go.mod'
  - '**/go.sum'
tags:
  - error-handling
  - fmt-errorf
  - errors-is
  - errors-as
  - go-idioms
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
  - question: Why must every Go error be handled explicitly?
    answer: >-
      Go deliberately chose explicit error handling over exceptions. Ignoring an
      error with _ means the program continues in an unknown state — potentially
      corrupting data, leaking resources, or producing wrong results silently.
      The errcheck linter catches discarded errors that could cause production
      incidents.
  - question: What is the difference between errors.Is and errors.As in Go?
    answer: >-
      errors.Is checks if any error in the chain matches a specific sentinel
      value (errors.Is(err, sql.ErrNoRows)). errors.As checks if any error in
      the chain matches a specific type and unwraps it (errors.As(err,
      &pathErr)). Both traverse wrapped error chains, unlike direct ==
      comparison.
relatedItems:
  - go-naming-conventions
  - go-interface-design
  - go-formatting-gofmt
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Error Handling Conventions

## Rule
Every error returned by a function MUST be checked. Never use `_` to discard errors in production code. Wrap errors with context using `fmt.Errorf` and the `%w` verb.

## Format
```go
result, err := doSomething()
if err != nil {
    return fmt.Errorf("doing something for %s: %w", id, err)
}
```

## Good Examples
```go
// Wrap errors with context
func ProcessOrder(orderID string) error {
    order, err := db.GetOrder(orderID)
    if err != nil {
        return fmt.Errorf("fetching order %s: %w", orderID, err)
    }

    if err := validateOrder(order); err != nil {
        return fmt.Errorf("validating order %s: %w", orderID, err)
    }

    if err := chargePayment(order); err != nil {
        return fmt.Errorf("charging payment for order %s: %w", orderID, err)
    }

    return nil
}

// Check error types with errors.Is / errors.As
if errors.Is(err, sql.ErrNoRows) {
    return nil, ErrNotFound
}

var pathErr *os.PathError
if errors.As(err, &pathErr) {
    log.Printf("path error on %s: %v", pathErr.Path, pathErr.Err)
}
```

## Bad Examples
```go
// BAD: Discarding errors
data, _ := json.Marshal(obj)

// BAD: No context in error wrapping
if err != nil {
    return err  // Caller has no idea where this failed
}

// BAD: String comparison for error checking
if err.Error() == "not found" {  // Fragile, breaks on message changes
    return nil
}

// BAD: Panic for recoverable errors
data, err := ioutil.ReadFile(path)
if err != nil {
    panic(err)  // Crashes the entire program
}
```

## Enforcement
- Use `errcheck` linter to catch unchecked errors
- Use `go vet` for error handling issues
- Configure golangci-lint with errorlint, wrapcheck rules
