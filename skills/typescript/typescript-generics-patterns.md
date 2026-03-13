---
id: typescript-generics-patterns
stackId: typescript
type: skill
name: >-
  TypeScript Generics & Utility Types
description: >-
  Master TypeScript generics — type parameters, constraints, conditional
  types, mapped types, and building reusable utility types for type-safe
  libraries and APIs.
difficulty: beginner
tags:
  - typescript
  - generics
  - utility
  - types
  - api
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
  - question: "When should I use the TypeScript Generics & Utility Types skill?"
    answer: >-
      Master TypeScript generics — type parameters, constraints, conditional
      types, mapped types, and building reusable utility types for type-safe
      libraries and APIs. This skill provides a structured workflow for
      advanced type patterns, strict configuration, generic constraints, and
      type-safe development.
  - question: "What tools and setup does TypeScript Generics & Utility Types require?"
    answer: >-
      Works with standard TypeScript tooling (TypeScript compiler (tsc),
      tsconfig.json). No special setup required beyond a working TypeScript
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# TypeScript Generics & Utility Types

## Overview
Generics let you write reusable types and functions that work with multiple data types while preserving type safety. Combined with conditional and mapped types, they enable powerful type transformations.

## Why This Matters
- **Type safety** — catch errors at compile time, not runtime
- **Code reuse** — one function works with any type
- **IDE experience** — full autocomplete through generic chains
- **Library design** — build flexible APIs without sacrificing types

## Step 1: Basic Generic Functions
```typescript
// Generic function — T is inferred from usage
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num = first([1, 2, 3]);     // type: number | undefined
const str = first(['a', 'b']);     // type: string | undefined
```

## Step 2: Generic Constraints
```typescript
// Constrain T to objects with an 'id' property
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// Constrain with keyof
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: 'Alice', age: 30 };
const name = getProperty(user, 'name');  // type: string
const age = getProperty(user, 'age');    // type: number
// getProperty(user, 'email');           // Error: 'email' not in keyof
```

## Step 3: Conditional Types
```typescript
// Type that changes based on a condition
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false

// Practical example: extract return type of async functions
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type Result = UnwrapPromise<Promise<string>>;  // string
type Same = UnwrapPromise<number>;             // number

// Filter union types
type ExtractStrings<T> = T extends string ? T : never;
type OnlyStrings = ExtractStrings<'a' | 1 | 'b' | true>;  // 'a' | 'b'
```

## Step 4: Mapped Types
```typescript
// Make all properties optional
type Partial<T> = { [K in keyof T]?: T[K] };

// Make all properties readonly
type Readonly<T> = { readonly [K in keyof T]: T[K] };

// Custom: make all properties nullable
type Nullable<T> = { [K in keyof T]: T[K] | null };

// Practical: API response wrapper
type ApiFields<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type UserApi = ApiFields<{ name: string; age: number }>;
// { getName: () => string; getAge: () => number }
```

## Step 5: Discriminated Unions
```typescript
// Type-safe state machine
type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function renderState<T>(state: RequestState<T>) {
  switch (state.status) {
    case 'idle': return 'Ready';
    case 'loading': return 'Loading...';
    case 'success': return state.data; // TypeScript knows data exists
    case 'error': return state.error.message; // TypeScript knows error exists
  }
}
```

## Best Practices
- Let TypeScript infer generic parameters when possible
- Use constraints (`extends`) to narrow what generics accept
- Prefer `unknown` over `any` for maximum type safety
- Use `satisfies` to validate types without widening
- Name generic parameters descriptively: `TItem`, `TResponse` not just `T`, `U`

## Common Mistakes
- Overusing generics for types that don't vary (just use the concrete type)
- Forgetting to constrain generic parameters (accepting too many types)
- Using `any` as a generic default (defeats the purpose)
- Creating overly complex utility types that are hard to read
