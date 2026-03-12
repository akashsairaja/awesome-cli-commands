---
id: nodejs-esm-migration
stackId: nodejs
type: skill
name: Migrating Node.js to ESM Modules
description: >-
  Step-by-step guide to migrating a Node.js project from CommonJS require() to
  ECMAScript Modules (ESM) with import/export syntax, including handling edge
  cases and dependencies.
difficulty: intermediate
tags:
  - esm
  - modules
  - migration
  - commonjs
  - import-export
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - javascript
  - typescript
prerequisites:
  - Node.js 20+
  - Existing CommonJS project
faq:
  - question: How do I migrate Node.js from CommonJS to ESM?
    answer: >-
      Add 'type': 'module' to package.json, replace require() with import
      statements, replace module.exports with export, add .js extensions to
      relative imports, replace __dirname with import.meta.dirname (Node 21.2+)
      or fileURLToPath(import.meta.url), and use 'with { type: "json" }' for
      JSON imports.
  - question: Can I mix CommonJS and ESM in the same Node.js project?
    answer: >-
      Yes. With 'type': 'module' in package.json, .js files are ESM and .cjs
      files are CommonJS. ESM files can import CommonJS modules, but CommonJS
      files cannot require() ESM modules (use dynamic import() instead). During
      migration, convert files incrementally.
  - question: Why do ESM imports require file extensions in Node.js?
    answer: >-
      Node.js ESM follows the browser module resolution standard, which requires
      explicit file extensions. This eliminates ambiguity (is 'utils' a file or
      directory?), enables static analysis, and matches how browsers resolve
      modules. Always include .js, .mjs, or .cjs in relative import paths.
relatedItems:
  - nodejs-error-handling-patterns
  - nodejs-stream-processing
  - typescript-strict-config
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Migrating Node.js to ESM Modules

## Overview
ECMAScript Modules (ESM) is the JavaScript standard module system, replacing CommonJS in modern Node.js. This skill walks through converting a CommonJS project to ESM, handling __dirname replacements, JSON imports, and dependency compatibility.

## Why This Matters
- **Standard compliance** — ESM is the JavaScript module standard, supported everywhere
- **Static analysis** — enables tree-shaking and better IDE support
- **Top-level await** — use await outside async functions
- **Browser compatibility** — same module system as frontend code
- **Future-proof** — new Node.js features target ESM first

## Step 1: Update package.json
```json
{
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## Step 2: Rename Files (If Needed)
```bash
# If you need to keep some CommonJS files, use .cjs extension
# ESM files use .js (with "type": "module") or .mjs
mv config.js config.cjs  # Only for files that MUST stay CommonJS
```

## Step 3: Replace require() with import
```javascript
// Before (CommonJS)
const express = require('express');
const { readFile } = require('fs/promises');
const config = require('./config.json');

// After (ESM)
import express from 'express';
import { readFile } from 'node:fs/promises';
import config from './config.json' with { type: 'json' };
```

## Step 4: Replace module.exports with export
```javascript
// Before (CommonJS)
module.exports = { createApp };
module.exports.default = createApp;

// After (ESM)
export { createApp };
export default createApp;
```

## Step 5: Replace __dirname and __filename
```javascript
// Before (CommonJS)
const configPath = path.join(__dirname, 'config.json');

// After (ESM)
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, 'config.json');

// Or use import.meta.dirname (Node.js 21.2+)
const configPath = join(import.meta.dirname, 'config.json');
```

## Step 6: Handle Dynamic Imports
```javascript
// Before (CommonJS)
const plugin = require(`./plugins/${name}`);

// After (ESM)
const plugin = await import(`./plugins/${name}.js`);
// Note: dynamic import() returns a module namespace — use .default if needed
```

## Best Practices
- Always use the `node:` prefix for built-in modules (`node:fs`, `node:path`)
- Add file extensions in import paths: `import { foo } from './utils.js'`
- Use `import.meta.url` instead of `__filename`
- Use `import.meta.dirname` (Node 21.2+) instead of `__dirname`
- Test your package with both ESM and CommonJS consumers if publishing

## Common Mistakes
- Forgetting to add `.js` extension to relative imports (required in ESM)
- Using `require()` in an ESM file (not available — use `createRequire` as escape hatch)
- Not updating test runner configuration for ESM (Jest needs special config)
- Forgetting that `import()` is async — returns a Promise
