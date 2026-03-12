---
id: hurl-test-patterns
stackId: hurl
type: skill
name: Hurl Test File Patterns
description: >-
  Write effective Hurl test files with HTTP requests, JSONPath assertions,
  header validation, and status code checks for comprehensive API testing in
  plain text.
difficulty: beginner
tags:
  - test-files
  - assertions
  - jsonpath
  - http-requests
  - hurl
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Hurl installed
  - API endpoints to test
faq:
  - question: How do I write a basic Hurl test?
    answer: >-
      A Hurl test file contains an HTTP request (method, URL, headers, body)
      followed by expected response assertions. Start with 'GET http://url',
      then 'HTTP 200' for the expected status, and [Asserts] for body validation
      using JSONPath queries. Run with 'hurl --test file.hurl'.
  - question: What assertion types does Hurl support?
    answer: >-
      Hurl supports: JSONPath assertions (field exists, equals value, count,
      type checking), header assertions (presence, value matching), status code
      assertions, body assertions (contains, matches regex), and duration
      assertions (response time). Combine multiple assertions per response.
  - question: Can Hurl test non-JSON APIs?
    answer: >-
      Yes. Hurl supports JSON, XML, HTML, and plain text responses. Use 'body
      contains' for text matching, 'xpath' for XML/HTML queries, and 'regex' for
      pattern matching. It also supports file uploads, multipart forms, and
      binary responses.
relatedItems:
  - hurl-captures-chains
  - hurl-ci-integration
  - hurl-http-testing-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Hurl Test File Patterns

## Overview
Hurl test files define HTTP requests and expected responses in plain text. Each file can contain multiple requests executed sequentially, with assertions validating every response. The syntax is readable, git-friendly, and requires no programming language.

## How It Works

### Basic Request with Assertions
```hurl
# Get all users
GET http://localhost:3000/api/users

HTTP 200
Content-Type: application/json
[Asserts]
jsonpath "$.data" isCollection
jsonpath "$.data" count > 0
jsonpath "$.pagination.total" >= 1
```

### POST with Body and Assertions
```hurl
# Create a new user
POST http://localhost:3000/api/users
Content-Type: application/json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "role": "user"
}

HTTP 201
[Asserts]
jsonpath "$.id" exists
jsonpath "$.name" == "Alice Johnson"
jsonpath "$.email" == "alice@example.com"
jsonpath "$.createdAt" exists
```

### Authentication Flow
```hurl
# Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json
{
  "email": "admin@example.com",
  "password": "password123"
}

HTTP 200
[Asserts]
jsonpath "$.token" exists
jsonpath "$.user.role" == "admin"
[Captures]
auth_token: jsonpath "$.token"

# Access protected endpoint
GET http://localhost:3000/api/profile
Authorization: Bearer {{auth_token}}

HTTP 200
[Asserts]
jsonpath "$.email" == "admin@example.com"
```

### Testing Error Responses
```hurl
# Unauthorized access
GET http://localhost:3000/api/profile

HTTP 401
[Asserts]
jsonpath "$.error" == "Unauthorized"

# Invalid request body
POST http://localhost:3000/api/users
Content-Type: application/json
{
  "email": "not-an-email"
}

HTTP 422
[Asserts]
jsonpath "$.errors" isCollection
jsonpath "$.errors[0].field" exists
```

### Testing Headers
```hurl
GET http://localhost:3000/api/products

HTTP 200
Content-Type: application/json; charset=utf-8
[Asserts]
header "X-Request-Id" exists
header "Cache-Control" contains "max-age"
```

## Running Tests
```bash
# Run a single test file
hurl --test users.hurl

# Run all tests in a directory
hurl --test *.hurl

# Run with variables
hurl --test --variable base_url=http://localhost:3000 users.hurl

# Run with verbose output
hurl --test --very-verbose users.hurl
```

## Best Practices
- One logical test flow per .hurl file (auth → create → read → delete)
- Assert status codes, content-type, AND body content on every response
- Use [Captures] to chain dynamic values between requests
- Test both success (2xx) and error (4xx, 5xx) responses
- Use --variable for environment-specific values (URLs, credentials)
- Name files descriptively: `create-user.hurl`, `auth-flow.hurl`

## Common Mistakes
- No assertions (just HTTP requests without validation)
- Only asserting status codes (body structure unchecked)
- Hardcoded URLs instead of using --variable
- All tests in one giant file (hard to debug and maintain)
