---
id: deno-permissions-model
stackId: deno
type: rule
name: Explicit Permission Declarations
description: >-
  Always declare minimum required permissions explicitly — never use --allow-all
  in production, scope permissions to specific paths and hosts, and document why
  each permission is needed.
difficulty: intermediate
globs:
  - '**/deno.json'
  - '**/deno.jsonc'
  - '**/*.ts'
tags:
  - permissions
  - security
  - sandbox
  - least-privilege
  - deno-security
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
  - question: Why should I never use --allow-all in Deno?
    answer: >-
      Deno's permission system is its core security feature — it sandboxes your
      code by default. Using --allow-all disables all security controls, making
      Deno equivalent to Node.js. Scoped permissions protect against supply
      chain attacks: a compromised dependency cannot access the network or
      filesystem unless explicitly allowed.
  - question: How do I determine what permissions my Deno app needs?
    answer: >-
      Run your app without any permissions and observe which permission prompts
      appear. Each prompt tells you exactly what is needed. Alternatively, use
      'deno info' to audit dependencies. Start with no permissions and add only
      what is required, scoped to specific paths and hosts.
relatedItems:
  - deno-config-conventions
  - deno-std-library
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Explicit Permission Declarations

## Rule
Every Deno application MUST declare only the minimum required permissions. NEVER use --allow-all (--A) in production. Scope permissions to specific paths, hosts, and environment variables.

## Permission Types
| Permission | Scoped Flag | Example |
|-----------|-------------|---------|
| Network | `--allow-net=host:port` | `--allow-net=api.example.com:443` |
| File Read | `--allow-read=path` | `--allow-read=./data,./config` |
| File Write | `--allow-write=path` | `--allow-write=./output` |
| Environment | `--allow-env=VAR` | `--allow-env=DATABASE_URL,PORT` |
| Run | `--allow-run=cmd` | `--allow-run=git,npm` |
| FFI | `--allow-ffi=path` | `--allow-ffi=./native/lib.so` |

## Good Examples
```jsonc
// deno.json — scoped permissions in tasks
{
  "tasks": {
    "dev": "deno run --allow-net=localhost:8000 --allow-read=./src,./static --allow-env=PORT,DATABASE_URL src/main.ts",
    "test": "deno test --allow-read=./test/fixtures"
  }
}
```

```typescript
// Request permissions at runtime
const status = await Deno.permissions.request({ name: "read", path: "./data" });
if (status.state !== "granted") {
  console.error("Read permission required for ./data");
  Deno.exit(1);
}
```

## Bad Examples
```bash
# BAD: Allow everything — defeats Deno's security model
deno run --allow-all src/main.ts
deno run -A src/main.ts

# BAD: Unscoped permissions — too broad
deno run --allow-read --allow-write --allow-net src/main.ts
# Should scope: --allow-read=./config --allow-net=api.example.com
```

## Enforcement
- CI rejects any task containing --allow-all or -A
- Code review checklist: verify permission scope is minimal
- Use `deno info` to audit module dependencies and their permission needs
