---
id: jest-mock-cleanup
stackId: jest
type: rule
name: Mock Cleanup and Isolation Rules
description: >-
  Enforce proper mock cleanup between Jest tests — restoreAllMocks in afterEach,
  no mock leakage, and predictable test isolation for reliable parallel
  execution.
difficulty: intermediate
globs:
  - '**/*.test.ts'
  - '**/*.test.tsx'
  - '**/*.spec.ts'
  - '**/*.spec.tsx'
  - '**/jest.config.*'
tags:
  - mock-cleanup
  - test-isolation
  - flaky-tests
  - afterEach
  - jest
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
  - question: Why do my Jest mocks leak between tests?
    answer: >-
      Mock state (calls, return values) persists between tests unless explicitly
      cleared. Add restoreMocks: true to jest.config.ts or call
      jest.restoreAllMocks() in afterEach. Without cleanup, test B sees mock
      calls from test A, causing assertion failures.
  - question: 'What is the difference between clearMocks, resetMocks, and restoreMocks?'
    answer: >-
      clearMocks clears mock.calls and mock.results but keeps the mock
      implementation. resetMocks also resets the implementation to jest.fn().
      restoreMocks goes further — it restores spyOn targets to their original
      implementation. Use restoreMocks for the most thorough cleanup.
relatedItems:
  - jest-test-structure
  - jest-coverage-rules
  - jest-mocking-mastery
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mock Cleanup and Isolation Rules

## Rule
All Jest tests MUST clean up mocks and shared state between test runs. Mock leakage between tests is the #1 cause of flaky test suites.

## Required Cleanup Pattern
```typescript
// jest.config.ts — global cleanup
export default {
  restoreMocks: true,    // Restore original implementations
  clearMocks: true,      // Clear mock.calls and mock.results
  resetModules: true,    // Reset module registry between tests
};
```

Or per test file:
```typescript
afterEach(() => {
  jest.restoreAllMocks();
});
```

## Mock Lifecycle

### Good — Scoped Mock
```typescript
describe('PaymentService', () => {
  let mockStripe: jest.Mocked<StripeClient>;

  beforeEach(() => {
    mockStripe = {
      charge: jest.fn().mockResolvedValue({ id: 'ch_123' }),
      refund: jest.fn().mockResolvedValue({ id: 're_456' }),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('processes payment', async () => {
    const result = await processPayment(mockStripe, 100);
    expect(mockStripe.charge).toHaveBeenCalledWith(100);
  });

  test('handles refund', async () => {
    // mockStripe is fresh — no state from previous test
    const result = await processRefund(mockStripe, 'ch_123');
    expect(mockStripe.refund).toHaveBeenCalledWith('ch_123');
  });
});
```

### Bad — Leaking Mock
```typescript
// Mock configured once, never cleaned up
const mockFetch = jest.fn().mockResolvedValue({ ok: true });

test('test A', async () => {
  await fetchData();
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test('test B', async () => {
  await fetchData();
  // FAILS! mockFetch.calls includes calls from test A
  expect(mockFetch).toHaveBeenCalledTimes(1); // Actually 2
});
```

## Rules
1. **restoreAllMocks** in afterEach or via jest.config.ts `restoreMocks: true`
2. **Never** share mock state between tests without explicit cleanup
3. **jest.spyOn** must be paired with `spy.mockRestore()` or global restore
4. **jest.useFakeTimers** must be paired with `jest.useRealTimers()` in afterEach
5. **Module mocks** (`jest.mock()`) are automatically reset between test files (not tests)

## Anti-Patterns
- Configuring mocks in global scope without afterEach cleanup
- Using `jest.fn()` at module level without resetting between tests
- Forgetting to restore spies (original implementation permanently replaced)
- Relying on test execution order for mock state
