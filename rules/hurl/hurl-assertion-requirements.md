---
id: hurl-assertion-requirements
stackId: hurl
type: rule
name: Mandatory Response Assertions
description: >-
  Require assertions on every Hurl HTTP response — status codes, content-type
  headers, and response body structure must be validated to prevent passing
  without verification.
difficulty: beginner
globs:
  - '**/*.hurl'
tags:
  - assertions
  - validation
  - test-quality
  - response-checking
  - hurl
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
  - question: Why must every Hurl request have assertions?
    answer: >-
      Without assertions, Hurl is just curl — it sends requests but does not
      verify responses. A 500 error response would 'pass' because Hurl completed
      without crashing. Assertions turn HTTP requests into automated tests that
      catch regressions.
  - question: What is the minimum assertion for a Hurl request?
    answer: >-
      At minimum, assert the HTTP status code (HTTP 200) and verify the response
      body has expected structure (jsonpath '$.data' exists). For comprehensive
      testing, also check content-type headers and key response field values.
relatedItems:
  - hurl-variable-usage
  - hurl-file-organization
  - hurl-test-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Response Assertions

## Rule
Every HTTP response in a .hurl file MUST include assertions. Bare HTTP requests without assertions are prohibited — they exercise the API without verifying behavior.

## Minimum Required Assertions
```hurl
GET http://localhost:3000/api/users

HTTP 200
Content-Type: application/json
[Asserts]
jsonpath "$.data" exists
```

## Per-Method Requirements

### GET
```hurl
GET {{base_url}}/api/products
HTTP 200
Content-Type: application/json
[Asserts]
jsonpath "$.data" isCollection
jsonpath "$.data" count >= 0
```

### POST
```hurl
POST {{base_url}}/api/products
Content-Type: application/json
{ "name": "Widget", "price": 10 }

HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.name" == "Widget"
```

### Error Responses
```hurl
GET {{base_url}}/api/protected
HTTP 401
[Asserts]
jsonpath "$.error" exists
```

## Examples

### Good
```hurl
GET {{base_url}}/api/health
HTTP 200
[Asserts]
jsonpath "$.status" == "healthy"
jsonpath "$.uptime" > 0
```

### Bad
```hurl
# No assertions — passes even on 500 errors
GET {{base_url}}/api/health
```

## Anti-Patterns
- HTTP requests with no expected status code
- Status code only without body assertions
- Only testing success (2xx) without error (4xx) cases
- Missing content-type assertion on JSON endpoints
