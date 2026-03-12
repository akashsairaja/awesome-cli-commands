---
id: bruno-collection-design
stackId: bruno
type: skill
name: Collection Organization and Structure
description: >-
  Design Bruno API collections with logical folder structure, naming
  conventions, and request ordering for maintainable, team-friendly API test
  suites.
difficulty: beginner
tags:
  - collection-design
  - organization
  - bru-format
  - structure
  - bruno
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Bruno installed
  - API to test
faq:
  - question: How should I organize a Bruno collection?
    answer: >-
      Group requests by API domain (Auth, Users, Products, Orders), not by HTTP
      method. Name requests descriptively ('Create Product' not 'POST 1'). Order
      requests logically within each folder. Include both success and error test
      cases.
  - question: What is the Bru file format?
    answer: >-
      Bru is Bruno's plain-text file format for storing API requests. Each .bru
      file contains the request method, URL, headers, body, assertions, and
      scripts in a readable, git-friendly format. Unlike JSON (Postman), Bru
      files produce clean diffs in version control.
  - question: Can Bruno collections be version controlled?
    answer: >-
      Yes — this is Bruno's key advantage. Collections are stored as plain files
      on your filesystem. Add the collection directory to your Git repository
      and it evolves alongside your API code. PRs can include both API changes
      and test updates.
relatedItems:
  - bruno-scripting-assertions
  - bruno-ci-runner
  - bruno-api-testing-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Collection Organization and Structure

## Overview
A well-organized Bruno collection mirrors your API structure — grouped by domain, named clearly, and ordered for logical test flow. Good organization makes collections navigable, maintainable, and suitable for CI execution.

## How It Works

### Folder Structure
```
api-tests/
├── bruno.json              # Collection config
├── environments/
│   ├── dev.bru
│   ├── staging.bru
│   └── production.bru
├── Auth/
│   ├── Login.bru
│   ├── Register.bru
│   ├── Refresh Token.bru
│   └── Logout.bru
├── Users/
│   ├── Get Profile.bru
│   ├── Update Profile.bru
│   ├── List Users.bru
│   └── Delete User.bru
├── Products/
│   ├── List Products.bru
│   ├── Get Product.bru
│   ├── Create Product.bru
│   ├── Update Product.bru
│   └── Delete Product.bru
└── Orders/
    ├── Create Order.bru
    ├── Get Order.bru
    └── List Orders.bru
```

### Request File Anatomy (Bru Format)
```
meta {
  name: Create Product
  type: http
  seq: 3
}

post {
  url: {{baseUrl}}/api/products
  body: json
  auth: bearer
}

auth:bearer {
  token: {{authToken}}
}

headers {
  Content-Type: application/json
}

body:json {
  {
    "name": "Test Product",
    "price": 29.99,
    "category": "electronics"
  }
}

assert {
  res.status: eq 201
  res.body.id: isDefined
  res.body.name: eq "Test Product"
}

script:post-response {
  bru.setVar("productId", res.body.id);
}
```

### Environment File
```
vars {
  baseUrl: http://localhost:3000
  authToken:
  testUserEmail: test@example.com
  testUserPassword: password123
}
```

## Best Practices
- Group by API domain (Auth, Users, Products) not by HTTP method
- Use clear request names: "Create Product" not "POST /products"
- Order requests logically: Create → Read → Update → Delete
- Use `seq` in meta to control execution order in CI runner
- Include both success and error test cases per endpoint
- Keep one request per file for clear version control diffs

## Common Mistakes
- Flat collection with all requests at root level (unnavigable at scale)
- Naming by method: "POST Request 1" instead of descriptive names
- Not including error case tests (only testing happy paths)
- Not using environments (hardcoded URLs and tokens)
