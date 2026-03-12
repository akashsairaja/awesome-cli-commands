---
id: bun-test-patterns
stackId: bun
type: rule
name: Bun Test Conventions
description: >-
  Write tests using Bun's built-in test runner with proper conventions —
  describe/it blocks, expect assertions, lifecycle hooks, and snapshot testing
  patterns.
difficulty: beginner
globs:
  - '**/*.test.ts'
  - '**/*.spec.ts'
  - '**/bunfig.toml'
tags:
  - testing
  - bun-test
  - unit-tests
  - mocking
  - test-runner
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
  - question: 'Why use bun:test instead of Jest or Vitest?'
    answer: >-
      Bun's built-in test runner is zero-config, extremely fast (runs tests in
      Bun's native runtime), and compatible with Jest's expect API. It
      eliminates the need for separate test framework dependencies, babel
      transforms, and complex configuration. Migration from Jest is
      straightforward.
  - question: How do I mock modules in Bun tests?
    answer: >-
      Use the mock() function from 'bun:test' for function mocks. For module
      mocking, use mock.module() to replace entire imports. Bun also supports
      spyOn() for method spying. The API is intentionally similar to Jest for
      easy migration.
relatedItems:
  - bun-config-conventions
  - bun-workspace-conventions
  - typescript-strict-mode
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Bun Test Conventions

## Rule
All Bun projects MUST use `bun:test` as the primary test runner. Tests must be colocated with source files or in a `__tests__` directory. Test files must match `*.test.ts` or `*.spec.ts`.

## Format
```typescript
import { describe, it, expect, beforeEach, mock } from "bun:test";

describe("ModuleName", () => {
  it("should do expected behavior", () => {
    expect(result).toBe(expected);
  });
});
```

## Good Examples
```typescript
import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import { UserService } from "./user-service";

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  describe("create", () => {
    it("should create a user with valid input", async () => {
      const user = await service.create({
        name: "Alice",
        email: "alice@example.com",
      });
      expect(user.id).toBeDefined();
      expect(user.name).toBe("Alice");
    });

    it("should reject duplicate email addresses", async () => {
      await service.create({ name: "Alice", email: "alice@example.com" });
      expect(
        service.create({ name: "Bob", email: "alice@example.com" })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("mocking", () => {
    it("should mock fetch calls", async () => {
      const mockFetch = mock(() =>
        Promise.resolve(new Response(JSON.stringify({ ok: true })))
      );
      globalThis.fetch = mockFetch;

      await service.syncExternal();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
```

## Bad Examples
```typescript
// BAD: Using Jest when Bun has a built-in test runner
import { jest } from "@jest/globals";

// BAD: No describe blocks, flat test structure
test("works", () => { /* ... */ });
test("also works", () => { /* ... */ });

// BAD: No assertion — test always passes
it("should create user", async () => {
  await service.create({ name: "Alice" });
  // Missing expect()!
});
```

## Enforcement
- Configure bunfig.toml with coverage thresholds
- CI runs `bun test --coverage` with minimum thresholds
- Pre-commit hook: `bun test --only-changed`
