---
id: xh-scripting-patterns
stackId: xh
type: rule
name: XH Scripting and Automation Patterns
description: >-
  Use xh effectively in shell scripts and automation — proper exit code
  handling, output formatting for piping, error handling, and integration with
  jq for JSON processing.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/Makefile'
  - '**/Taskfile.yml'
tags:
  - scripting
  - automation
  - exit-codes
  - jq-integration
  - error-handling
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
  - question: How do I handle HTTP errors in xh scripts?
    answer: >-
      Use --check-status flag to make xh exit with non-zero codes on HTTP
      errors: exit 4 for 4xx, exit 5 for 5xx. Without this flag, xh exits 0 even
      on error responses. Combine with set -e in bash scripts to stop execution
      on the first failed request.
  - question: How do I pipe xh output to jq correctly?
    answer: >-
      Always use '-b' flag (body only) when piping to jq: 'xh -b
      api.example.com/data | jq .query'. Without -b, xh includes colorized
      headers in the output which breaks JSON parsing. Add -q to suppress
      progress output in scripts and CI environments.
relatedItems:
  - xh-usage-conventions
  - xh-auth-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# XH Scripting and Automation Patterns

## Rule
When using xh in scripts, always use --check-status for exit codes, -b for body-only output when piping, and -q to suppress progress indicators. Handle HTTP errors with proper exit code checking.

## Exit Codes with --check-status
| Exit Code | Meaning |
|-----------|---------|
| 0 | Success (2xx) |
| 2 | Request error |
| 3 | 3xx redirect |
| 4 | 4xx client error |
| 5 | 5xx server error |

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

API_URL="https://api.example.com"
TOKEN="${API_TOKEN:?API_TOKEN is required}"

# Function with proper error handling
fetch_users() {
  local response
  response="$(xh -b --check-status -A bearer -a "${TOKEN}" \
    "${API_URL}/users" page==1 limit==100)" || {
    echo "Error: Failed to fetch users (exit: $?)" >&2
    return 1
  }
  echo "${response}"
}

# Pipe to jq for processing
fetch_users | jq -r '.[] | "\(.id)\t\(.name)\t\(.email)"'

# Health check with retry
check_health() {
  local retries=5
  local delay=2
  for ((i = 1; i <= retries; i++)); do
    if xh -q --check-status "${API_URL}/health" 2>/dev/null; then
      echo "Service is healthy"
      return 0
    fi
    echo "Attempt $i/$retries failed, retrying in ${delay}s..." >&2
    sleep "${delay}"
  done
  echo "Health check failed after $retries attempts" >&2
  return 1
}

# POST and capture response
create_user() {
  local name="${1:?Usage: create_user <name> <email>}"
  local email="${2:?Usage: create_user <name> <email>}"

  xh -b --check-status POST "${API_URL}/users" \
    -A bearer -a "${TOKEN}" \
    name="${name}" email="${email}"
}

user_id="$(create_user "Alice" "alice@example.com" | jq -r '.id')"
echo "Created user: ${user_id}"
```

## Bad Examples
```bash
# BAD: No error handling
users=$(xh api.example.com/users)
echo "$users" | jq .  # Fails silently if request errored

# BAD: Full output when parsing
xh api.example.com/users | jq .  # Headers break jq
# Use: xh -b api.example.com/users | jq .

# BAD: No --check-status in script
xh api.example.com/missing-endpoint
echo "Success!"  # Prints even on 404!
```

## Enforcement
- Always use --check-status in scripts
- Always use -b when piping to jq or other processors
- Use -q in CI to suppress interactive progress output
- Check exit codes after every xh call in scripts
