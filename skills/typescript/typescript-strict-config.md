---
id: typescript-strict-config
stackId: typescript
type: skill
name: TypeScript Strict Mode Configuration
description: >-
  Configure TypeScript for maximum type safety — strict mode flags, essential
  tsconfig.json settings, path aliases, and project references for monorepos.
difficulty: beginner
tags:
  - tsconfig
  - strict-mode
  - configuration
  - type-safety
  - path-aliases
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
prerequisites:
  - TypeScript 5.0+
  - Node.js project
faq:
  - question: What does strict mode do in TypeScript?
    answer: >-
      strict: true enables all strict type-checking flags at once:
      strictNullChecks (null safety), noImplicitAny (require explicit types),
      strictFunctionTypes (safe function parameters), and more. It catches
      approximately 40% more type errors than the default configuration and is
      recommended for all projects.
  - question: What is noUncheckedIndexedAccess in TypeScript?
    answer: >-
      noUncheckedIndexedAccess makes array and object indexing return T |
      undefined instead of just T. This forces you to check that a value exists
      before using it: arr[0] becomes string | undefined, not just string. This
      catches out-of-bounds access errors that strict mode alone misses.
  - question: How do I set up TypeScript path aliases?
    answer: >-
      Add 'baseUrl' and 'paths' to tsconfig.json: paths: { '@/*': ['./src/*'] }.
      This lets you write 'import { User } from @/types/user' instead of
      relative paths. You must also configure your bundler (Vite, webpack) or
      test runner (Jest, Vitest) with the same aliases.
relatedItems:
  - typescript-generics-patterns
  - typescript-no-any-rule
  - typescript-type-guards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# TypeScript Strict Mode Configuration

## Overview
A properly configured tsconfig.json is the foundation of type-safe TypeScript. Strict mode catches entire categories of bugs at compile time. This skill covers the essential settings every project needs.

## Why This Matters
- **Bug prevention** — strict mode catches ~40% more errors than default config
- **Null safety** — strictNullChecks prevents the "billion dollar mistake"
- **Consistency** — team-wide settings prevent configuration drift
- **IDE support** — proper config enables full autocomplete and refactoring

## The Essential tsconfig.json
```json
{
  "compilerOptions": {
    // Strict mode — enables all strict checks
    "strict": true,

    // Additional safety checks beyond strict
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,

    // Module configuration
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "esModuleInterop": true,
    "resolveJsonModule": true,

    // Output
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,

    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/types/*": ["./src/types/*"]
    },

    // Quality
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## What `strict: true` Enables
| Flag | What It Does |
|------|-------------|
| `strictNullChecks` | null/undefined are distinct types — must handle explicitly |
| `noImplicitAny` | Variables must have types — no implicit any |
| `strictFunctionTypes` | Function parameter types checked contravariantly |
| `strictBindCallApply` | bind/call/apply check argument types |
| `strictPropertyInitialization` | Class properties must be initialized |
| `noImplicitThis` | this must have an explicit type |
| `alwaysStrict` | Emit "use strict" in output |
| `useUnknownInCatchVariables` | catch variables are unknown, not any |

## Additional Recommended Flags
```json
{
  // Array/object indexing returns T | undefined (not just T)
  "noUncheckedIndexedAccess": true,

  // Optional properties must be explicitly set to undefined
  "exactOptionalPropertyTypes": true,

  // Unused locals and parameters are errors
  "noUnusedLocals": true,
  "noUnusedParameters": true,

  // Ensure every code path returns a value
  "noImplicitReturns": true
}
```

## Path Aliases with @
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```
```typescript
// Before
import { User } from '../../../types/user';
// After
import { User } from '@/types/user';
```

## Best Practices
- Start with `strict: true` on new projects — non-negotiable
- Add `noUncheckedIndexedAccess` for safer array/object access
- Use path aliases to avoid deep relative imports
- Keep `skipLibCheck: true` for faster compilation
- Set `isolatedModules: true` for compatibility with esbuild/SWC/Vite

## Common Mistakes
- Starting without strict mode and trying to add it later (painful)
- Using `any` to fix strict mode errors instead of proper types
- Not matching module/moduleResolution to your runtime (Node16 for Node.js)
- Forgetting to configure path aliases in bundler/test runner too
