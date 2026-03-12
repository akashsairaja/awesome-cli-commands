---
id: mongodb-query-safety
stackId: mongodb
type: rule
name: MongoDB Query Safety Standards
description: >-
  Prevent dangerous MongoDB operations — always use specific projections, set
  maxTimeMS on queries, avoid unbounded find operations, and sanitize user input
  to prevent NoSQL injection.
difficulty: beginner
globs:
  - '**/*.js'
  - '**/*.ts'
tags:
  - query-safety
  - nosql-injection
  - projections
  - security
  - mongodb
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
languages:
  - javascript
  - typescript
faq:
  - question: What is NoSQL injection and how do I prevent it in MongoDB?
    answer: >-
      NoSQL injection occurs when user input is passed directly as a query
      operator. For example, passing {$gt: ''} as a password field bypasses
      authentication. Prevent it by: (1) casting all user input to expected
      types with String(), Number(), etc., (2) using a validation library like
      Zod or Joi, and (3) never passing raw request body fields into query
      operators.
  - question: Why should I always use projections in MongoDB queries?
    answer: >-
      Projections reduce network transfer (only send needed fields), enable
      covered queries (answered from index alone), prevent accidentally exposing
      sensitive fields (passwords, tokens), and reduce application memory usage.
      Always specify exactly which fields you need.
relatedItems:
  - mongodb-naming-conventions
  - mongodb-schema-validation
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MongoDB Query Safety Standards

## Rule
All queries MUST include projections, timeouts, and input sanitization. Never run unbounded queries or trust user input in query operators.

## Format
Every find() must specify a projection. Every query must set maxTimeMS. User input must be sanitized.

## Requirements

### 1. Always Use Projections
```javascript
// BAD: Returns entire document including sensitive fields
const user = await db.users.findOne({ _id: userId });

// GOOD: Return only needed fields
const user = await db.users.findOne(
  { _id: userId },
  { projection: { name: 1, email: 1, role: 1 } }
);
```

### 2. Set maxTimeMS on Every Query
```javascript
// BAD: Query can run indefinitely
const results = await db.orders.find({ status: "pending" }).toArray();

// GOOD: Query fails after 5 seconds
const results = await db.orders
  .find({ status: "pending" })
  .maxTimeMS(5000)
  .toArray();
```

### 3. Prevent NoSQL Injection
```javascript
// DANGEROUS: User can pass { $gt: "" } to bypass auth
app.post("/login", async (req, res) => {
  const user = await db.users.findOne({
    email: req.body.email,       // Could be an object!
    password: req.body.password  // Could be { $gt: "" }
  });
});

// SAFE: Validate and cast input types
app.post("/login", async (req, res) => {
  const email = String(req.body.email);     // Force string
  const password = String(req.body.password);
  const user = await db.users.findOne({ email, password });
});

// SAFEST: Use a validation library
import { z } from "zod";
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

### 4. Use Limits on Collection Scans
```javascript
// BAD: Could return millions of documents
const allOrders = await db.orders.find({}).toArray();

// GOOD: Always limit results
const recentOrders = await db.orders
  .find({})
  .sort({ createdAt: -1 })
  .limit(100)
  .maxTimeMS(5000)
  .toArray();
```

### 5. Use Bulk Operations for Multiple Writes
```javascript
// BAD: N individual write operations
for (const item of items) {
  await db.products.updateOne({ _id: item.id }, { $set: { price: item.price } });
}

// GOOD: Single bulk operation
const bulk = items.map(item => ({
  updateOne: {
    filter: { _id: item.id },
    update: { $set: { price: item.price } }
  }
}));
await db.products.bulkWrite(bulk);
```

## Enforcement
Use eslint-plugin-mongodb or custom lint rules to flag queries without projections and maxTimeMS. Add input validation middleware to all API routes.
