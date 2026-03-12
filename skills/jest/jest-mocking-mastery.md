---
id: jest-mocking-mastery
stackId: jest
type: skill
name: Mocking Strategies with jest.mock and spyOn
description: >-
  Master Jest mocking — learn when to use jest.mock, jest.spyOn, and manual
  mocks to isolate units under test while keeping tests maintainable and
  meaningful.
difficulty: intermediate
tags:
  - mocking
  - jest-mock
  - spy-on
  - test-isolation
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
  - TypeScript (recommended)
  - Module system basics
faq:
  - question: What is the difference between jest.mock and jest.spyOn?
    answer: >-
      jest.mock() replaces an entire module with mock implementations — all
      exports become jest.fn(). jest.spyOn() wraps a single method on an
      existing object, letting you monitor calls or override behavior while
      keeping other methods real. Use mock for external dependencies, spyOn for
      partial mocking.
  - question: How do I mock async functions in Jest?
    answer: >-
      Use mockResolvedValue() for successful async returns and
      mockRejectedValue() for errors: mockFn.mockResolvedValue({ data: 'result'
      }) or mockFn.mockRejectedValue(new Error('fail')). For multiple calls,
      chain with mockResolvedValueOnce().
  - question: Why do my Jest mocks leak between tests?
    answer: >-
      Jest mocks persist across tests in the same file unless explicitly
      cleared. Add jest.restoreAllMocks() in an afterEach block, or set
      restoreMocks: true in jest.config.ts. This resets mock state and restores
      original implementations between tests.
relatedItems:
  - jest-async-patterns
  - jest-testing-strategist
  - jest-snapshot-testing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mocking Strategies with jest.mock and spyOn

## Overview
Mocking is the most powerful — and most misused — feature of Jest. The right mocking strategy isolates the unit under test while keeping tests meaningful. The wrong strategy creates tests that verify mocks instead of code.

## Why This Matters
- **Isolation** — test one module without its dependencies
- **Speed** — avoid real database, network, and file system calls
- **Determinism** — control external inputs for predictable tests
- **Focus** — verify specific interactions and side effects

## How It Works

### jest.mock() — Replace Entire Modules
```typescript
// Mock an entire module
jest.mock('./database');
import { getUser } from './database';

const mockedGetUser = jest.mocked(getUser);

test('returns user profile', async () => {
  mockedGetUser.mockResolvedValue({ id: '1', name: 'Alice' });

  const profile = await getUserProfile('1');
  expect(profile.name).toBe('Alice');
  expect(mockedGetUser).toHaveBeenCalledWith('1');
});
```

### jest.spyOn() — Partial Mocking
```typescript
// Mock one method, keep the rest real
import * as mathUtils from './mathUtils';

test('logs calculation result', () => {
  const spy = jest.spyOn(mathUtils, 'calculate').mockReturnValue(42);

  processData([1, 2, 3]);
  expect(spy).toHaveBeenCalledWith([1, 2, 3]);

  spy.mockRestore(); // restore original implementation
});
```

### Manual Mocks — Complex Module Replacements
```typescript
// __mocks__/axios.ts
const axios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => axios),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
};
export default axios;
```

### Mock Implementations
```typescript
// Different return values per call
mockFn
  .mockReturnValueOnce('first')
  .mockReturnValueOnce('second')
  .mockReturnValue('default');

// Custom implementation
mockFn.mockImplementation((id: string) => {
  if (id === 'admin') return { role: 'admin' };
  return { role: 'user' };
});

// Async mocks
mockFn.mockResolvedValue({ data: 'success' });
mockFn.mockRejectedValue(new Error('Network error'));
```

## Best Practices
- Mock at module boundaries (API clients, databases) not internal helpers
- Use `jest.spyOn` when you need to keep the original implementation available
- Always call `mockRestore()` or use `jest.restoreAllMocks()` in `afterEach`
- Prefer `mockResolvedValue` over `mockImplementation(() => Promise.resolve())`
- Use `jest.mocked()` for type-safe mock access in TypeScript
- Verify mock calls with `toHaveBeenCalledWith` for interaction testing

## Common Mistakes
- Mocking the module under test (you should test it, not mock it)
- Forgetting to restore mocks — leaks between tests
- Over-mocking: if everything is mocked, the test verifies nothing
- Using `jest.fn()` without specifying return values (returns undefined)
- Not clearing mocks between tests (`jest.clearAllMocks()` in `afterEach`)
