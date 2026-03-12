---
id: deno-permissions-security
stackId: deno
type: skill
name: Deno Permissions & Security Model
description: >-
  Master Deno's permission-based security model — configuring granular file,
  network, and environment access for secure-by-default TypeScript applications.
difficulty: beginner
tags:
  - permissions
  - security
  - least-privilege
  - deno-run
  - supply-chain
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - typescript
  - javascript
prerequisites:
  - Deno 2.0+
faq:
  - question: How does Deno's permission system work?
    answer: >-
      Deno scripts run with zero permissions by default. You must explicitly
      grant access to the filesystem (--allow-read), network (--allow-net),
      environment variables (--allow-env), and subprocess execution
      (--allow-run). Permissions can be scoped to specific paths, hosts, and
      variable names for granular control.
  - question: Why is Deno more secure than Node.js?
    answer: >-
      Node.js grants full system access to all code including dependencies — any
      npm package can read files, make network requests, or access environment
      variables. Deno requires explicit permission for each capability, so a
      malicious dependency cannot exfiltrate data or access the filesystem
      without your knowledge.
  - question: Can I request permissions at runtime in Deno?
    answer: >-
      Yes. Use Deno.permissions.request() to prompt the user for specific
      permissions at runtime. Use Deno.permissions.query() to check current
      permission state without prompting. This enables progressive permission
      acquisition — request access only when the feature that needs it is used.
relatedItems:
  - deno-std-library
  - deno-testing-patterns
  - deno-deploy-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Deno Permissions & Security Model

## Overview
Deno is secure by default — scripts run with zero permissions unless explicitly granted. This prevents supply chain attacks, accidental data exposure, and malicious code execution from dependencies.

## Why This Matters
- **Zero trust** — dependencies cannot access filesystem or network without permission
- **Supply chain safety** — malicious packages cannot exfiltrate data
- **Principle of least privilege** — grant only the access your app needs
- **Audit trail** — permissions are visible in your run command

## Permission Flags
| Flag | Access Granted | Example |
|------|---------------|---------|
| `--allow-read` | Filesystem read | `--allow-read=./data,./config` |
| `--allow-write` | Filesystem write | `--allow-write=./output` |
| `--allow-net` | Network access | `--allow-net=api.example.com` |
| `--allow-env` | Environment variables | `--allow-env=DATABASE_URL,API_KEY` |
| `--allow-run` | Subprocess execution | `--allow-run=git,npm` |
| `--allow-ffi` | Foreign function interface | (use with caution) |
| `--allow-sys` | System information | `--allow-sys=hostname,osRelease` |

## Step 1: Granular Permissions
```bash
# Allow reading only the data directory and writing only to output
deno run --allow-read=./data --allow-write=./output process.ts

# Allow network access only to specific domains
deno run --allow-net=api.github.com,api.stripe.com server.ts

# Allow reading specific environment variables only
deno run --allow-env=DATABASE_URL,PORT --allow-net=0.0.0.0 server.ts
```

## Step 2: Configure in deno.json
```json
{
  "tasks": {
    "dev": "deno run --allow-read=. --allow-net=localhost --allow-env --watch main.ts",
    "start": "deno run --allow-read=./data --allow-net=0.0.0.0 --allow-env=PORT,DATABASE_URL main.ts",
    "test": "deno test --allow-read=. --allow-net=localhost"
  }
}
```

## Step 3: Runtime Permission Requests
```typescript
// Request permissions at runtime (prompts user)
const status = await Deno.permissions.request({ name: "read", path: "./data" });
if (status.state === "granted") {
  const data = await Deno.readTextFile("./data/config.json");
}

// Check permission without requesting
const netStatus = await Deno.permissions.query({ name: "net", host: "api.example.com" });
console.log(netStatus.state); // "granted" | "denied" | "prompt"
```

## Best Practices
- Never use `--allow-all` or `-A` in production deployments
- Specify paths and hosts explicitly — `--allow-read=./data` not `--allow-read`
- List specific environment variables — `--allow-env=PORT` not `--allow-env`
- Document required permissions in README
- Use `deno.json` tasks to define permission sets for different environments
- Audit third-party modules for permission requirements

## Common Mistakes
- Using `--allow-all` for convenience (defeats security model)
- Not scoping network access to specific hosts
- Granting write access to the entire filesystem
- Forgetting to include permissions when deploying to Deno Deploy
