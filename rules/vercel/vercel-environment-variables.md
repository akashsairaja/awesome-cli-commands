---
id: vercel-environment-variables
stackId: vercel
type: rule
name: Environment Variable Management
description: >-
  Standards for managing environment variables on Vercel — naming conventions,
  per-environment configuration, NEXT_PUBLIC prefix rules, and secret rotation
  practices.
difficulty: beginner
globs:
  - '**/.env*'
  - '**/next.config.*'
  - '**/vercel.json'
tags:
  - environment-variables
  - secrets
  - configuration
  - security
  - next-js
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
  - question: What is the NEXT_PUBLIC_ prefix on Vercel?
    answer: >-
      Variables prefixed with NEXT_PUBLIC_ are inlined into the client-side
      JavaScript bundle during build time, making them accessible in browser
      code. Never use this prefix for secrets, API keys, or database URLs —
      those should only be available server-side.
  - question: How do I manage different environment variables per Vercel environment?
    answer: >-
      Vercel supports three environments: Production, Preview, and Development.
      Set different values per environment via the Vercel dashboard or CLI
      (vercel env add). Use vercel env pull to sync environment variables to
      your local .env.local file for development.
relatedItems:
  - vercel-json-configuration
  - vercel-deployment-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Environment Variable Management

## Rule
All environment variables MUST follow consistent naming conventions, be properly scoped to environments, and never be committed to source control.

## Format
```
SCOPE_SERVICE_PURPOSE=value
```

## Naming Conventions
| Pattern | Usage | Example |
|---------|-------|---------|
| `NEXT_PUBLIC_*` | Client-side accessible | `NEXT_PUBLIC_API_URL` |
| `DATABASE_*` | Database connections | `DATABASE_URL` |
| `*_SECRET` / `*_KEY` | API keys and secrets | `STRIPE_SECRET_KEY` |
| `*_URL` | Service endpoints | `REDIS_URL` |

## Environment Scoping
| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| `DATABASE_URL` | prod DB | staging DB | local DB |
| `NEXT_PUBLIC_API_URL` | api.example.com | staging-api.example.com | localhost:3001 |
| `STRIPE_SECRET_KEY` | live key | test key | test key |

## Rules
1. **NEVER** prefix secrets with `NEXT_PUBLIC_` (exposes to client bundle)
2. **ALWAYS** use different values per environment (production vs preview vs dev)
3. **NEVER** commit `.env` files to version control
4. **ALWAYS** provide `.env.example` with placeholder values
5. **ROTATE** secrets on a regular schedule (quarterly minimum)
6. **USE** Vercel CLI or dashboard to set variables, not vercel.json

## Examples

### Good
```bash
# .env.example (committed to git)
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
NEXT_PUBLIC_API_URL=http://localhost:3001
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Bad
```bash
# Exposing secrets to the client
NEXT_PUBLIC_DATABASE_URL=postgresql://...
NEXT_PUBLIC_STRIPE_SECRET=sk_live_...

# Same value across all environments
API_KEY=same-key-everywhere
```

## Setting Variables via CLI
```bash
# Set for production only
vercel env add DATABASE_URL production

# Set for all environments
vercel env add NEXT_PUBLIC_SITE_NAME

# Pull env vars to local .env.local
vercel env pull .env.local
```

## Enforcement
Use `vercel env pull` for local development instead of manually copying.
Add `.env*` to .gitignore (except .env.example).
Review NEXT_PUBLIC_ variables in PRs — ensure no secrets are exposed.
