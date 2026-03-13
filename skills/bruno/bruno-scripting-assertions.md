---
id: bruno-scripting-assertions
stackId: bruno
type: skill
name: Scripting and Assertions in Bruno
description: >-
  Write pre-request and post-response scripts in Bruno for dynamic test data,
  variable extraction, response assertions, and request chaining across API
  test flows.
difficulty: intermediate
tags:
  - bruno
  - scripting
  - assertions
  - testing
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
  - question: "When should I use the Scripting and Assertions in Bruno skill?"
    answer: >-
      Write pre-request and post-response scripts in Bruno for dynamic test
      data, variable extraction, response assertions, and request chaining
      across API test flows. It includes practical examples for bruno
      development.
  - question: "What tools and setup does Scripting and Assertions in Bruno require?"
    answer: >-
      Works with standard bruno tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working bruno environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Scripting and Assertions in Bruno

## Overview
Bruno's scripting layer lets you add dynamic behavior to API tests — generate test data before requests, validate responses after, extract values for chaining, and implement complex test flows.

## How It Works

### Built-in Assertions (Declarative)
```
assert {
  res.status: eq 200
  res.body.name: eq "Alice"
  res.body.id: isDefined
  res.body.items: isArray
  res.body.count: gt 0
  res.body.email: contains "@"
  res.headers.content-type: contains "application/json"
}
```

### Pre-Request Scripts
```javascript
// script:pre-request
const timestamp = Date.now();
const uniqueEmail = `test-${timestamp}@example.com`;

bru.setVar("testEmail", uniqueEmail);
bru.setVar("testTimestamp", timestamp.toString());

// Set dynamic headers
req.setHeader("X-Request-ID", crypto.randomUUID());
```

### Post-Response Scripts
```javascript
// script:post-response
// Extract values for request chaining
bru.setVar("authToken", res.body.token);
bru.setVar("userId", res.body.user.id);

// Complex assertions
const users = res.body.data;
expect(users.length).toBeGreaterThan(0);
expect(users[0]).toHaveProperty("email");

// Validate response time
expect(res.responseTime).toBeLessThan(2000);
```

### Request Chaining Flow
```
1. Login.bru
   POST /auth/login
   script:post-response {
     bru.setVar("authToken", res.body.token);
   }

2. Create Product.bru
   POST /api/products
   auth:bearer { token: {{authToken}} }
   script:post-response {
     bru.setVar("productId", res.body.id);
   }

3. Get Product.bru
   GET /api/products/{{productId}}
   assert {
     res.status: eq 200
     res.body.id: eq {{productId}}
   }

4. Delete Product.bru
   DELETE /api/products/{{productId}}
   assert {
     res.status: eq 204
   }
```

### Testing Error Responses
```
// Test 401 Unauthorized
meta { name: Get Profile Without Auth }
get { url: {{baseUrl}}/api/profile }
assert {
  res.status: eq 401
  res.body.error: eq "Unauthorized"
}

// Test 422 Validation Error
meta { name: Create User Invalid Email }
post { url: {{baseUrl}}/api/users }
body:json { { "email": "not-an-email", "name": "" } }
assert {
  res.status: eq 422
  res.body.errors: isArray
}
```

## Best Practices
- Use declarative assertions for simple checks (status, equality)
- Use post-response scripts for complex validation (array contents, conditional logic)
- Extract IDs and tokens in post-response for request chaining
- Generate unique test data in pre-request scripts (timestamps, UUIDs)
- Test both success and error responses for every endpoint
- Validate response times alongside data correctness

## Common Mistakes
- Not asserting anything (running requests without validation)
- Hardcoding IDs instead of extracting from previous responses
- Not testing error paths (only happy path assertions)
- Missing response time assertions (functional but slow APIs pass)
