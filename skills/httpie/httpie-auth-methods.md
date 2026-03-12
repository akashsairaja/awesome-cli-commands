---
id: httpie-auth-methods
stackId: httpie
type: skill
name: Authentication Methods in HTTPie
description: >-
  Implement authentication with HTTPie — Basic auth, Bearer tokens, digest auth,
  sessions for cookie persistence, and configuring auth plugins for OAuth and
  custom schemes.
difficulty: intermediate
tags:
  - authentication
  - sessions
  - bearer-token
  - basic-auth
  - cookies
  - api-key
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - HTTPie installed
faq:
  - question: How do HTTPie sessions persist authentication?
    answer: >-
      Named sessions (--session=name) save cookies and custom headers to
      ~/.config/httpie/sessions/host/name.json. Subsequent requests with the
      same session name automatically include saved cookies. Login once, then
      all requests use the session. Delete session files to log out.
  - question: How do I use OAuth2 with HTTPie?
    answer: >-
      Install the httpie-oauth plugin: pip install httpie-oauth. For simple
      Bearer token OAuth2, use -A bearer -a TOKEN. For full OAuth2 flows, first
      POST to the token endpoint to get an access_token, then use it as a Bearer
      token in subsequent requests.
  - question: How do I avoid leaking credentials in shell history?
    answer: >-
      Store tokens in environment variables: export TOKEN=xxx. Use $TOKEN in
      commands: http -A bearer -a $TOKEN url. For passwords, use -a user
      (without password) to get a prompt. Prefix commands with a space to
      exclude from history (if HISTCONTROL=ignorespace).
relatedItems:
  - httpie-json-api-testing
  - httpie-file-transfers
  - httpie-session-manager
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Authentication Methods in HTTPie

## Overview
HTTPie simplifies API authentication with built-in support for Basic, Bearer, and Digest auth, plus persistent sessions for cookie-based auth flows.

## Why This Matters
- **API access** — most endpoints require authentication
- **Session management** — test multi-step authenticated flows
- **Security** — properly handle credentials in testing workflows
- **Productivity** — avoid re-authenticating on every request

## How It Works

### Step 1: Basic Authentication
```bash
# -a flag for Basic auth
http -a username:password https://api.example.com/data

# Prompt for password
http -a username https://api.example.com/data
```

### Step 2: Bearer Token Authentication
```bash
# Auth type flag
http -A bearer -a "$TOKEN" https://api.example.com/data

# Or as header
http https://api.example.com/data Authorization:"Bearer $TOKEN"
```

### Step 3: Session-Based Authentication
```bash
# Login (saves cookies to named session)
http --session=myapi POST https://api.example.com/login \
  email=user@example.com password=secret

# Use session (cookies sent automatically)
http --session=myapi https://api.example.com/dashboard
http --session=myapi https://api.example.com/settings

# Read-only session (don't save new cookies)
http --session-read-only=myapi https://api.example.com/data

# Anonymous session (temporary, not saved to disk)
http --session=/tmp/temp-session.json POST https://api.example.com/login \
  email=test@example.com password=test
```

### Step 4: Digest Authentication
```bash
# Digest auth
http -A digest -a username:password https://api.example.com/data
```

### Step 5: Custom Auth Headers
```bash
# API key in header
http https://api.example.com/data X-API-Key:$API_KEY

# Custom token scheme
http https://api.example.com/data Authorization:"Token $TOKEN"

# Multiple auth headers
http https://api.example.com/data \
  Authorization:"Bearer $TOKEN" \
  X-Client-Id:$CLIENT_ID
```

## Best Practices
- Use sessions for multi-request authenticated workflows
- Store tokens in environment variables, not in command history
- Use -A bearer for standard Bearer token auth
- Use --session-read-only for inspecting without modifying session state
- Clean up session files: rm ~/.config/httpie/sessions/

## Common Mistakes
- Hardcoding tokens in commands (visible in shell history)
- Not using sessions (re-authenticating on every request)
- Using wrong auth type (-A basic vs -A bearer)
- Sharing session files that contain sensitive cookies
- Forgetting to use --session-read-only for read operations
