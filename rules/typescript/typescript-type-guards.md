---
id: typescript-type-guards
stackId: typescript
type: rule
name: Type Guards and Narrowing Patterns
description: >-
  Use TypeScript type guards effectively — typeof, instanceof, in operator,
  discriminated unions, and custom type predicates for safe runtime type
  checking with compile-time guarantees.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.tsx'
tags:
  - type-guards
  - narrowing
  - discriminated-unions
  - type-predicates
  - type-safety
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
languages:
  - typescript
faq:
  - question: What are discriminated unions in TypeScript and when should I use them?
    answer: >-
      Discriminated unions are union types where each member has a common
      literal property (the discriminant) like 'kind' or 'type'. TypeScript
      narrows the type based on this property in switch/if statements. Use them
      for domain types with distinct variants: API responses, state machines,
      AST nodes, or any type with multiple shapes.
  - question: Why should I avoid 'as' type assertions in TypeScript?
    answer: >-
      Type assertions ('as Type') tell TypeScript to trust you without any
      runtime verification. If the actual value doesn't match the asserted type,
      you get runtime errors that TypeScript should have caught. Use type guards
      (typeof, instanceof, custom predicates) for safe narrowing with actual
      runtime checks.
relatedItems:
  - typescript-strict-mode
  - typescript-no-any
  - typescript-generics-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Type Guards and Narrowing Patterns

## Rule
Always use proper type guards for type narrowing. Prefer discriminated unions for complex types. Write custom type predicates for reusable validation logic. Never use type assertions (as) to bypass narrowing.

## Type Guard Methods
| Method | Use For | Example |
|--------|---------|---------|
| `typeof` | Primitives | `typeof x === "string"` |
| `instanceof` | Class instances | `x instanceof Error` |
| `in` operator | Property existence | `"name" in obj` |
| Discriminated union | Tagged types | `type.kind === "circle"` |
| Custom predicate | Reusable validation | `isUser(x)` |

## Good Examples
```typescript
// Discriminated union (best for domain types)
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "rectangle":
      return shape.width * shape.height;
    case "triangle":
      return (shape.base * shape.height) / 2;
  }
}

// Custom type predicate
interface User {
  id: string;
  name: string;
  email: string;
}

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "email" in value &&
    typeof (value as Record<string, unknown>).id === "string"
  );
}

// Usage
function processResponse(data: unknown): User {
  if (isUser(data)) {
    return data;  // TypeScript knows this is User
  }
  throw new Error("Invalid user data");
}

// Exhaustive checking with never
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}
```

## Bad Examples
```typescript
// BAD: Type assertion instead of narrowing
const user = response.data as User;  // No runtime check!
user.name;  // Crashes if data is not actually a User

// BAD: Non-exhaustive switch (missing cases)
function handle(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    // Missing rectangle and triangle!
  }
}

// BAD: Loose type check
function isUser(obj: any): boolean {  // Not a type predicate!
  return obj.name !== undefined;
  // Doesn't narrow the type — callers still need 'as User'
}
```

## Enforcement
- ESLint: @typescript-eslint/no-unsafe-assertion
- ESLint: @typescript-eslint/switch-exhaustiveness-check
- Use exhaustive switch with assertNever for discriminated unions
