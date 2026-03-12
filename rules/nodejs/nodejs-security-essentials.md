---
id: nodejs-security-essentials
stackId: nodejs
type: rule
name: Node.js Security Essentials
description: >-
  Apply essential security practices for Node.js applications — validate all
  input, prevent injection attacks, secure HTTP headers, manage secrets
  properly, and audit dependencies.
difficulty: intermediate
globs:
  - '**/*.js'
  - '**/*.mjs'
  - '**/package.json'
tags:
  - security
  - input-validation
  - helmet
  - rate-limiting
  - sql-injection
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
  - question: What are the most critical Node.js security practices?
    answer: >-
      The top 5 are: (1) Validate all input with schema libraries like Zod, (2)
      Use parameterized queries to prevent SQL injection, (3) Set security
      headers with helmet, (4) Rate limit all public endpoints, and (5) Run npm
      audit regularly and keep dependencies updated. These prevent the most
      common attack vectors.
  - question: How should secrets be managed in Node.js applications?
    answer: >-
      Never hardcode secrets in source code. Use environment variables loaded
      from .env files in development (via dotenv) and from the deployment
      platform's secret manager in production (AWS Secrets Manager, Vault, etc).
      Never commit .env files — only .env.example with placeholder values.
relatedItems:
  - nodejs-esm-modules
  - nodejs-error-handling
  - nodejs-env-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Node.js Security Essentials

## Rule
All Node.js applications MUST validate input with a schema library, set security headers, never store secrets in code, and run regular dependency audits. No exceptions for internal services.

## Security Checklist
| Area | Requirement | Tool |
|------|-------------|------|
| Input validation | Schema validation on all endpoints | zod, joi |
| HTTP headers | Security headers on all responses | helmet |
| Rate limiting | Rate limit all public endpoints | express-rate-limit |
| Dependencies | Regular audit for vulnerabilities | npm audit, snyk |
| Secrets | Never in code, use env vars | dotenv (dev only) |
| SQL injection | Parameterized queries only | Prepared statements |

## Good Examples
```javascript
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";

// Security headers
app.use(helmet());

// Rate limiting
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
}));

// Input validation with Zod
const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(72),
});

app.post("/users", async (req, res) => {
  const data = createUserSchema.parse(req.body);
  // data is validated and typed
});

// Parameterized queries (never string concatenation)
const user = await db.query(
  "SELECT * FROM users WHERE id = $1",
  [req.params.id]
);
```

## Bad Examples
```javascript
// BAD: No input validation
app.post("/users", async (req, res) => {
  await db.query(`INSERT INTO users (name) VALUES ('${req.body.name}')`);
  // SQL injection vulnerability!
});

// BAD: Secrets in code
const API_KEY = "sk_live_abc123def456";

// BAD: No security headers
app.listen(3000);  // No helmet, no rate limiting
```

## Enforcement
- `npm audit` in CI — fail on high/critical vulnerabilities
- ESLint security plugins: eslint-plugin-security
- Snyk or Socket.dev for dependency monitoring
- Mandatory helmet and rate-limit middleware
