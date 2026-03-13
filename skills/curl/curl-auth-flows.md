---
id: curl-auth-flows
stackId: curl
type: skill
name: Authentication Flows with cURL
description: >-
  Implement complete authentication flows with cURL — Bearer tokens, OAuth2,
  API keys, Basic auth, cookie sessions, and JWT refresh patterns for API
  testing and automation.
difficulty: beginner
tags:
  - curl
  - authentication
  - flows
  - security
  - testing
  - automation
  - debugging
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Authentication Flows with cURL skill?"
    answer: >-
      Implement complete authentication flows with cURL — Bearer tokens,
      OAuth2, API keys, Basic auth, cookie sessions, and JWT refresh patterns
      for API testing and automation. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Authentication Flows with cURL require?"
    answer: >-
      Works with standard curl tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working curl environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Authentication Flows with cURL

## Overview
Every API requires authentication. Master cURL authentication patterns to test any API — from simple API keys to complex OAuth2 flows with token refresh.

## Why This Matters
- **API testing** — most endpoints require auth to access
- **Automation** — scripts need programmatic auth flows
- **Debugging** — isolate auth issues from application logic
- **Security** — understand proper credential handling

## How It Works

### Step 1: Bearer Token Authentication
```bash
# Most common API authentication
TOKEN="your-api-token"
curl -sS -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/users
```

### Step 2: OAuth2 Authorization Code Flow
```bash
# Step 1: Get authorization code (browser redirect)
# https://auth.example.com/authorize?client_id=ID&redirect_uri=URI&response_type=code

# Step 2: Exchange code for token
TOKEN_RESPONSE=$(curl -sS -X POST https://auth.example.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=$AUTH_CODE" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "redirect_uri=$REDIRECT_URI")

ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.access_token')
REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.refresh_token')

# Step 3: Use access token
curl -sS -H "Authorization: Bearer $ACCESS_TOKEN" \
  https://api.example.com/protected

# Step 4: Refresh when expired
NEW_TOKEN=$(curl -sS -X POST https://auth.example.com/token \
  -d "grant_type=refresh_token" \
  -d "refresh_token=$REFRESH_TOKEN" \
  -d "client_id=$CLIENT_ID" | jq -r '.access_token')
```

### Step 3: API Key Authentication
```bash
# As header (most common)
curl -sS -H "X-API-Key: $API_KEY" https://api.example.com/data

# As query parameter (less secure)
curl -sS "https://api.example.com/data?api_key=$API_KEY"
```

### Step 4: Basic Authentication
```bash
# Using -u flag (encodes to Base64 automatically)
curl -sS -u "username:password" https://api.example.com/data

# Manual Base64 header
AUTH=$(echo -n "username:password" | base64)
curl -sS -H "Authorization: Basic $AUTH" https://api.example.com/data
```

### Step 5: Cookie-Based Sessions
```bash
# Login and save cookies
curl -sS -c cookies.txt -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}' \
  https://app.example.com/api/login

# Use cookies in subsequent requests
curl -sS -b cookies.txt https://app.example.com/api/dashboard

# Clean up
rm cookies.txt
```

## Best Practices
- Store credentials in environment variables, never in scripts
- Use `-u` for Basic auth (handles encoding automatically)
- Save cookies to temp files with mktemp, delete after use
- Implement token refresh logic for long-running scripts
- Use `--fail-with-body` to get error details on auth failure

## Common Mistakes
- Hardcoding tokens in scripts (committed to version control)
- Sending credentials over HTTP (must be HTTPS)
- Not handling token expiration in automated scripts
- Using query parameter auth when header auth is available
- Leaving cookie files on disk after script completes
