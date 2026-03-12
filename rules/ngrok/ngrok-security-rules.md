---
id: ngrok-security-rules
stackId: ngrok
type: rule
name: Ngrok Security & Access Rules
description: >-
  Enforce security standards for ngrok tunnels — authentication requirements, IP
  restrictions, authtoken management, and prohibited exposure patterns.
difficulty: beginner
globs:
  - '**/ngrok.yml'
  - '**/ngrok*.yaml'
  - '**/.env*'
tags:
  - ngrok
  - security
  - authentication
  - access-control
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
faq:
  - question: Is it safe to expose my local server with ngrok?
    answer: >-
      For local development and webhook testing, yes — ngrok tunnels are
      encrypted with TLS. For shared or team-accessible tunnels, add OAuth or IP
      restrictions. Never expose databases, admin panels, or debug endpoints
      without authentication. Treat ngrok tunnels as public endpoints.
  - question: How should I manage ngrok authtokens in a team?
    answer: >-
      Each team member should use their own ngrok account and authtoken. Never
      share authtokens or commit them to version control. Store authtokens in
      environment variables or .env files (gitignored). Use ngrok's team
      features for organization-level management.
relatedItems:
  - ngrok-tunnel-architect
  - ngrok-api-gateway-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ngrok Security & Access Rules

## Rule
All ngrok tunnels exposing services beyond local testing MUST have authentication configured. Authtokens MUST never be committed to version control.

## Requirements

### Authentication
- Tunnels shared with team members MUST use OAuth or basic auth
- Tunnels accessible from the internet MUST have IP restrictions or OAuth
- Local-only development tunnels MAY skip authentication

### Authtoken Management
- NEVER commit authtokens to version control
- Store in environment variables or .env files (gitignored)
- Use separate authtokens per team member (not shared)
- Rotate authtokens if compromised

### Prohibited Exposures
| Service | Rule |
|---------|------|
| Databases (PostgreSQL, MySQL, Redis) | NEVER expose without VPN or IP restriction |
| Admin panels (phpMyAdmin, Adminer) | NEVER expose without OAuth |
| Debug endpoints (/debug, /pprof) | NEVER expose publicly |
| Internal APIs with no auth | NEVER expose without ngrok OAuth |

### Configuration File Security
```yaml
# GOOD: authtoken from environment variable
version: "3"
agent:
  authtoken: ${NGROK_AUTHTOKEN}

# BAD: hardcoded authtoken
version: "3"
agent:
  authtoken: 2abc123def456...
```

## Examples

### Good
```yaml
tunnels:
  staging:
    addr: 3000
    proto: http
    oauth:
      provider: google
      allow_domains: ["company.com"]
```

### Bad
```bash
# Exposing database with no protection
ngrok tcp 5432

# Exposing admin panel with no auth
ngrok http 8080  # phpMyAdmin running on 8080
```

## Enforcement
Add ngrok authtoken patterns to .gitignore and secret scanning.
Review tunnel configurations in team setup documentation.
Use ngrok's IP policy feature for production-adjacent tunnels.
