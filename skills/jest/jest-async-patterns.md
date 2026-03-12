---
id: jest-async-patterns
stackId: jest
type: skill
name: Async Testing Patterns
description: >-
  Test asynchronous code reliably in Jest — Promises, async/await, callbacks,
  timers, and event-driven architectures with proper error handling and timeout
  management.
difficulty: intermediate
tags:
  - async
  - promises
  - timers
  - event-driven
  - jest
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Jest 29+
  - Understanding of JavaScript async patterns
faq:
  - question: How do I test async functions in Jest?
    answer: >-
      Use async/await in your test function: 'test("name", async () => { const
      result = await myAsyncFn(); expect(result).toBe(expected); })'. For error
      testing, use 'await expect(fn()).rejects.toThrow()'. Always await async
      operations to prevent false positives.
  - question: How do I test setTimeout and setInterval in Jest?
    answer: >-
      Use jest.useFakeTimers() to replace real timers with controllable fakes.
      Advance time with jest.advanceTimersByTime(ms) or jest.runAllTimers().
      Always call jest.useRealTimers() in afterEach to clean up.
  - question: Why do my Jest async tests pass even when they should fail?
    answer: >-
      Most likely you forgot to await or return the async operation. Without
      await, the test completes before the assertion runs. Add
      'expect.assertions(1)' at the start of async tests to ensure your
      assertion actually executes.
relatedItems:
  - jest-mocking-mastery
  - jest-testing-strategist
  - jest-custom-matchers
version: 1.0.0
lastUpdated: '2026-03-11'
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
