---
id: xh-request-basics
stackId: xh
type: skill
name: HTTP Requests with xh
description: >-
  Make HTTP requests with xh — GET, POST, PUT, DELETE, JSON handling, headers,
  query parameters, form data, and leveraging xh's intuitive HTTPie-compatible
  syntax for API interactions.
difficulty: beginner
tags:
  - xh
  - http-requests
  - json
  - get
  - post
  - api-testing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - xh installed
faq:
  - question: How is xh different from HTTPie?
    answer: >-
      xh uses the same key=value syntax as HTTPie but is written in Rust for
      2-5x better performance. It handles JSON automatically, colorizes output,
      and supports the same request syntax. Missing from xh: persistent
      sessions, config file, and plugins. xh is a lean, fast alternative for
      daily API testing.
  - question: How do I send arrays and objects in xh?
    answer: >-
      Use := with JSON syntax: tags:='["a","b"]' for arrays,
      metadata:='{"key":"value"}' for objects. The := operator sends raw JSON
      (not strings). Regular = always sends strings. This matches HTTPie syntax
      exactly.
  - question: What does the xhs command do?
    answer: >-
      xhs is a shortcut for xh https://. Instead of typing xh
      https://api.example.com/users, type xhs api.example.com/users. It
      automatically prepends https://. This saves keystrokes for the most common
      case (HTTPS requests).
relatedItems:
  - xh-response-handling
  - xh-download-progress
  - xh-http-client
version: 1.0.0
lastUpdated: '2026-03-12'
---

# HTTP Requests with xh

## Overview
xh is a fast, user-friendly HTTP client with HTTPie-compatible syntax. It automatically handles JSON, colorizes output, and provides an intuitive key=value syntax for quick API testing.

## Why This Matters
- **Speed** — Rust-based, 2-5x faster than HTTPie
- **Readability** — intuitive syntax is self-documenting
- **JSON native** — automatic Content-Type and formatting
- **Productivity** — fewer keystrokes than cURL for common tasks

## How It Works

### Step 1: GET Requests
```bash
# Simple GET
xh https://api.example.com/users

# HTTPS shortcut
xhs api.example.com/users    # auto-prepends https://

# With query parameters
xh https://api.example.com/search q==python page==1 limit==20

# Headers only (no body)
xh --headers https://api.example.com/health

# Specific output parts
xh --print=b https://api.example.com/users    # body only
xh --print=h https://api.example.com/users    # response headers only
xh --print=Hb https://api.example.com/users   # request headers + response body
```

### Step 2: POST with JSON
```bash
# String values (= operator)
xh POST https://api.example.com/users \
  name="Alice" \
  email="alice@example.com"

# Non-string values (:= operator)
xh POST https://api.example.com/users \
  name="Alice" \
  age:=30 \
  active:=true \
  roles:='["admin","user"]' \
  metadata:='{"source":"cli"}'

# JSON from stdin
echo '{"name":"Alice"}' | xh POST https://api.example.com/users

# Raw JSON body
xh POST https://api.example.com/data \
  Content-Type:application/json \
  --raw='{"custom":"payload"}'
```

### Step 3: PUT, PATCH, DELETE
```bash
# Update resource
xh PUT https://api.example.com/users/1 \
  name="Alice Updated" \
  email="newalice@example.com"

# Partial update
xh PATCH https://api.example.com/users/1 \
  name="Alice Patched"

# Delete
xh DELETE https://api.example.com/users/1

# Custom method
xh OPTIONS https://api.example.com/users
```

### Step 4: Form Data & Files
```bash
# Form submission (-f flag)
xh -f POST https://api.example.com/login \
  username=admin \
  password=secret

# File upload
xh -f POST https://api.example.com/upload \
  file@document.pdf \
  description="Monthly report"

# Multiple files
xh -f POST https://api.example.com/upload \
  files@photo1.jpg \
  files@photo2.jpg
```

### Step 5: Authentication
```bash
# Basic auth
xh -a user:password https://api.example.com/data

# Bearer token
xh -A bearer -a "$TOKEN" https://api.example.com/data

# Custom auth header
xh https://api.example.com/data \
  Authorization:"Bearer $TOKEN"

# API key header
xh https://api.example.com/data \
  X-API-Key:"$API_KEY"
```

## Best Practices
- Use `xhs` shortcut for HTTPS URLs (saves typing)
- Use `:=` for numbers, booleans, arrays (not strings)
- Use `--print=b` when piping output to jq
- Use `==` for query parameters (cleaner than URL concatenation)
- Use `-f` flag for form data (switches Content-Type)

## Common Mistakes
- Using = for numbers (sends string "30" instead of number 30)
- Missing -f flag for form data (defaults to JSON)
- Not using xhs shortcut for HTTPS
- Forgetting := for arrays and objects (sends as string)
- Piping colorized output to files (use --print=b)
