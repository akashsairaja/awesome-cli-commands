---
id: curl-response-parsing
stackId: curl
type: skill
name: >-
  Response Parsing & Debugging
description: >-
  Parse and debug HTTP responses with cURL — status code extraction, header
  inspection, timing metrics, verbose output, and jq integration for JSON API
  response analysis.
difficulty: intermediate
tags:
  - curl
  - response
  - parsing
  - debugging
  - monitoring
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Response Parsing & Debugging skill?"
    answer: >-
      Parse and debug HTTP responses with cURL — status code extraction,
      header inspection, timing metrics, verbose output, and jq integration
      for JSON API response analysis. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Response Parsing & Debugging require?"
    answer: >-
      Works with standard curl tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working curl environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Response Parsing & Debugging

## Overview
cURL's output formatting and verbose modes let you inspect every aspect of HTTP communication — status codes, headers, timing, redirects, and TLS details. Combined with jq, you get complete API response analysis from the command line.

## Why This Matters
- **Debugging** — see exactly what's sent and received
- **Monitoring** — track response times and status codes
- **Validation** — verify API responses match expectations
- **Troubleshooting** — diagnose TLS, redirect, and header issues

## How It Works

### Step 1: Extract Status Code
```bash
# Get just the status code
curl -sS -o /dev/null -w "%{http_code}" https://api.example.com/health

# Get status code AND body
response=$(curl -sS -w "\n%{http_code}" https://api.example.com/users)
body=$(echo "$response" | sed '$d')
status=$(echo "$response" | tail -1)
echo "Status: $status"
echo "Body: $body"
```

### Step 2: Inspect Headers
```bash
# Response headers only
curl -sS -I https://api.example.com/health

# Both request and response headers
curl -sS -v https://api.example.com/health 2>&1 | grep -E "^[<>]"

# Specific header value
curl -sS -I https://api.example.com/data | grep -i "content-type"
```

### Step 3: Timing Metrics
```bash
# Detailed timing breakdown
curl -sS -o /dev/null -w "\
  DNS:        %{time_namelookup}s\n\
  Connect:    %{time_connect}s\n\
  TLS:        %{time_appconnect}s\n\
  TTFB:       %{time_starttransfer}s\n\
  Total:      %{time_total}s\n\
  Status:     %{http_code}\n\
  Size:       %{size_download} bytes\n" \
  https://api.example.com/health

# Quick timing check
curl -sS -o /dev/null -w "Total: %{time_total}s, Status: %{http_code}\n" \
  https://api.example.com/health
```

### Step 4: JSON Response Parsing with jq
```bash
# Pretty-print JSON response
curl -sS https://api.example.com/users | jq '.'

# Extract specific field
curl -sS https://api.example.com/users/123 | jq '.data.email'

# Extract from array
curl -sS https://api.example.com/users | jq '.data[].name'

# Filter and transform
curl -sS https://api.example.com/users | jq '.data[] | {name, email}'

# Validate field exists (exit non-zero if null)
curl -sS https://api.example.com/users/123 | jq -e '.data.id != null'
```

### Step 5: Full Debug Mode
```bash
# Verbose output (request + response headers + TLS)
curl -v https://api.example.com/health 2>&1

# Trace (raw bytes)
curl --trace - https://api.example.com/health

# Trace to file
curl --trace trace.log https://api.example.com/health
```

## Best Practices
- Use `-w` format strings for scriptable output
- Combine `-o /dev/null` with `-w` for metadata-only checks
- Pipe through jq for JSON formatting and extraction
- Use `-v` for debugging, `-s` for scripting (never both)
- Include timing metrics in monitoring scripts

## Common Mistakes
- Using -v in automated scripts (noisy, breaks parsing)
- Not separating status code from body (can't validate properly)
- Parsing JSON with grep instead of jq (fragile, breaks on format changes)
- Missing -s flag in scripts (progress bar corrupts output)
- Not checking status code before parsing body (invalid JSON on errors)
