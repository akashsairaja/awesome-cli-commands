---
id: deno-std-library
stackId: deno
type: rule
name: Prefer Standard Library Over Third-Party
description: >-
  Always prefer Deno's standard library (@std) over third-party packages for
  common tasks — file I/O, path manipulation, HTTP, testing, and data formats
  are all covered by the vetted std library.
difficulty: beginner
globs:
  - '**/*.ts'
  - '**/*.tsx'
  - '**/deno.json'
  - '**/deno.jsonc'
tags:
  - standard-library
  - jsr
  - dependencies
  - deno-std
  - best-practices
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
  - question: Why prefer Deno's standard library over npm packages?
    answer: >-
      Deno's @std packages are audited by the core team, designed for Deno's
      runtime (using Deno APIs and permissions), have zero dependencies, follow
      consistent patterns, and are published on JSR with proper TypeScript
      types. npm packages often carry transitive dependencies and may use
      Node-specific APIs that require compatibility layers.
  - question: Can I use npm packages in Deno alongside the standard library?
    answer: >-
      Yes, Deno supports npm: specifiers for importing npm packages directly.
      Use npm packages when the standard library does not cover your need (e.g.,
      database drivers, complex frameworks). But always check @std first — it
      covers path, fs, http, testing, encoding, CLI parsing, and more.
relatedItems:
  - deno-config-conventions
  - deno-permissions-model
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Prefer Standard Library Over Third-Party

## Rule
Always use `@std` packages from JSR for common functionality before reaching for third-party alternatives. The standard library is audited, maintained by the Deno team, and version-stable.

## Standard Library Coverage
| Need | Package | Example |
|------|---------|---------|
| HTTP server | `@std/http` | `Deno.serve(handler)` |
| Path ops | `@std/path` | `join(), resolve(), extname()` |
| File I/O | `@std/fs` | `ensureDir(), copy(), walk()` |
| Testing | `@std/assert` | `assertEquals(), assertThrows()` |
| Encoding | `@std/encoding` | `base64, hex, csv, toml` |
| Crypto | `@std/crypto` | `crypto.subtle + digest helpers` |
| CLI | `@std/cli` | `parseArgs(), promptSecret()` |
| Streams | `@std/streams` | `TextLineStream, toText()` |

## Good Examples
```typescript
import { join } from "@std/path";
import { ensureDir } from "@std/fs";
import { assertEquals } from "@std/assert";
import { parseArgs } from "@std/cli";

const args = parseArgs(Deno.args, {
  string: ["output"],
  boolean: ["verbose"],
  default: { verbose: false },
});

await ensureDir(join(Deno.cwd(), "output"));
```

## Bad Examples
```typescript
// BAD: Third-party when std covers the use case
import path from "npm:path";               // Use @std/path
import fs from "npm:fs-extra";             // Use @std/fs
import { expect } from "npm:chai";          // Use @std/assert
import minimist from "npm:minimist";        // Use @std/cli
```

## Enforcement
- Lint rule to flag npm: imports when @std equivalent exists
- Code review checklist: verify std library was considered first
- Document exceptions where third-party is genuinely better
