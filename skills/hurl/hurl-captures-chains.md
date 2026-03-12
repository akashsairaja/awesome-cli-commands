---
id: hurl-captures-chains
stackId: hurl
type: skill
name: Variable Captures and Request Chaining
description: >-
  Chain Hurl requests with variable captures — extract tokens, IDs, and dynamic
  values from responses to use in subsequent requests for multi-step API test
  flows.
difficulty: intermediate
tags:
  - captures
  - variables
  - request-chaining
  - dynamic-data
  - hurl
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Hurl installed
  - Understanding of basic Hurl syntax
faq:
  - question: How do I chain requests in Hurl?
    answer: >-
      Use [Captures] to extract values from responses: 'token: jsonpath
      "$.token"'. Then reference captured values in subsequent requests with
      {{token}} in URLs, headers, or body. This enables multi-step flows: login
      → create → verify → delete.
  - question: What types of values can Hurl capture?
    answer: >-
      Hurl captures JSONPath values (body fields), headers, cookies, regex
      matches, body text, and response metadata (status, duration). JSONPath
      captures are most common for REST APIs. Header captures are useful for
      ETag-based caching tests.
  - question: How do I pass variables to Hurl from the command line?
    answer: >-
      Use --variable key=value: 'hurl --test --variable
      base_url=http://localhost:3000 test.hurl'. In the .hurl file, reference as
      {{base_url}}. This separates environment configuration from test logic.
relatedItems:
  - hurl-test-patterns
  - hurl-ci-integration
  - hurl-http-testing-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Variable Captures and Request Chaining

## Overview
Hurl captures let you extract values from HTTP responses and inject them into subsequent requests. This enables multi-step test flows — login to get a token, create a resource to get an ID, then verify and delete using those dynamic values.

## How It Works

### Basic Capture and Reuse
```hurl
# Step 1: Login and capture token
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "pass123"
}

HTTP 200
[Captures]
token: jsonpath "$.token"
user_id: jsonpath "$.user.id"

# Step 2: Use captured token
GET http://localhost:3000/api/users/{{user_id}}
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{user_id}}
jsonpath "$.email" == "user@example.com"
```

### Full CRUD Flow
```hurl
# Login
POST {{base_url}}/api/auth/login
Content-Type: application/json
{ "email": "admin@test.com", "password": "admin123" }

HTTP 200
[Captures]
token: jsonpath "$.token"

# Create product
POST {{base_url}}/api/products
Authorization: Bearer {{token}}
Content-Type: application/json
{
  "name": "Test Product",
  "price": 29.99,
  "category": "electronics"
}

HTTP 201
[Captures]
product_id: jsonpath "$.id"
[Asserts]
jsonpath "$.name" == "Test Product"

# Read product
GET {{base_url}}/api/products/{{product_id}}
Authorization: Bearer {{token}}

HTTP 200
[Asserts]
jsonpath "$.id" == {{product_id}}
jsonpath "$.name" == "Test Product"
jsonpath "$.price" == 29.99

# Update product
PATCH {{base_url}}/api/products/{{product_id}}
Authorization: Bearer {{token}}
Content-Type: application/json
{ "price": 39.99 }

HTTP 200
[Asserts]
jsonpath "$.price" == 39.99

# Delete product
DELETE {{base_url}}/api/products/{{product_id}}
Authorization: Bearer {{token}}

HTTP 204

# Verify deletion
GET {{base_url}}/api/products/{{product_id}}
Authorization: Bearer {{token}}

HTTP 404
```

### Capture Types
```hurl
[Captures]
# JSONPath
token: jsonpath "$.data.token"
count: jsonpath "$.items" count

# Header
request_id: header "X-Request-Id"
etag: header "ETag"

# Body
raw_body: body

# Regex
version: regex "version: (\d+\.\d+)"

# Cookie
session: cookie "session_id"
```

### Using External Variables
```bash
# Pass variables from CLI
hurl --test \
  --variable base_url=http://localhost:3000 \
  --variable admin_email=admin@test.com \
  --variable admin_password=secret \
  crud-flow.hurl
```

## Best Practices
- Capture dynamic values (IDs, tokens) immediately after creation
- Use meaningful variable names: `product_id` not `id1`
- Pass environment-specific values via --variable (not hardcoded)
- Clean up created resources at the end of test flows (DELETE step)
- Chain captures forward — each step builds on previous captures

## Common Mistakes
- Hardcoding IDs instead of capturing from response
- Not cleaning up test data (created resources persist between runs)
- Variable name typos ({{tokken}} instead of {{token}})
- Not asserting captured values in subsequent requests
