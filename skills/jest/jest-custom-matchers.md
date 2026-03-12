---
id: jest-custom-matchers
stackId: jest
type: skill
name: Custom Matchers and Test Utilities
description: >-
  Create custom Jest matchers with expect.extend to build domain-specific
  assertions that make tests more expressive and reduce boilerplate across your
  test suite.
difficulty: advanced
tags:
  - custom-matchers
  - expect-extend
  - test-utilities
  - domain-testing
  - jest
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Jest 29+
  - TypeScript
  - Understanding of Jest expect API
faq:
  - question: What are custom Jest matchers?
    answer: >-
      Custom matchers extend Jest's expect() API with your own assertions.
      Instead of writing complex assertion logic in every test, you encapsulate
      it in a matcher like expect(response).toBeSuccessful(). They improve
      readability, reduce duplication, and provide clear error messages.
  - question: How do I add TypeScript support for custom Jest matchers?
    answer: >-
      Create a .d.ts declaration file that extends the jest.Matchers interface
      with your custom matcher signatures. Add it to your tsconfig.json includes
      or place it alongside your matcher implementation. This enables
      autocompletion and type checking in tests.
  - question: When should I create a custom matcher vs a helper function?
    answer: >-
      Create a custom matcher when the assertion is reused across many test
      files and benefits from the expect().not syntax and clear error messages.
      Use a helper function for complex setup/teardown logic or multi-step
      operations that are not purely assertions.
relatedItems:
  - jest-mocking-mastery
  - jest-async-patterns
  - jest-testing-strategist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Custom Matchers and Test Utilities

## Overview
Custom matchers extend Jest's `expect` API with domain-specific assertions. Instead of repeating complex assertion patterns across tests, encapsulate them in matchers like `expect(response).toBeSuccessful()` or `expect(date).toBeWithinDaysOf(other, 3)`.

## How It Works

### Creating a Custom Matcher
```typescript
// test-utils/matchers.ts
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    return {
      pass,
      message: () =>
        pass
          ? `expected "${received}" not to be a valid email`
          : `expected "${received}" to be a valid email address`,
    };
  },
});
```

### TypeScript Type Declarations
```typescript
// test-utils/matchers.d.ts
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeValidEmail(): R;
      toBeSuccessfulResponse(): R;
      toHaveValidationError(field: string): R;
    }
  }
}
export {};
```

### API Response Matchers
```typescript
expect.extend({
  toBeSuccessfulResponse(received: any) {
    const pass =
      received.status >= 200 &&
      received.status < 300 &&
      received.body?.success === true;
    return {
      pass,
      message: () =>
        `expected response with status ${received.status} ${
          pass ? 'not ' : ''
        }to be successful`,
    };
  },

  toHaveValidationError(received: any, field: string) {
    const errors = received.body?.errors || [];
    const pass = errors.some((e: any) => e.field === field);
    return {
      pass,
      message: () =>
        `expected response ${pass ? 'not ' : ''}to have validation error for field "${field}"`,
    };
  },
});
```

### Using Custom Matchers in Tests
```typescript
test('user age is valid', () => {
  expect(user.age).toBeWithinRange(18, 120);
});

test('registration creates valid email', () => {
  const user = registerUser({ name: 'Alice' });
  expect(user.email).toBeValidEmail();
});

test('API returns success', async () => {
  const response = await request(app).get('/api/users');
  expect(response).toBeSuccessfulResponse();
});

test('validates required fields', async () => {
  const response = await request(app).post('/api/users').send({});
  expect(response).toHaveValidationError('email');
  expect(response).toHaveValidationError('name');
});
```

### Setup for Global Use
```typescript
// jest.config.ts
export default {
  setupFilesAfterFramework: ['./test-utils/matchers.ts'],
};
```

## Best Practices
- Create matchers for assertions you repeat 3+ times across tests
- Always provide clear, actionable error messages (both pass and fail)
- Add TypeScript type declarations for IDE autocompletion
- Group related matchers in domain-specific files (api-matchers, date-matchers)
- Register globally in setupFilesAfterFramework, not per-test

## Common Mistakes
- Creating matchers for one-off assertions (use standard expect instead)
- Poor error messages that do not show received vs expected values
- Forgetting TypeScript declarations (no autocompletion, no type checking)
- Not handling the negation case (`.not.toBeValidEmail()` message)
