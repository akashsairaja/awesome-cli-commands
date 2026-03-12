---
id: typescript-type-guards
stackId: typescript
type: skill
name: TypeScript Type Guards & Narrowing
description: >-
  Implement type narrowing in TypeScript — typeof checks, instanceof,
  discriminated unions, custom type guard functions, and assertion functions for
  runtime type safety.
difficulty: intermediate
tags:
  - type-guards
  - narrowing
  - type-predicates
  - discriminated-unions
  - assertion-functions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - typescript
prerequisites:
  - TypeScript 5.0+
  - Understanding of union types
faq:
  - question: What is type narrowing in TypeScript?
    answer: >-
      Type narrowing is the process of refining a broad type to a more specific
      type within a code block. TypeScript automatically narrows types after
      typeof checks, instanceof checks, equality checks, and custom type guard
      functions. This gives you full type safety without using 'as Type'
      assertions.
  - question: What is a type predicate in TypeScript?
    answer: >-
      A type predicate is a return type annotation of the form 'param is Type'
      on a function that returns boolean. It tells TypeScript that if the
      function returns true, the parameter has been narrowed to that specific
      type. Example: function isString(x: unknown): x is string { return typeof
      x === 'string'; }
  - question: How do I ensure exhaustive handling of union types?
    answer: >-
      Use the never type in a default case: assign the discriminant to a
      variable of type never. If a new variant is added to the union but not
      handled in the switch, TypeScript will error at compile time because the
      new variant cannot be assigned to never. This guarantees every variant is
      explicitly handled.
relatedItems:
  - typescript-generics-patterns
  - typescript-strict-config
  - typescript-no-any-rule
version: 1.0.0
lastUpdated: '2026-03-11'
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
