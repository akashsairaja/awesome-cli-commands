---
id: nodejs-env-management
stackId: nodejs
type: rule
name: Environment Variable Management
description: >-
  Manage Node.js environment variables properly — validate at startup, fail fast
  on missing required vars, use typed config objects, and never access
  process.env scattered through code.
difficulty: beginner
globs:
  - '**/*.js'
  - '**/*.mjs'
  - '**/.env.example'
  - '**/config.*'
tags:
  - environment-variables
  - configuration
  - validation
  - fail-fast
  - secrets
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
  - question: Why should environment variables be validated at startup?
    answer: >-
      If a required env var is missing, you want the application to crash
      immediately at startup with a clear error message — not 20 minutes later
      when the first user request hits the code path that needs it. Startup
      validation with Zod provides type safety, default values, and instant
      failure with descriptive errors.
  - question: Why should I never use process.env directly in business logic?
    answer: >-
      Scattered process.env access is untestable (hard to mock), error-prone
      (typos in variable names), and makes it impossible to know what
      environment variables the app needs. A centralized config module provides
      type safety, validation, discoverability, and a single place to mock in
      tests.
relatedItems:
  - nodejs-esm-modules
  - nodejs-security-essentials
  - nodejs-error-handling
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Environment Variable Management

## Rule
All environment variables MUST be validated at application startup. Create a typed config module — never access process.env directly in business logic. Fail fast on missing required variables.

## Format
```javascript
// config.js — single source of truth
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
});

export const config = envSchema.parse(process.env);
```

## Good Examples
```javascript
// config.js — validates and exports typed config
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export const config = envSchema.parse(process.env);
// App crashes at startup if DATABASE_URL is missing — not at first request

// Usage in services (never touch process.env)
import { config } from "./config.js";
const pool = createPool(config.DATABASE_URL);
app.listen(config.PORT);
```

## Bad Examples
```javascript
// BAD: Scattered process.env access
const db = createPool(process.env.DATABASE_URL);
// Fails at runtime when first query runs, not at startup

// BAD: No validation or defaults
const port = process.env.PORT;  // Could be undefined, string, or anything

// BAD: Accessing process.env in business logic
function sendEmail(to, subject) {
  const apiKey = process.env.SENDGRID_API_KEY;  // Scattered, untestable
}
```

## .env.example Template
```bash
# .env.example — commit this file
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
JWT_SECRET=change-this-to-a-long-random-string
REDIS_URL=redis://localhost:6379
```

## Enforcement
- Import config module at app entry point — crash before anything else
- ESLint rule to flag direct process.env access outside config module
- CI verifies .env.example exists and is up to date
