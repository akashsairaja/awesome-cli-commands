---
id: httpie-json-api-testing
stackId: httpie
type: skill
name: JSON API Testing with HTTPie
description: >-
  Test JSON APIs effectively with HTTPie — request construction, JSON type
  handling, response inspection, and building readable API test workflows with
  automatic content negotiation.
difficulty: intermediate
tags:
  - httpie
  - json
  - api
  - testing
  - debugging
  - best-practices
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the JSON API Testing with HTTPie skill?"
    answer: >-
      Test JSON APIs effectively with HTTPie — request construction, JSON type
      handling, response inspection, and building readable API test workflows
      with automatic content negotiation. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does JSON API Testing with HTTPie require?"
    answer: >-
      Requires pip/poetry installed. Works with httpie projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# JSON API Testing with HTTPie

## Overview
HTTPie is designed for JSON APIs. It automatically sets Content-Type, formats JSON output, and uses intuitive key=value syntax. Learn to leverage these features for fast, readable API testing.

## Why This Matters
- **Speed** — test APIs without constructing raw JSON strings
- **Readability** — self-documenting commands that serve as examples
- **Debugging** — colorized, formatted output for quick inspection
- **Accuracy** — type-safe JSON construction with := syntax

## How It Works

### Step 1: GET Requests
```bash
# Simple GET
http https://api.example.com/users

# With query parameters
http https://api.example.com/users page==2 limit==10 sort==name

# With custom headers
http https://api.example.com/users Authorization:"Bearer $TOKEN"

# Body only (no headers)
http --body https://api.example.com/users
```

### Step 2: POST with JSON Types
```bash
# Strings (= operator)
http POST https://api.example.com/users name="Alice"

# Numbers and booleans (:= operator)
http POST https://api.example.com/users \
  name="Alice" \
  age:=30 \
  active:=true

# Arrays and objects (:= with JSON)
http POST https://api.example.com/users \
  name="Alice" \
  tags:='["dev","lead"]' \
  address:='{"city":"NYC","zip":"10001"}'

# Nested keys
http POST https://api.example.com/users \
  name="Alice" \
  address[city]="New York" \
  address[zip]="10001"

# From file
http POST https://api.example.com/users < payload.json
```

### Step 3: Response Inspection
```bash
# Full response (headers + body)
http -v https://api.example.com/users/1

# Print control (H=req headers, B=req body, h=resp headers, b=resp body)
http --print=hb https://api.example.com/users/1

# Headers only
http --headers https://api.example.com/users/1

# Pipe through jq for further processing
http --body https://api.example.com/users | jq '.[].email'
```

### Step 4: PUT, PATCH, DELETE
```bash
# Full update
http PUT https://api.example.com/users/1 \
  name="Alice Updated" age:=31

# Partial update
http PATCH https://api.example.com/users/1 age:=31

# Delete
http DELETE https://api.example.com/users/1

# Delete with confirmation body
http DELETE https://api.example.com/users/1 confirm:=true
```

## Best Practices
- Use := for non-string JSON values (numbers, booleans, arrays)
- Use --body flag when piping to jq (strips headers)
- Use -v for debugging (shows request headers and body)
- Let HTTPie handle Content-Type (don't set it manually for JSON)
- Use query parameter syntax == instead of concatenating URLs

## Common Mistakes
- Using = for numbers (sends "30" string instead of 30 number)
- Manually setting Content-Type for JSON (HTTPie does this automatically)
- Forgetting := for boolean values (sends "true" string, not true)
- Not using --body when piping output (headers break jq parsing)
- Building URL with query strings instead of using == syntax
