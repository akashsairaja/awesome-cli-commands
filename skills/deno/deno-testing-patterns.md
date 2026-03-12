---
id: deno-testing-patterns
stackId: deno
type: skill
name: Deno Built-In Testing & Coverage
description: >-
  Use Deno's built-in test runner for unit tests, integration tests, and
  coverage reports — zero configuration, built-in assertions, mocking, and
  snapshot testing.
difficulty: beginner
tags:
  - testing
  - test-runner
  - assertions
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
  - Deno 2.0+
faq:
  - question: Does Deno have a built-in test runner?
    answer: >-
      Yes. Deno includes a complete test runner with assertions (@std/assert),
      mocking (@std/testing/mock), snapshot testing, code coverage, watch mode,
      and test filtering. No external testing framework is needed. Run tests
      with 'deno test' and generate coverage reports with 'deno coverage'.
  - question: How do I mock functions in Deno tests?
    answer: >-
      Use @std/testing/mock which provides spy() for observing calls, stub() for
      replacing function behavior, and assertSpyCalls() for verifying call
      counts. Always restore mocks in a finally block to prevent test pollution.
      The API is similar to sinon.js but built into Deno's standard library.
  - question: How do I generate test coverage reports in Deno?
    answer: >-
      Run 'deno test --coverage=./coverage' to collect coverage data, then 'deno
      coverage ./coverage' to display a text summary, or 'deno coverage
      ./coverage --lcov > coverage.lcov' to generate LCOV format for tools like
      Codecov or Coveralls. Coverage tracking is built-in with no additional
      packages needed.
relatedItems:
  - deno-permissions-security
  - deno-std-library
  - deno-deploy-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Deno Built-In Testing & Coverage

## Overview
Deno includes a full-featured test runner with assertions, mocking, snapshots, and coverage — zero additional packages needed. Write tests alongside your code and run them with `deno test`.

## Why This Matters
- **Zero config** — no Jest, Vitest, or testing framework to install
- **Built-in assertions** — standard library assertions out of the box
- **Built-in mocking** — spies, stubs, and fakes without sinon/jest.mock
- **Coverage** — native code coverage without nyc/c8
- **Permissions** — tests run with restricted permissions by default

## Step 1: Basic Test Structure
```typescript
// math.test.ts
import { assertEquals, assertThrows } from "@std/assert";
import { add, divide } from "./math.ts";

Deno.test("add - adds two numbers", () => {
  assertEquals(add(2, 3), 5);
  assertEquals(add(-1, 1), 0);
});

Deno.test("divide - throws on division by zero", () => {
  assertThrows(
    () => divide(10, 0),
    Error,
    "Cannot divide by zero"
  );
});
```

## Step 2: Async Tests
```typescript
Deno.test("fetchUser - returns user data", async () => {
  const user = await fetchUser("123");
  assertEquals(user.name, "Alice");
  assertEquals(user.email, "alice@example.com");
});
```

## Step 3: Test Organization with Steps
```typescript
Deno.test("UserService", async (t) => {
  await t.step("create - creates a new user", async () => {
    const user = await UserService.create({ name: "Alice" });
    assertEquals(user.name, "Alice");
  });

  await t.step("findById - returns existing user", async () => {
    const user = await UserService.findById("123");
    assertEquals(user.id, "123");
  });

  await t.step("delete - removes user", async () => {
    await UserService.delete("123");
    const user = await UserService.findById("123");
    assertEquals(user, null);
  });
});
```

## Step 4: Mocking and Spies
```typescript
import { stub, spy, assertSpyCalls } from "@std/testing/mock";

Deno.test("logger - calls console.log", () => {
  const logSpy = spy(console, "log");
  try {
    logger.info("test message");
    assertSpyCalls(logSpy, 1);
  } finally {
    logSpy.restore();
  }
});

Deno.test("fetchData - handles API errors", async () => {
  const fetchStub = stub(globalThis, "fetch", () =>
    Promise.resolve(new Response("Not Found", { status: 404 }))
  );
  try {
    const result = await fetchData("/api/users");
    assertEquals(result, null);
  } finally {
    fetchStub.restore();
  }
});
```

## Step 5: Running Tests
```bash
# Run all tests
deno test

# Run with permissions
deno test --allow-read --allow-net=localhost

# Run specific file
deno test tests/user.test.ts

# Filter by test name
deno test --filter "UserService"

# With coverage
deno test --coverage=./coverage
deno coverage ./coverage  # Generate report

# Watch mode
deno test --watch
```

## Best Practices
- Name test files with `.test.ts` or `_test.ts` suffix
- Use `t.step()` for organizing related tests
- Always restore mocks in a finally block
- Run tests with minimal permissions (same as production)
- Use `--coverage` in CI to track test coverage trends

## Common Mistakes
- Forgetting to restore stubs and spies (affects other tests)
- Not granting required permissions for test execution
- Using test-only dependencies when Deno std covers the use case
- Not using async/await for async test functions
