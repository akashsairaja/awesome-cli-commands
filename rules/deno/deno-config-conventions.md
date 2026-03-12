---
id: deno-config-conventions
stackId: deno
type: rule
name: deno.json Configuration Standards
description: >-
  Every Deno project must use deno.json or deno.jsonc for centralized
  configuration — compiler options, import maps, tasks, lint and format
  settings, and permission declarations.
difficulty: beginner
globs:
  - '**/deno.json'
  - '**/deno.jsonc'
  - '**/*.ts'
  - '**/*.tsx'
tags:
  - deno-config
  - import-maps
  - tasks
  - jsr
  - configuration
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
  - question: Should I use deno.json or deno.jsonc for Deno projects?
    answer: >-
      Use deno.jsonc when you want to include comments documenting configuration
      choices. Use deno.json for simpler projects. Both are functionally
      identical — Deno reads either one automatically from the project root.
  - question: How do Deno import maps replace package.json?
    answer: >-
      The 'imports' field in deno.json acts as an import map, mapping bare
      specifiers to URLs or JSR packages. This replaces node_modules-based
      resolution. Use JSR (jsr:@std/) for the standard library and third-party
      packages, providing a clean, URL-free import experience in source files.
relatedItems:
  - deno-permissions-model
  - deno-std-library
  - typescript-strict-mode
version: 1.0.0
lastUpdated: '2026-03-12'
---

# deno.json Configuration Standards

## Rule
All Deno projects MUST use deno.json (or deno.jsonc) as the single source of configuration. Never rely on scattered CLI flags when deno.json options exist.

## Format
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "imports": {
    "@std/": "jsr:@std/",
    "@/": "./src/"
  },
  "tasks": {
    "dev": "deno run --watch --allow-net --allow-read src/main.ts",
    "test": "deno test --allow-read",
    "lint": "deno lint",
    "fmt": "deno fmt"
  },
  "lint": {
    "rules": { "tags": ["recommended"] }
  },
  "fmt": {
    "indentWidth": 2,
    "singleQuote": false
  }
}
```

## Good Examples
```jsonc
// deno.jsonc — with comments for documentation
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },
  // Use JSR for standard library
  "imports": {
    "@std/path": "jsr:@std/path@^1",
    "@std/assert": "jsr:@std/assert@^1",
    "oak": "jsr:@oak/oak@^16"
  },
  "tasks": {
    "dev": "deno run --watch --allow-net --allow-env --allow-read src/main.ts",
    "test": "deno test --allow-read --coverage=coverage",
    "check": "deno check src/**/*.ts"
  }
}
```

## Bad Examples
```bash
# BAD: CLI flags instead of deno.json tasks
deno run --allow-net --allow-read --allow-env --allow-write --unstable-kv src/main.ts
# This belongs in a deno.json task

# BAD: URL imports without import map
import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
# Use JSR imports in deno.json instead
```

## Enforcement
- `deno check` validates TypeScript without running
- `deno lint` enforces lint rules from deno.json
- CI runs `deno fmt --check` to verify formatting
