---
id: bun-native-apis
stackId: bun
type: skill
name: >-
  Bun Native APIs & Performance Shortcuts
description: >-
  Leverage Bun's native APIs for maximum performance — Bun.file, Bun.write,
  Bun.password, Bun.spawn, built-in SQLite, and other Bun-specific
  optimizations over Node.js equivalents.
difficulty: advanced
tags:
  - bun
  - native
  - apis
  - performance
  - shortcuts
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Bun Native APIs & Performance Shortcuts skill?"
    answer: >-
      Leverage Bun's native APIs for maximum performance — Bun.file,
      Bun.write, Bun.password, Bun.spawn, built-in SQLite, and other
      Bun-specific optimizations over Node.js equivalents. It includes
      practical examples for bun development.
  - question: "What tools and setup does Bun Native APIs & Performance Shortcuts require?"
    answer: >-
      Requires pip/poetry installed. Works with bun projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Bun Native APIs & Performance Shortcuts

## Overview
Bun provides native APIs that are faster than their Node.js equivalents. These APIs are designed for common tasks like file I/O, password hashing, subprocess management, and database access.

## Why This Matters
- **Faster file I/O** — Bun.file() uses zero-copy reads
- **Native hashing** — Bun.password uses Argon2 (no bcrypt dependency)
- **Built-in SQLite** — embedded database without external packages
- **Efficient spawning** — Bun.spawn is faster than child_process

## File Operations
```typescript
// Reading files — zero-copy, much faster than fs.readFile
const file = Bun.file("config.json");
const json = await file.json();       // Parse as JSON
const text = await file.text();        // Read as string
const bytes = await file.arrayBuffer(); // Read as bytes
console.log(file.size);                // File size without reading
console.log(file.type);                // MIME type

// Writing files
await Bun.write("output.txt", "Hello, Bun!");
await Bun.write("data.json", JSON.stringify(data, null, 2));
await Bun.write("copy.txt", Bun.file("original.txt")); // File copy
```

## Password Hashing
```typescript
// Native Argon2 — no bcrypt package needed
const hash = await Bun.password.hash("user-password", {
  algorithm: "argon2id", // or "bcrypt"
  memoryCost: 65536,     // 64 MB
  timeCost: 2,
});

const isValid = await Bun.password.verify("user-password", hash);
```

## Subprocess Management
```typescript
// Run a command and get output
const proc = Bun.spawn(["git", "status"], {
  stdout: "pipe",
  cwd: "/path/to/repo",
});
const output = await new Response(proc.stdout).text();
console.log(output);

// Run with stdin
const proc2 = Bun.spawn(["grep", "error"], {
  stdin: new Blob(["line1\nerror: something\nline3"]),
  stdout: "pipe",
});
```

## Built-in SQLite
```typescript
import { Database } from "bun:sqlite";

const db = new Database("app.db");

// Create table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  )
`);

// Prepared statements (safe from SQL injection)
const insert = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
insert.run("Alice", "alice@example.com");

// Query
const users = db.prepare("SELECT * FROM users WHERE name = ?").all("Alice");
```

## Built-in .env Loading
```typescript
// Bun loads .env automatically — no dotenv package needed
const dbUrl = process.env.DATABASE_URL;  // Just works
const port = process.env.PORT ?? "3000";
// Supports .env, .env.local, .env.production, etc.
```

## Best Practices
- Use Bun.file() instead of fs.readFile for better performance
- Use Bun.password instead of bcrypt/argon2 npm packages
- Use bun:sqlite for embedded databases instead of better-sqlite3
- Let Bun handle .env loading — remove dotenv from dependencies
- Use Bun.spawn() instead of child_process for subprocesses

## Common Mistakes
- Installing npm packages for built-in Bun functionality
- Using Node.js fs APIs when Bun.file/Bun.write is available
- Not using prepared statements with bun:sqlite (SQL injection risk)
- Importing dotenv when Bun loads .env files automatically
