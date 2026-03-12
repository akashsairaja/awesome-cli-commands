---
id: curl-security-rules
stackId: curl
type: rule
name: cURL Security Rules
description: >-
  Security standards for cURL usage — credential management, TLS verification,
  header sanitization, and safe scripting practices to prevent token leaks and
  man-in-the-middle attacks.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/.curlrc'
tags:
  - security
  - credentials
  - tls
  - encryption
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How do I keep cURL credentials out of shell history?
    answer: >-
      Store credentials in environment variables (export API_TOKEN from .env).
      Prefix commands with a space (HISTCONTROL=ignorespace). Use -K config
      files for persistent credentials. Never hardcode tokens in the command
      line.
  - question: Is it ever safe to use cURL with -k/--insecure?
    answer: >-
      Only for local development with self-signed certificates. In production,
      always verify TLS certificates. If you need to trust an internal CA, use
      --cacert to specify the certificate bundle explicitly rather than
      disabling verification entirely.
relatedItems:
  - curl-command-standards
  - curl-error-handling-rules
  - curl-auth-flows
version: 1.0.0
lastUpdated: '2026-03-11'
---

# cURL Security Rules

## Rule
All cURL usage MUST protect credentials, verify TLS, sanitize output, and never expose tokens in command history, logs, or error messages.

## Credential Protection

### Good — Environment Variables
```bash
# Credentials from environment
curl -sS -H "Authorization: Bearer $API_TOKEN" "$API_URL/users"
```

### Good — Config File
```bash
# .curlrc or -K flag
# config.curl (gitignored)
header = "Authorization: Bearer my-secret-token"
```

### Bad — Hardcoded in Command
```bash
# Token visible in shell history, process list, logs
curl -H "Authorization: Bearer sk-abc123" https://api.example.com/data
```

## TLS Rules
```bash
# NEVER in production scripts
curl -k https://api.example.com/data     # INSECURE: disables TLS verification

# Good — custom CA bundle
curl --cacert /path/to/ca-bundle.crt https://internal-api.example.com/data

# Good — pin certificate
curl --pinnedpubkey "sha256//hash==" https://api.example.com/data
```

## Output Sanitization
```bash
# Don't log full responses that might contain tokens
# Good — log status only
status=$(curl -sS -o /dev/null -w "%{http_code}" "$URL")
echo "Status: $status"

# Bad — log entire response (may contain tokens, PII)
response=$(curl -sS "$URL")
echo "$response" >> application.log
```

## Safe Scripting Patterns
```bash
# Use process substitution to avoid temp files with credentials
curl -sS -H "Authorization: Bearer $TOKEN" "$URL" | jq '.' > /dev/null

# Use stdin for passwords (not visible in process list)
curl -sS -u "user:$(cat /path/to/password-file)" "$URL"

# Clear variables after use
unset API_TOKEN
```

## Gitignore Rules
```gitignore
# Ignore files that may contain credentials
.curlrc
*.curl
cookies.txt
.netrc
```

## Anti-Patterns
- Hardcoded tokens in curl commands (visible in history)
- Using -k/--insecure in production (MITM vulnerability)
- Logging full responses containing tokens or PII
- Storing credentials in shell history (use HISTCONTROL=ignorespace)
- Cookie files left on disk after scripts complete
- Sending credentials over HTTP (not HTTPS)
