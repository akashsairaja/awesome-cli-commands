---
id: typescript-type-guards
stackId: typescript
type: skill
name: >-
  TypeScript Type Guards & Narrowing
description: >-
  Implement type narrowing in TypeScript — typeof checks, instanceof,
  discriminated unions, custom type guard functions, and assertion functions
  for runtime type safety.
difficulty: intermediate
tags:
  - typescript
  - type
  - guards
  - narrowing
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the TypeScript Type Guards & Narrowing skill?"
    answer: >-
      Implement type narrowing in TypeScript — typeof checks, instanceof,
      discriminated unions, custom type guard functions, and assertion
      functions for runtime type safety. It includes practical examples for
      TypeScript development.
  - question: "What tools and setup does TypeScript Type Guards & Narrowing require?"
    answer: >-
      Works with standard TypeScript tooling (TypeScript compiler (tsc),
      tsconfig.json). No special setup required beyond a working TypeScript
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# TypeScript Type Guards & Narrowing

## Overview
Type narrowing lets you refine a broad type (like `unknown` or a union) into a specific type within a code block. TypeScript automatically narrows types after guards, giving you full type safety without assertions.

## Why This Matters
- **No type assertions** — prove types are correct instead of asserting
- **Runtime safety** — type guards check at runtime AND inform the compiler
- **Exhaustiveness** — ensure every union variant is handled
- **Clean code** — no `as Type` casts scattered through your code

## Built-In Type Guards
```typescript
function process(value: string | number | boolean) {
  if (typeof value === 'string') {
    // TypeScript knows: value is string
    return value.toUpperCase();
  }
  if (typeof value === 'number') {
    // TypeScript knows: value is number
    return value.toFixed(2);
  }
  // TypeScript knows: value is boolean
  return value ? 'yes' : 'no';
}
```

## Custom Type Guard Functions
```typescript
interface User { type: 'user'; name: string; email: string; }
interface Admin { type: 'admin'; name: string; permissions: string[]; }
type Account = User | Admin;

// Type predicate — returns boolean but narrows the type
function isAdmin(account: Account): account is Admin {
  return account.type === 'admin';
}

function showPermissions(account: Account) {
  if (isAdmin(account)) {
    // TypeScript knows: account is Admin
    console.log(account.permissions);
  }
}
```

## Discriminated Union Narrowing
```typescript
type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: ApiResult<T>) {
  if (result.success) {
    // Narrowed to { success: true; data: T }
    console.log(result.data);
  } else {
    // Narrowed to { success: false; error: string }
    console.error(result.error);
  }
}
```

## Assertion Functions
```typescript
// Throws if condition is false, narrows type if true
function assertDefined<T>(
  value: T | null | undefined,
  message: string
): asserts value is T {
  if (value == null) {
    throw new Error(message);
  }
}

function processUser(user: User | null) {
  assertDefined(user, 'User is required');
  // After assertion: user is User (not null)
  console.log(user.name);
}
```

## Exhaustiveness Checking
```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2;
    case 'square': return shape.side ** 2;
    case 'triangle': return 0.5 * shape.base * shape.height;
    default:
      // If a new shape is added but not handled, this errors at compile time
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${_exhaustive}`);
  }
}
```

## Best Practices
- Use discriminated unions for state that can be in multiple forms
- Write custom type guards for complex validation logic
- Use `never` in default cases for exhaustive switches
- Prefer narrowing over type assertions (`as Type`)
- Use assertion functions for preconditions that should throw

## Common Mistakes
- Using `as Type` instead of proper narrowing (bypasses safety)
- Forgetting the `is` predicate return type in type guards
- Not handling all variants in a discriminated union switch
- Using `instanceof` with interfaces (only works with classes)
