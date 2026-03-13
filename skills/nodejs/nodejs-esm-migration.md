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
  - nodejs
  - migrating
  - esm
  - modules
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Migrating Node.js to ESM Modules skill?"
    answer: >-
      Step-by-step guide to migrating a Node.js project from CommonJS
      require() to ECMAScript Modules (ESM) with import/export syntax,
      including handling edge cases and dependencies. This skill provides a
      structured workflow for server-side architecture, error handling, stream
      processing, and API development.
  - question: "What tools and setup does Migrating Node.js to ESM Modules require?"
    answer: >-
      Works with standard Node.js tooling (Node.js runtime, npm/yarn/pnpm).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
