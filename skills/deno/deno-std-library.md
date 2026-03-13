---
id: deno-std-library
stackId: deno
type: skill
name: Deno Standard Library Essentials
description: >-
  Leverage Deno's standard library for common tasks — file operations, HTTP
  serving, path manipulation, encoding, and datetime utilities without
  third-party dependencies.
difficulty: intermediate
tags:
  - deno
  - standard
  - library
  - essentials
  - api
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Deno Standard Library Essentials skill?"
    answer: >-
      Leverage Deno's standard library for common tasks — file operations,
      HTTP serving, path manipulation, encoding, and datetime utilities
      without third-party dependencies. It includes practical examples for
      deno development.
  - question: "What tools and setup does Deno Standard Library Essentials require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with deno projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Deno Standard Library Essentials

## Overview
Deno's standard library (@std) provides audited, well-tested modules for common programming tasks. Unlike npm packages, these are maintained by the Deno team, follow consistent patterns, and require no dependency management.

## Why This Matters
- **Audited** — reviewed and maintained by the Deno core team
- **Consistent** — unified API design across all modules
- **No dependency hell** — standard library has zero external dependencies
- **Versioned** — stable releases with semver guarantees

## Essential Modules

### File System Operations
```typescript
import { ensureDir, copy, walk } from "@std/fs";
import { join, extname } from "@std/path";

// Create directory tree (like mkdir -p)
await ensureDir("./output/reports");

// Copy files/directories
await copy("./src", "./backup/src", { overwrite: true });

// Walk directory tree
for await (const entry of walk("./src", { exts: [".ts"] })) {
  console.log(entry.path);
}
```

### HTTP Server
```typescript
// Modern Deno.serve API (recommended)
Deno.serve({ port: 8000 }, (req) => {
  const url = new URL(req.url);
  if (url.pathname === "/api/health") {
    return Response.json({ status: "ok" });
  }
  return new Response("Not Found", { status: 404 });
});
```

### Encoding & Hashing
```typescript
import { encodeBase64, decodeBase64 } from "@std/encoding/base64";
import { crypto } from "@std/crypto";

// Base64 encoding
const encoded = encodeBase64("Hello, World!");
const decoded = new TextDecoder().decode(decodeBase64(encoded));

// Hashing
const data = new TextEncoder().encode("password");
const hash = await crypto.subtle.digest("SHA-256", data);
```

### TOML/YAML/CSV Parsing
```typescript
import { parse as parseYaml } from "@std/yaml";
import { parse as parseToml } from "@std/toml";
import { parse as parseCsv } from "@std/csv";

const config = parseYaml(await Deno.readTextFile("config.yaml"));
const settings = parseToml(await Deno.readTextFile("settings.toml"));
const records = parseCsv(await Deno.readTextFile("data.csv"), { skipFirstRow: true });
```

### Assertions (for validation, not just tests)
```typescript
import { assertEquals, assertExists } from "@std/assert";

assertExists(Deno.env.get("DATABASE_URL"), "DATABASE_URL is required");
```

## Best Practices
- Prefer @std modules over third-party npm packages when available
- Pin standard library versions in import maps (deno.json)
- Use Deno.serve() for HTTP servers (not std/http/server)
- Use Web Standard APIs (fetch, URL, Response) alongside @std

## Common Mistakes
- Using npm packages for tasks the standard library covers
- Not pinning @std versions in deno.json imports
- Using deprecated std modules (check docs for current API)
