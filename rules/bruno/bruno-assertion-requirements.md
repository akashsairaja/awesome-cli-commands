---
id: bruno-assertion-requirements
stackId: bruno
type: rule
name: Mandatory Response Assertions
description: >-
  Require assertions on every Bruno request — status codes, response body
  structure, and key field validation must be present to prevent requests from
  passing without verification.
difficulty: beginner
globs:
  - '**/*.bru'
  - '**/api-tests/**'
tags:
  - assertions
  - validation
  - test-quality
  - response-checking
  - bruno
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
  - question: Why must every Bruno request have assertions?
    answer: >-
      Without assertions, a request that returns a 500 error 'passes' — it
      completed without crashing Bruno. Assertions verify that the API returned
      the expected status code, body structure, and data values. They turn API
      exploration into automated testing.
  - question: What is the minimum assertion for a Bruno request?
    answer: >-
      At minimum, assert the HTTP status code (res.status: eq 200) and verify
      the response body exists (res.body: isDefined). For comprehensive testing,
      also validate key response fields, content-type headers, and response
      structure.
relatedItems:
  - bruno-version-control
  - bruno-environment-security
  - bruno-scripting-assertions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Mandatory Response Assertions

## Rule
Every Bruno request MUST include assertions that validate the response. Requests without assertions are prohibited — they exercise the API without verifying behavior.

## Minimum Required Assertions
```
assert {
  res.status: eq 200          # Always check status code
  res.body.data: isDefined     # Always validate response structure
}
```

## Per-Method Requirements

### GET Requests
```
assert {
  res.status: eq 200
  res.body: isDefined
  res.headers.content-type: contains "application/json"
}
```

### POST Requests (Create)
```
assert {
  res.status: eq 201
  res.body.id: isDefined
  res.body.name: eq "{{expectedName}}"
}
```

### PUT/PATCH Requests (Update)
```
assert {
  res.status: eq 200
  res.body.updatedAt: isDefined
}
```

### DELETE Requests
```
assert {
  res.status: eq 204
}
```

### Error Responses
```
assert {
  res.status: eq 401
  res.body.error: isDefined
}
```

## Examples

### Good
```
meta { name: List Products }
get { url: {{baseUrl}}/api/products }

assert {
  res.status: eq 200
  res.body.data: isArray
  res.body.pagination.total: gte 0
  res.headers.content-type: contains "application/json"
}
```

### Bad
```
meta { name: List Products }
get { url: {{baseUrl}}/api/products }
# No assertions — passes even if API returns 500
```

## Anti-Patterns
- Requests with no assert block and no post-response script assertions
- Checking only status code without response body validation
- Only testing success cases (200, 201) without error cases (401, 422, 500)
- Using Bruno purely for manual exploration without any assertions
