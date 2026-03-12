---
id: typescript-strict-mode
stackId: typescript
type: rule
name: Strict Mode Required in tsconfig.json
description: >-
  Every TypeScript project must enable strict mode and all additional strict
  checks — noUncheckedIndexedAccess, exactOptionalPropertyTypes, and
  noImplicitOverride for maximum type safety.
difficulty: beginner
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/tsconfig.json'
  - '**/tsconfig.*.json'
tags:
  - strict-mode
  - tsconfig
  - type-safety
  - null-checks
  - compiler-options
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
  - question: Why must every TypeScript project use strict mode?
    answer: >-
      Strict mode catches entire categories of bugs at compile time: null
      reference errors, implicit any types, incorrect this binding, and
      uninitialized properties. Without strict mode, TypeScript provides a false
      sense of safety — many runtime errors that TypeScript should catch are
      silently ignored.
  - question: What does noUncheckedIndexedAccess do?
    answer: >-
      It adds 'undefined' to the type of array index access and record lookups.
      arr[0] becomes 'T | undefined' instead of 'T'. This catches a common bug
      class where code assumes an array element exists at an index without
      checking. It requires null checks but prevents runtime 'cannot read
      property of undefined' errors.
relatedItems:
  - typescript-no-any
  - typescript-type-guards
  - typescript-generics-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Strict Mode Required in tsconfig.json

## Rule
Every TypeScript project MUST set `"strict": true` in tsconfig.json. Additionally, enable noUncheckedIndexedAccess, exactOptionalPropertyTypes, and noImplicitOverride.

## Format
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

## What Strict Enables
| Flag | Effect |
|------|--------|
| strictNullChecks | null/undefined require explicit handling |
| strictFunctionTypes | Correct function type variance |
| strictBindCallApply | Type-check bind/call/apply |
| strictPropertyInitialization | Class properties must be initialized |
| noImplicitAny | No implicit 'any' type |
| noImplicitThis | 'this' must have explicit type |
| alwaysStrict | Emit "use strict" in every file |

## Good Examples
```typescript
// strict mode catches these at compile time
function getUser(id: string): User | undefined {
  return users.get(id);
}

const user = getUser("123");
// user is User | undefined — must check before use
if (user) {
  console.log(user.name);  // Safe — narrowed to User
}

// noUncheckedIndexedAccess
const items: string[] = ["a", "b", "c"];
const first = items[0];  // Type: string | undefined
if (first !== undefined) {
  console.log(first.toUpperCase());  // Safe
}

// Index signatures
interface Config {
  [key: string]: string;
}
const config: Config = { host: "localhost" };
const value = config["port"];  // Type: string | undefined (with noUncheckedIndexedAccess)
```

## Bad Examples
```json
{
  "compilerOptions": {
    "strict": false
  }
}
```

```typescript
// Without strict mode, these bugs compile silently:
function greet(name) {         // Implicit any parameter
  return name.toUpperCase();   // Crashes if name is undefined
}

const arr = [1, 2, 3];
const val = arr[10];           // Type: number (wrong! it's undefined)
val.toFixed(2);                // Runtime crash
```

## Enforcement
- CI: `tsc --noEmit` with strict tsconfig
- Never use `// @ts-ignore` — use `// @ts-expect-error` with comment
- ESLint: @typescript-eslint/no-explicit-any
