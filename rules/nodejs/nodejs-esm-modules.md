---
id: nodejs-esm-modules
stackId: nodejs
type: rule
name: Use ESM Modules Over CommonJS
description: >-
  All new Node.js projects must use ECMAScript modules (ESM) — set type: module
  in package.json, use import/export syntax, and handle the CJS interop
  correctly for legacy dependencies.
difficulty: beginner
globs:
  - '**/*.js'
  - '**/*.mjs'
  - '**/package.json'
tags:
  - esm
  - modules
  - import-export
  - commonjs-migration
  - node-protocol
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
  - javascript
faq:
  - question: Why should new Node.js projects use ESM instead of CommonJS?
    answer: >-
      ESM is the JavaScript standard supported by browsers, Deno, and Node.js.
      It enables static analysis (tree shaking, dead code elimination),
      top-level await, and consistent module behavior across environments.
      CommonJS is legacy — its dynamic require() prevents optimization and
      creates inconsistent behavior.
  - question: Why must ESM imports include the .js file extension?
    answer: >-
      ESM uses URL-based resolution that requires explicit file extensions —
      there is no automatic .js appending or index.js resolution like CommonJS.
      This is by design to match browser module behavior and enable unambiguous
      resolution. Always include .js even when source files are .ts
      (TypeScript).
relatedItems:
  - nodejs-error-handling
  - nodejs-security-essentials
  - nodejs-env-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Use ESM Modules Over CommonJS

## Rule
All new Node.js projects MUST use ESM (`"type": "module"` in package.json). Use `import/export` syntax exclusively. Use `.mjs` only for ESM files in CJS projects during migration.

## Format
```json
{
  "type": "module"
}
```

```javascript
// ESM imports
import { readFile } from "node:fs/promises";
import express from "express";
import { UserService } from "./services/user.js";
```

## Good Examples
```javascript
// Use node: protocol for built-ins
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "node:http";

// Named exports preferred over default
export function createUser(data) { ... }
export function deleteUser(id) { ... }

// File extensions required in ESM
import { config } from "./config.js";       // .js required
import { db } from "./database/index.js";   // index.js required
```

## Bad Examples
```javascript
// BAD: CommonJS in new projects
const express = require("express");
const { readFile } = require("fs");
module.exports = { handler };

// BAD: Missing file extensions
import { config } from "./config";           // Fails in ESM
import { db } from "./database";             // Fails in ESM

// BAD: Missing node: protocol
import { readFile } from "fs/promises";      // Works but not explicit
```

## CJS Interop (When Needed)
```javascript
// Import CJS module in ESM
import legacyModule from "legacy-cjs-package";

// Use createRequire for CJS-only features
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const jsonData = require("./data.json");

// __dirname equivalent in ESM
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

## Enforcement
- Set `"type": "module"` in package.json for all new projects
- ESLint: enable import/extensions rule to require .js extensions
- CI: verify no require() calls in ESM projects
