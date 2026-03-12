---
id: typescript-generics-patterns
stackId: typescript
type: rule
name: Generics Best Practices
description: >-
  Use TypeScript generics effectively — constrain type parameters, avoid
  over-generic functions, use utility types, and apply the principle of least
  generic typing for maximum clarity.
difficulty: advanced
globs:
  - '**/*.ts'
  - '**/*.tsx'
tags:
  - generics
  - utility-types
  - type-constraints
  - conditional-types
  - type-programming
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
  - question: When should I use generics in TypeScript?
    answer: >-
      Use generics when a function or type genuinely works with multiple types
      and the relationship between input and output types matters. If the type
      parameter appears only once, you probably don't need a generic — use
      unknown or a specific type instead. The test: does the caller benefit from
      the type parameter being preserved?
  - question: How should generic type parameters be named?
    answer: >-
      Use single letters (T, U, K, V) for simple, obvious generics like
      Array<T>. Use descriptive names prefixed with T for complex generics:
      TInput, TOutput, TConfig. The key rule: if a reader can't immediately
      understand what the type parameter represents, give it a meaningful name.
relatedItems:
  - typescript-strict-mode
  - typescript-no-any
  - typescript-type-guards
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Generics Best Practices

## Rule
Use generics only when a function/type truly operates on variable types. Always constrain generics with extends. Prefer built-in utility types over custom implementations. Name type parameters meaningfully for complex generics.

## Good Examples
```typescript
// Constrained generic
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic with default
interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Generic class
class Repository<T extends { id: string }> {
  private items = new Map<string, T>();

  save(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }

  findAll(): T[] {
    return [...this.items.values()];
  }
}

// Utility type composition
type CreateDTO<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
type UpdateDTO<T> = Partial<CreateDTO<T>>;

// Conditional types
type ApiResult<T> = T extends void
  ? { success: true }
  : { success: true; data: T };
```

## Bad Examples
```typescript
// BAD: Unnecessary generic — always string
function stringify<T>(value: T): string {
  return String(value);
}
// Just use: function stringify(value: unknown): string

// BAD: Unconstrained generic
function merge<T, U>(a: T, b: U): T & U {
  return { ...a, ...b };  // Doesn't work for non-objects!
}
// Constrain: <T extends object, U extends object>

// BAD: Single-letter names for complex generics
function transform<T, U, V, W>(a: T, b: U, c: V): W { ... }
// Use meaningful names: <TInput, TOutput, TConfig, TResult>

// BAD: Reimplementing utility types
type MyPartial<T> = { [K in keyof T]?: T[K] };
// Just use: Partial<T>
```

## Enforcement
- ESLint: @typescript-eslint/no-unnecessary-type-parameters
- Code review: verify generic constraints are present
- Prefer utility types: Partial, Required, Pick, Omit, Record
