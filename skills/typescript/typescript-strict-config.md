---
id: typescript-strict-config
stackId: typescript
type: skill
name: TypeScript Strict Mode Configuration
description: >-
  Configure TypeScript for maximum type safety — strict mode flags, essential
  tsconfig.json settings, path aliases, and project references for monorepos.
difficulty: intermediate
tags:
  - typescript
  - strict
  - mode
  - configuration
  - best-practices
  - refactoring
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
faq:
  - question: "When should I use the TypeScript Strict Mode Configuration skill?"
    answer: >-
      Configure TypeScript for maximum type safety — strict mode flags,
      essential tsconfig.json settings, path aliases, and project references
      for monorepos. It includes practical examples for TypeScript
      development.
  - question: "What tools and setup does TypeScript Strict Mode Configuration require?"
    answer: >-
      Works with standard TypeScript tooling (TypeScript compiler (tsc),
      tsconfig.json). Review the setup section in the skill content for
      specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
