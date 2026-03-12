---
id: typescript-no-any
stackId: typescript
type: rule
name: Ban the 'any' Type
description: >-
  Never use 'any' in TypeScript code — use unknown for truly unknown types,
  generics for flexible functions, union types for multiple options, and proper
  type narrowing instead.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/.eslintrc*'
  - '**/eslint.config.*'
tags:
  - no-any
  - unknown
  - generics
  - type-safety
  - type-narrowing
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
  - question: What is the difference between 'any' and 'unknown' in TypeScript?
    answer: >-
      any disables ALL type checking — you can do anything with an any value
      without TypeScript complaining. unknown is the type-safe counterpart: you
      can assign anything to unknown, but you MUST narrow the type before using
      it. unknown forces you to check the type, catching bugs at compile time
      instead of runtime.
  - question: When is it truly acceptable to use 'any' in TypeScript?
    answer: >-
      Almost never. The rare exceptions are: type-testing utilities, migration
      shims for JavaScript-to-TypeScript conversion (with a plan to remove), and
      working around genuinely broken third-party type definitions (file a bug
      upstream). Always use // @ts-expect-error with explanation instead of
      casting to any.
relatedItems:
  - typescript-strict-mode
  - typescript-type-guards
  - typescript-generics-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Ban the 'any' Type

## Rule
The `any` type MUST NOT be used in production TypeScript code. Use `unknown` for truly unknown types, generics for type-safe flexibility, and union types for known alternatives.

## Alternatives to 'any'
| Instead of | Use | When |
|-----------|-----|------|
| `any` | `unknown` | Truly unknown type (API response) |
| `any` | Generic `T` | Flexible but type-safe function |
| `any` | Union type | Known set of possible types |
| `any` | `Record<string, unknown>` | Unknown object shape |
| `any[]` | `unknown[]` | Unknown array contents |

## Good Examples
```typescript
// unknown + type narrowing
function processInput(input: unknown): string {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  if (typeof input === "number") {
    return input.toString();
  }
  throw new Error(`Unexpected input type: ${typeof input}`);
}

// Generics for type-safe flexibility
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Typed API response
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: number;
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  const response = await fetch(`/api/users/${id}`);
  return response.json() as Promise<ApiResponse<User>>;
}

// Record with unknown values
function logMetadata(meta: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(meta)) {
    console.log(`${key}: ${String(value)}`);
  }
}
```

## Bad Examples
```typescript
// BAD: any everywhere
function process(data: any): any {
  return data.map((item: any) => item.value);
}

// BAD: any as escape hatch
const result = someLibraryFunction() as any;
result.doSomething();  // No type checking at all

// BAD: any in generics
function wrapper<T = any>(value: T): T {
  return value;
}
```

## Enforcement
- ESLint: @typescript-eslint/no-explicit-any (error)
- ESLint: @typescript-eslint/no-unsafe-assignment (error)
- ESLint: @typescript-eslint/no-unsafe-member-access (error)
- tsconfig: "noImplicitAny": true (included in strict)
