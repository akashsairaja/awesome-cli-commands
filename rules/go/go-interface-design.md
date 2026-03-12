---
id: go-interface-design
stackId: go
type: rule
name: Interface Design Principles
description: >-
  Design Go interfaces the idiomatic way — accept interfaces, return structs,
  keep interfaces small, define them at the consumer side, and never export
  interfaces with only one implementation.
difficulty: intermediate
globs:
  - '**/*.go'
  - '**/go.mod'
tags:
  - interfaces
  - design-patterns
  - abstraction
  - dependency-injection
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
  - question: Why should Go interfaces be defined at the consumer side?
    answer: >-
      Consumer-side interfaces follow the dependency inversion principle
      naturally. The consumer knows exactly what methods it needs — no more, no
      less. This creates minimal coupling, makes testing easy (mock only what
      you use), and avoids the 'fat interface' problem where implementations
      must satisfy methods they don't need.
  - question: Why should Go functions return concrete types instead of interfaces?
    answer: >-
      Returning concrete types gives callers maximum flexibility — they can use
      the full type or assign it to any compatible interface. Returning an
      interface restricts callers to only those methods and hides useful fields.
      The consumer should decide the abstraction level, not the provider.
relatedItems:
  - go-error-handling
  - go-naming-conventions
  - go-formatting-gofmt
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Interface Design Principles

## Rule
Define interfaces at the consumer side, not the implementation side. Keep interfaces small (1-3 methods). Accept interfaces, return concrete types. Never create interfaces preemptively.

## Good Examples
```go
// Consumer defines the interface it needs
package order

// Only the methods order package actually calls
type PaymentProcessor interface {
    Charge(ctx context.Context, amount int64, currency string) (string, error)
}

type Service struct {
    payments PaymentProcessor  // Depends on interface
}

func NewService(p PaymentProcessor) *Service {
    return &Service{payments: p}  // Returns concrete type
}
```

```go
// Small, focused interfaces
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// Compose when needed
type ReadWriter interface {
    Reader
    Writer
}
```

## Bad Examples
```go
// BAD: Interface defined at implementation side
package payment

type Processor interface {  // Don't export from implementation package
    Charge(ctx context.Context, amount int64, currency string) (string, error)
    Refund(ctx context.Context, chargeID string) error
    GetBalance(ctx context.Context) (int64, error)
    ListTransactions(ctx context.Context) ([]Transaction, error)
}

// BAD: Fat interface — too many methods
type Repository interface {
    Create(ctx context.Context, u *User) error
    Update(ctx context.Context, u *User) error
    Delete(ctx context.Context, id string) error
    GetByID(ctx context.Context, id string) (*User, error)
    GetByEmail(ctx context.Context, email string) (*User, error)
    List(ctx context.Context, filter Filter) ([]*User, error)
    Count(ctx context.Context) (int64, error)
}
// Split into smaller interfaces consumed by different packages

// BAD: Returning interface instead of concrete type
func NewService() ServiceInterface { ... }  // Return *Service instead
```

## The Go Proverb
> "The bigger the interface, the weaker the abstraction." — Rob Pike

## Enforcement
- Code review: verify interfaces are defined at consumer, not provider
- Lint: flag exported interfaces with only one implementation
- Prefer 1-3 method interfaces — split larger ones
