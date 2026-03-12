---
id: xh-auth-patterns
stackId: xh
type: rule
name: XH Authentication Patterns
description: >-
  Handle authentication correctly with xh — bearer tokens, basic auth, session
  persistence, and secure credential handling without exposing secrets in shell
  history.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/Makefile'
tags:
  - authentication
  - bearer-token
  - sessions
  - security
  - credentials
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
  - question: How do I use bearer token authentication with xh?
    answer: >-
      Use '-A bearer -a TOKEN' where TOKEN is your bearer token. Always read the
      token from an environment variable: 'xh -A bearer -a "${API_TOKEN}"
      api.example.com' to avoid exposing it in shell history. For persistent
      auth across requests, use sessions with --session=name.
  - question: How do xh sessions work for persistent authentication?
    answer: >-
      Sessions (--session=name) save authentication headers, cookies, and custom
      headers from responses and reuse them in subsequent requests. Login once
      with --session=dev and all following requests with --session=dev
      automatically include the saved auth. Session files are stored locally and
      should be gitignored.
relatedItems:
  - xh-usage-conventions
  - xh-scripting-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# XH Authentication Patterns

## Rule
Use xh's built-in auth flags instead of manual headers. Never hardcode tokens in scripts. Use sessions for persistent auth. Read credentials from environment variables or secure stores.

## Auth Methods
| Method | Flag | Example |
|--------|------|---------|
| Basic auth | `-a user:pass` | `xh -a admin:secret api.com` |
| Bearer token | `-A bearer -a TOKEN` | `xh -A bearer -a eyJ... api.com` |
| Custom header | `Header:Value` | `xh api.com X-API-Key:abc123` |
| Session | `--session=name` | `xh --session=dev api.com` |

## Good Examples
```bash
# Bearer token from environment variable
xh -A bearer -a "${API_TOKEN}" api.example.com/protected

# Basic auth with prompt (no password in history)
xh -a admin api.example.com/admin
# xh prompts for password interactively

# Session-based auth (login once, reuse)
xh --session=staging POST api.staging.example.com/auth/login \
  email=admin@example.com password="${STAGING_PASSWORD}"

# Subsequent requests use saved session
xh --session=staging api.staging.example.com/users
xh --session=staging api.staging.example.com/orders

# Read token from file
xh -A bearer -a "$(cat ~/.tokens/api-token)" api.example.com

# Read from password manager
xh -A bearer -a "$(op read 'op://Vault/API Key/credential')" api.example.com
```

## Bad Examples
```bash
# BAD: Token in shell history
xh -A bearer -a "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIx..." api.example.com
# Use environment variable instead

# BAD: Manual Authorization header
xh api.example.com "Authorization: Bearer eyJhbG..."
# Use: xh -A bearer -a "${TOKEN}" api.example.com

# BAD: Password in script
xh -a admin:supersecretpassword api.example.com
# Use: xh -a admin api.example.com (prompts for password)
```

## Enforcement
- Never hardcode credentials in scripts — use env vars or secret managers
- Use sessions for API workflows requiring persistent auth
- Use --session-read-only for production environments
