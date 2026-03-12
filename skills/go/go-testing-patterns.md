---
id: go-testing-patterns
stackId: go
type: skill
name: Go Testing with Table-Driven Tests
description: >-
  Write effective Go tests — table-driven test patterns, subtests, test helpers,
  mocking with interfaces, benchmarks, and the testing package best practices.
difficulty: intermediate
tags:
  - testing
  - table-driven
  - benchmarks
  - mocking
  - coverage
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - go
prerequisites:
  - Go 1.21+
faq:
  - question: What are table-driven tests in Go?
    answer: >-
      Table-driven tests define test cases as a slice of structs, each
      containing inputs and expected outputs. A loop runs each case as a subtest
      with t.Run(). This pattern is idiomatic Go — it is concise, easy to add
      new cases, and produces clear test names in output.
  - question: How do I mock dependencies in Go tests?
    answer: >-
      Define dependencies as interfaces, then create mock implementations for
      tests. Go's implicit interface satisfaction means any struct with matching
      methods satisfies the interface — no mock generation framework needed. For
      complex mocking, use mockgen or testify/mock.
  - question: Should I use testify or the standard testing package?
    answer: >-
      The standard testing package is sufficient for most projects and keeps
      dependencies minimal. Use testify if you want assertion helpers
      (assert.Equal), mock generation, and suite-based test organization. Many
      Go teams prefer the standard library to avoid the dependency.
relatedItems:
  - go-error-handling-patterns
  - go-concurrency-patterns
  - go-interface-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Go Testing with Table-Driven Tests

## Overview
Go's testing package is built into the language with zero external dependencies. The table-driven test pattern is the idiomatic way to test multiple scenarios concisely.

## Why This Matters
- **Built-in** — no testing framework to install or configure
- **Table-driven** — clean pattern for testing multiple inputs
- **Benchmarking** — built-in performance testing with `go test -bench`
- **Coverage** — native coverage reporting with `go test -cover`

## Step 1: Table-Driven Tests
```go
func TestAdd(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive numbers", 2, 3, 5},
        {"negative numbers", -1, -2, -3},
        {"zero", 0, 0, 0},
        {"mixed signs", -5, 10, 5},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result := Add(tt.a, tt.b)
            if result != tt.expected {
                t.Errorf("Add(%d, %d) = %d, want %d", tt.a, tt.b, result, tt.expected)
            }
        })
    }
}
```

## Step 2: Test Helpers
```go
// t.Helper() marks this as a helper — errors show caller's line number
func assertEqual(t *testing.T, got, want interface{}) {
    t.Helper()
    if got != want {
        t.Errorf("got %v, want %v", got, want)
    }
}

func setupTestDB(t *testing.T) *Database {
    t.Helper()
    db, err := NewDatabase(":memory:")
    if err != nil {
        t.Fatalf("failed to create test db: %v", err)
    }
    t.Cleanup(func() { db.Close() })
    return db
}
```

## Step 3: Mocking with Interfaces
```go
// Define interface for the dependency
type UserRepository interface {
    FindByID(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

// Mock implementation for tests
type mockUserRepo struct {
    users map[string]*User
}

func (m *mockUserRepo) FindByID(_ context.Context, id string) (*User, error) {
    user, ok := m.users[id]
    if !ok {
        return nil, ErrNotFound
    }
    return user, nil
}

func TestUserService_GetUser(t *testing.T) {
    repo := &mockUserRepo{
        users: map[string]*User{"123": {ID: "123", Name: "Alice"}},
    }
    svc := NewUserService(repo)

    user, err := svc.GetUser(context.Background(), "123")
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if user.Name != "Alice" {
        t.Errorf("got name %q, want %q", user.Name, "Alice")
    }
}
```

## Step 4: Running Tests
```bash
# Run all tests
go test ./...

# Verbose output
go test -v ./...

# Run specific test
go test -run TestUserService ./pkg/users/

# With coverage
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out  # Visual report

# Race detector
go test -race ./...

# Benchmarks
go test -bench=. -benchmem ./...
```

## Best Practices
- Use table-driven tests for functions with multiple input/output scenarios
- Use `t.Helper()` in test helper functions
- Use `t.Cleanup()` for teardown (runs after test completes)
- Use `t.Parallel()` for independent tests
- Mock dependencies through interfaces, not concrete types
- Run with `-race` flag in CI to detect data races

## Common Mistakes
- Not using t.Helper() in helper functions (wrong line numbers in errors)
- Not running tests with -race flag (misses data races)
- Testing private functions instead of public API
- Complex test setup that should use test fixtures
