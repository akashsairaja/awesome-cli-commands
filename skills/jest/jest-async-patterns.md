---
id: jest-async-patterns
stackId: jest
type: skill
name: Async Testing Patterns
description: >-
  Test asynchronous code reliably in Jest — Promises, async/await, callbacks,
  timers, and event-driven architectures with proper error handling and
  timeout management.
difficulty: intermediate
tags:
  - jest
  - async
  - testing
  - patterns
  - api
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
  - question: "When should I use the Async Testing Patterns skill?"
    answer: >-
      Test asynchronous code reliably in Jest — Promises, async/await,
      callbacks, timers, and event-driven architectures with proper error
      handling and timeout management. It includes practical examples for
      JavaScript testing development.
  - question: "What tools and setup does Async Testing Patterns require?"
    answer: >-
      Requires Jest installed. Works with Jest projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Async Testing Patterns

## Overview
Most JavaScript code is asynchronous — API calls, database queries, timers, events. Testing async code requires specific patterns to avoid false positives, unhandled rejections, and timing issues.

## Why This Matters
- **False positives** — async assertions that run after the test completes
- **Unhandled rejections** — errors swallowed instead of failing the test
- **Timer issues** — setTimeout/setInterval behave differently in tests
- **Race conditions** — tests that pass sometimes and fail randomly

## How It Works

### async/await (Preferred)
```typescript
test('fetches user data', async () => {
  const user = await fetchUser('123');
  expect(user.name).toBe('Alice');
});

test('handles fetch error', async () => {
  await expect(fetchUser('invalid')).rejects.toThrow('Not found');
});
```

### Promise-Based
```typescript
test('resolves with data', () => {
  return fetchUser('123').then(user => {
    expect(user.name).toBe('Alice');
  });
});

test('rejects with error', () => {
  return expect(fetchUser('bad')).rejects.toThrow('Not found');
});
```

### Testing Timers
```typescript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test('debounce triggers after delay', () => {
  const callback = jest.fn();
  const debounced = debounce(callback, 500);

  debounced();
  expect(callback).not.toHaveBeenCalled();

  jest.advanceTimersByTime(500);
  expect(callback).toHaveBeenCalledTimes(1);
});

test('polling stops after max attempts', () => {
  const poll = startPolling(mockCheck, { interval: 1000, maxAttempts: 3 });

  jest.advanceTimersByTime(3000);
  expect(mockCheck).toHaveBeenCalledTimes(3);
});
```

### Testing Event Emitters
```typescript
test('emits data event', (done) => {
  const emitter = createDataStream();

  emitter.on('data', (chunk) => {
    expect(chunk).toBeDefined();
    done();
  });

  emitter.start();
});

// Better: async version
test('emits data event', async () => {
  const emitter = createDataStream();
  const dataPromise = new Promise(resolve => emitter.once('data', resolve));

  emitter.start();
  const chunk = await dataPromise;
  expect(chunk).toBeDefined();
});
```

### expect.assertions for Safety
```typescript
test('catches async errors', async () => {
  expect.assertions(2); // ensures both assertions run

  try {
    await riskyOperation();
  } catch (error) {
    expect(error).toBeInstanceOf(ValidationError);
    expect(error.message).toMatch(/invalid/);
  }
});
```

## Best Practices
- Always `return` or `await` async operations — never fire-and-forget
- Use `expect.assertions(n)` in try/catch tests to prevent false passes
- Prefer `async/await` over `.then()` chains for readability
- Use `jest.useFakeTimers()` for setTimeout/setInterval testing
- Test both success AND error paths for all async functions
- Set test-level timeouts for slow async operations: `test('name', fn, 10000)`

## Common Mistakes
- Forgetting to `await` an async assertion (test passes without running assertion)
- Not using `expect.assertions` in catch blocks (test passes if error is never thrown)
- Using real timers in tests (slow, non-deterministic)
- Not cleaning up fake timers in afterEach (leaks to other tests)
