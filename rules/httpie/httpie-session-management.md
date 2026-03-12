---
id: httpie-session-management
stackId: httpie
type: rule
name: Session File Conventions
description: >-
  Use HTTPie named sessions to persist authentication headers, cookies, and
  custom headers across requests — organize sessions per environment and never
  commit session files with secrets.
difficulty: beginner
globs:
  - '**/*.httpie'
  - '**/httpie/**'
  - '**/.httpie/**'
tags:
  - sessions
  - authentication
  - api-testing
  - cookies
  - security
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
  - question: What are HTTPie sessions and when should I use them?
    answer: >-
      HTTPie sessions persist headers, cookies, and authentication across
      requests. Use them when working with APIs that require login —
      authenticate once and subsequent requests automatically include the token.
      Name sessions by environment (dev, staging, prod) to avoid mixing
      credentials.
  - question: What is the difference between --session and --session-read-only?
    answer: >-
      --session reads and writes the session file — new cookies and headers from
      responses are saved. --session-read-only reads the session but never
      updates it, which is safer for production environments where you don't
      want accidental token rotation to persist.
relatedItems:
  - httpie-config-standards
  - httpie-output-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Session File Conventions

## Rule
Use named sessions for API workflows that require persistent authentication. Store sessions per environment. Never commit session files containing tokens or cookies to version control.

## Format
```bash
# Create/use a named session
http --session=dev GET api.example.com/users

# Session files stored in ~/.config/httpie/sessions/
# Structure: <host>/<session-name>.json
```

## Good Examples
```bash
# Login and save session
http --session=staging POST api.staging.example.com/auth/login \
  email=admin@example.com password=secret

# Subsequent requests reuse auth token automatically
http --session=staging GET api.staging.example.com/users
http --session=staging POST api.staging.example.com/orders name="Test"

# Separate sessions per environment
http --session=dev GET api.dev.example.com/health
http --session=prod-readonly GET api.example.com/status

# Read-only session (never writes updates)
http --session-read-only=prod GET api.example.com/users
```

## Bad Examples
```bash
# BAD: Repeating auth header on every request
http GET api.example.com/users "Authorization: Bearer eyJhbG..."
http GET api.example.com/orders "Authorization: Bearer eyJhbG..."
# Use a session instead

# BAD: Committing session files
git add ~/.config/httpie/sessions/  # Contains tokens!
```

## Gitignore Session Files
```gitignore
# .gitignore
.httpie/
**/httpie/sessions/
```

## Enforcement
- Add httpie session directories to .gitignore
- Use --session-read-only for production environments
- Rotate session tokens regularly — sessions persist until manually cleared
