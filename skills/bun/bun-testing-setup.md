---
id: bun-testing-setup
stackId: bun
type: skill
name: Testing with Bun's Built-In Test Runner
description: >-
  Write and run tests with Bun's Jest-compatible test runner — assertions,
  mocking, snapshots, coverage, and lifecycle hooks with zero configuration.
difficulty: beginner
tags:
  - testing
  - bun-test
  - jest-compatible
  - mocking
  - coverage
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - typescript
  - javascript
prerequisites:
  - Bun 1.1+
faq:
  - question: Is Bun's test runner compatible with Jest?
    answer: >-
      Yes, Bun's test runner supports the same describe/it/expect API as Jest.
      Most Jest tests can run on Bun with minimal changes — replace jest imports
      with bun:test and update mock syntax. Bun runs tests 10-20x faster than
      Jest because it avoids the transpilation step and uses native execution.
  - question: How do I migrate from Jest to Bun's test runner?
    answer: >-
      Three steps: (1) Replace 'import { describe, it } from jest' with 'import
      { describe, it } from bun:test'. (2) Replace jest.fn() with mock() and
      jest.spyOn with spyOn from bun:test. (3) Replace jest.mock() with
      mock.module(). Most assertions (expect, toBe, toEqual) work identically.
  - question: Does Bun's test runner support code coverage?
    answer: >-
      Yes. Run 'bun test --coverage' to generate coverage reports. Bun tracks
      line, function, and branch coverage natively without external tools like
      nyc or c8. The coverage report appears in the terminal output and can be
      exported for CI/CD integration.
relatedItems:
  - bun-server-patterns
  - bun-bundler-config
  - bun-native-apis
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Testing with Bun's Built-In Test Runner

## Overview
Bun includes a Jest-compatible test runner that is significantly faster than Jest or Vitest. It supports the familiar describe/it/expect API, mocking, snapshots, and code coverage out of the box.

## Why This Matters
- **10-20x faster** than Jest for test execution
- **Jest-compatible** — same API, easy migration
- **Zero config** — no jest.config.js needed
- **Built-in mocking** — mock modules and functions natively
- **TypeScript native** — runs .ts test files directly

## Step 1: Write Tests
```typescript
// math.test.ts
import { describe, it, expect, beforeEach } from "bun:test";
import { Calculator } from "./calculator";

describe("Calculator", () => {
  let calc: Calculator;

  beforeEach(() => {
    calc = new Calculator();
  });

  it("adds two numbers", () => {
    expect(calc.add(2, 3)).toBe(5);
  });

  it("divides two numbers", () => {
    expect(calc.divide(10, 2)).toBe(5);
  });

  it("throws on division by zero", () => {
    expect(() => calc.divide(10, 0)).toThrow("Cannot divide by zero");
  });
});
```

## Step 2: Mocking
```typescript
import { describe, it, expect, mock, spyOn } from "bun:test";

// Mock a module
mock.module("./database", () => ({
  query: mock(() => [{ id: 1, name: "Alice" }]),
}));

// Spy on methods
describe("UserService", () => {
  it("logs user creation", () => {
    const logSpy = spyOn(console, "log");
    createUser({ name: "Bob" });
    expect(logSpy).toHaveBeenCalledWith("User created: Bob");
    logSpy.mockRestore();
  });
});

// Mock functions
const mockFetch = mock(() =>
  Promise.resolve(new Response(JSON.stringify({ data: "test" })))
);
```

## Step 3: Async & DOM Testing
```typescript
import { describe, it, expect } from "bun:test";

describe("API client", () => {
  it("fetches user data", async () => {
    const response = await fetch("http://localhost:3000/api/users/1");
    const user = await response.json();

    expect(response.status).toBe(200);
    expect(user).toEqual({
      id: 1,
      name: "Alice",
      email: "alice@example.com",
    });
  });
});
```

## Step 4: Running Tests
```bash
# Run all tests
bun test

# Run specific file
bun test src/utils.test.ts

# Filter by name
bun test --filter "Calculator"

# Watch mode
bun test --watch

# With coverage
bun test --coverage

# With timeout
bun test --timeout 10000
```

## Best Practices
- Use `bun:test` imports for built-in test utilities
- Structure tests with describe/it for clear organization
- Use beforeEach/afterEach for test isolation
- Mock external dependencies (database, HTTP, file system)
- Run with `--coverage` in CI to track test coverage

## Common Mistakes
- Importing from jest or vitest instead of bun:test
- Not cleaning up mocks between tests (test pollution)
- Running integration tests without proper setup/teardown
- Forgetting that bun test discovers *.test.ts files automatically
