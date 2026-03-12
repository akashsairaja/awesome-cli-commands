---
id: curl-command-standards
stackId: curl
type: rule
name: cURL Command Standards
description: >-
  Enforce consistent cURL command formatting — required flags, header
  conventions, body formatting, and security practices for reproducible and safe
  HTTP requests.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/Makefile'
tags:
  - standards
  - formatting
  - flags
  - security
  - conventions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: What flags should every cURL command in a script include?
    answer: >-
      Always include -sS (silent mode with error display), --compressed (accept
      compressed responses), and explicit Content-Type header for POST/PUT
      requests. Add --fail-with-body for CI/CD scripts where non-zero exit on
      HTTP errors is needed.
  - question: Why should I never use -k/--insecure in cURL?
    answer: >-
      The -k flag disables TLS certificate verification, making requests
      vulnerable to man-in-the-middle attacks. If you need to trust a custom CA,
      use --cacert to specify it explicitly. Only use -k for local development
      with self-signed certificates, never in production scripts.
relatedItems:
  - curl-error-handling-rules
  - curl-security-rules
  - curl-api-tester
version: 1.0.0
lastUpdated: '2026-03-11'
---

# cURL Command Standards

## Rule
All cURL commands in scripts MUST include -sS flags, explicit Content-Type headers for request bodies, and use environment variables for credentials.

## Required Flags for Scripts
```bash
# ALWAYS use in automated scripts
curl -sS \              # Silent + show errors
  --fail-with-body \    # Non-zero exit on HTTP errors
  --compressed \         # Accept compressed responses
  -H "Content-Type: application/json" \  # Explicit content type
  https://api.example.com/endpoint
```

## Flag Meanings
| Flag | Purpose | When to Use |
|------|---------|-------------|
| -s | Silent (no progress) | Always in scripts |
| -S | Show errors even in silent mode | Always with -s |
| -f | Fail on HTTP errors | CI/CD scripts |
| --compressed | Accept gzip/deflate/br | Always |
| -w | Format output | Response parsing |
| -o | Output to file | Downloads |
| -v | Verbose debug output | Interactive debugging only |

## Command Formatting

### Good — Readable, Multi-line
```bash
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "role": "admin"}' \
  "https://api.example.com/users"
```

### Bad — One-liner, Hardcoded Credentials
```bash
curl -X POST -H "Authorization: Bearer sk-1234567890" -d '{"name":"Alice"}' https://api.example.com/users
```

## Credential Rules
```bash
# Good — environment variables
curl -sS -H "Authorization: Bearer $API_TOKEN" "$API_URL/users"

# Good — .env file loaded
source .env
curl -sS -H "X-API-Key: $API_KEY" "$BASE_URL/data"

# Bad — hardcoded credentials
curl -sS -H "Authorization: Bearer sk-abc123real-token" https://api.example.com/users
```

## Anti-Patterns
- Missing -s in scripts (progress bar breaks output parsing)
- Hardcoded tokens and credentials
- One-line commands > 120 characters (unreadable)
- Using -k/--insecure in production (disables TLS verification)
- Missing Content-Type for POST/PUT requests
- Using -v in automated scripts (noisy output)
