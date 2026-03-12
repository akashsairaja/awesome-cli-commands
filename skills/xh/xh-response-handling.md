---
id: xh-response-handling
stackId: xh
type: skill
name: Response Handling & Debugging with xh
description: >-
  Inspect and debug HTTP responses with xh — status codes, headers, verbose
  mode, response timing, and integrating xh output with jq for JSON processing
  pipelines.
difficulty: intermediate
tags:
  - response
  - debugging
  - status-codes
  - jq-integration
  - headers
  - verbose
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - xh installed
  - jq installed (for JSON processing)
faq:
  - question: How do I check if an API is healthy with xh?
    answer: >-
      Use --check-status and --quiet: xh --check-status --quiet url. Exit code 0
      means 2xx, non-zero means error. Use in scripts: if xh --check-status
      --quiet url; then echo 'OK'; else echo 'DOWN'; fi. Add --timeout=5 for
      health checks.
  - question: How do I extract JSON fields from xh responses?
    answer: >-
      Pipe through jq with --print=b: xh --print=b url | jq '.field'. The
      --print=b flag outputs only the response body (no headers). Store in
      variable: value=$(xh --print=b url | jq -r '.data.name'). Use -r flag in
      jq for raw strings.
  - question: What do xh exit codes mean?
    answer: >-
      0: success (2xx). 2: request error (connection failed, timeout). 3:
      redirect (3xx, when not following). 4: client error (4xx). 5: server error
      (5xx). Use --check-status to enable these exit codes (without it, xh
      always exits 0 if the request completed).
relatedItems:
  - xh-request-basics
  - xh-download-progress
  - xh-scripting-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Response Handling & Debugging with xh

## Overview
xh provides multiple ways to inspect HTTP responses — print flags, verbose mode, and status checking. Combined with jq, it forms a powerful API debugging and data extraction toolkit.

## Why This Matters
- **Debugging** — inspect every aspect of HTTP communication
- **Automation** — extract data from responses in scripts
- **Monitoring** — check API health with status codes
- **Integration** — pipe JSON responses to jq for processing

## How It Works

### Step 1: Print Control
```bash
# Print flags: H=request headers, B=request body, h=response headers, b=response body
xh --print=Hh https://api.example.com/users     # all headers, no body
xh --print=b https://api.example.com/users       # response body only
xh --print=hb https://api.example.com/users      # response headers + body
xh --print=HBhb https://api.example.com/users    # everything

# Verbose (shortcut for everything)
xh --verbose https://api.example.com/users

# Quiet (status line only)
xh --quiet https://api.example.com/health
```

### Step 2: Status Code Handling
```bash
# Check status (non-zero exit on HTTP errors)
xh --check-status https://api.example.com/health
echo $?    # 0 = success, non-zero = HTTP error

# Use in conditionals
if xh --check-status --quiet https://api.example.com/health 2>/dev/null; then
  echo "API is healthy"
else
  echo "API is down"
fi

# Status code ranges:
# Exit 0: 2xx success
# Exit 3: 3xx redirect
# Exit 4: 4xx client error
# Exit 5: 5xx server error
```

### Step 3: JSON Processing with jq
```bash
# Extract fields
xh --print=b https://api.example.com/users | jq '.[].name'

# Filter and transform
xh --print=b https://api.example.com/users | jq '
  map(select(.active == true)) | map({name, email})
'

# Count results
xh --print=b https://api.example.com/users | jq 'length'

# Store in variable
user_count=$(xh --print=b https://api.example.com/users | jq 'length')
echo "Total users: $user_count"

# Extract single field
token=$(xh --print=b POST https://api.example.com/auth \
  email=admin@example.com password=secret | jq -r '.token')
echo "Token: $token"
```

### Step 4: Debugging Workflow
```bash
# Full request/response inspection
xh --verbose POST https://api.example.com/users \
  name="test" email="test@example.com"

# Check response headers for debugging
xh --print=h https://api.example.com/data | grep -i "x-request-id"

# Follow redirects
xh --follow https://example.com/old-path

# Timeout control
xh --timeout=5 https://slow-api.example.com/data

# HTTP/2 inspection
xh --http-version=2 https://api.example.com/users
```

### Step 5: Download & Stream
```bash
# Download with progress
xh --download https://cdn.example.com/archive.zip

# Download to specific file
xh --download --output=report.pdf https://api.example.com/reports/latest

# Stream response (NDJSON, SSE)
xh --stream https://api.example.com/events
```

## Best Practices
- Use --print=b when piping to jq (excludes headers)
- Use --check-status in scripts for error handling
- Use --verbose for debugging, --quiet for health checks
- Use --timeout to prevent hanging in scripts
- Use --follow for APIs that redirect

## Common Mistakes
- Piping full output (with headers) to jq (parse error)
- Not using --check-status in scripts (ignoring HTTP errors)
- Missing --print=b when storing response in variable
- No --timeout in automated scripts (hangs indefinitely)
- Using --verbose in production scripts (noisy output)
