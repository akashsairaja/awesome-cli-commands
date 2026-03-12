---
id: curl-error-handling-rules
stackId: curl
type: rule
name: cURL Error Handling Rules
description: >-
  Standards for handling errors in cURL scripts — exit code checking, HTTP
  status validation, timeout configuration, retry logic, and error logging for
  robust API automation.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/*.bash'
tags:
  - error-handling
  - timeouts
  - retry
  - exit-codes
  - logging
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: What timeouts should cURL scripts always have?
    answer: >-
      Set --connect-timeout (TCP connection timeout, typically 5-10 seconds) and
      --max-time (total request timeout). Use 5s for health checks, 30s for API
      calls, 300s for file downloads. Without timeouts, scripts hang
      indefinitely on network issues.
  - question: How do I implement retry logic in cURL?
    answer: >-
      Use --retry 3 --retry-delay 2 --retry-all-errors for built-in retry. For
      custom backoff, wrap curl in a loop with increasing sleep delays. Always
      set --retry-max-time to prevent infinite retry loops.
relatedItems:
  - curl-command-standards
  - curl-security-rules
  - curl-script-builder
version: 1.0.0
lastUpdated: '2026-03-11'
---

# cURL Error Handling Rules

## Rule
All cURL scripts MUST check exit codes, validate HTTP status codes, configure timeouts, and implement retry logic for network operations.

## Exit Code Checking (Required)
```bash
# Good — check exit code
response=$(curl -sS -w "\n%{http_code}" "$URL" 2>&1)
exit_code=$?

if [ $exit_code -ne 0 ]; then
  echo "Error: cURL failed with exit code $exit_code" >&2
  exit 1
fi

status=$(echo "$response" | tail -1)
if [ "$status" -ge 400 ]; then
  echo "Error: HTTP $status from $URL" >&2
  exit 1
fi

# Bad — no error checking
response=$(curl "$URL")
echo "$response"  # Might be error message, empty, or invalid
```

## Timeout Configuration (Required)
```bash
# Always set timeouts in scripts
curl -sS \
  --connect-timeout 5 \     # Connection timeout (seconds)
  --max-time 30 \           # Total request timeout
  "$URL"

# Different timeouts for different operations
# Health checks: --max-time 5
# API calls: --max-time 30
# File downloads: --max-time 300
# Uploads: --max-time 600
```

## Retry Logic (Required for Critical Operations)
```bash
# Built-in retry
curl -sS \
  --retry 3 \               # Number of retries
  --retry-delay 2 \         # Seconds between retries
  --retry-max-time 30 \     # Max total retry time
  --retry-all-errors \      # Retry on all errors (not just transient)
  "$URL"

# Custom retry with backoff
retry_curl() {
  local max_attempts=3 attempt=1
  while [ $attempt -le $max_attempts ]; do
    if response=$(curl -sS --max-time 30 "$@" 2>&1); then
      echo "$response"
      return 0
    fi
    echo "Attempt $attempt failed, retrying in $((attempt * 2))s..." >&2
    sleep $((attempt * 2))
    ((attempt++))
  done
  echo "Error: All $max_attempts attempts failed" >&2
  return 1
}
```

## Error Logging
```bash
# Log errors with timestamp and context
log_error() {
  echo "[$(date -Iseconds)] ERROR: $*" >> curl_errors.log
}

response=$(curl -sS -w "\n%{http_code}" "$URL" 2>&1)
status=$(echo "$response" | tail -1)

if [ "$status" -ge 400 ]; then
  body=$(echo "$response" | sed '$d')
  log_error "HTTP $status from $URL: $body"
fi
```

## Anti-Patterns
- No timeout set (requests hang forever on network issues)
- No retry logic for critical operations (one blip = failure)
- Ignoring exit codes (script continues after failure)
- Not separating stdout from stderr
- No error logging (can't diagnose failures after the fact)
- Using --max-time 0 (no timeout, infinite wait)
