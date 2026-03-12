---
id: mongodb-schema-validation
stackId: mongodb
type: rule
name: MongoDB Schema Validation Rules
description: >-
  Enforce document structure with MongoDB JSON Schema validation — required
  fields, type checking, enum constraints, and nested document validation for
  data integrity.
difficulty: intermediate
globs:
  - '**/*.js'
  - '**/*.ts'
  - '**/migrations/**'
tags:
  - schema-validation
  - json-schema
  - data-integrity
  - validation
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
  - question: How does MongoDB schema validation work?
    answer: >-
      MongoDB schema validation uses JSON Schema to define document structure at
      the collection level. When a document is inserted or updated, MongoDB
      validates it against the schema. With validationLevel 'strict' and
      validationAction 'error', invalid documents are rejected. This enforces
      data types, required fields, enums, and patterns.
  - question: Should I use strict or moderate validation level in MongoDB?
    answer: >-
      Use 'strict' for new collections — every insert and update is validated.
      Use 'moderate' during migrations — existing documents that don't match the
      new schema can still be updated, but new inserts must conform. After
      backfilling existing documents, switch to 'strict'.
relatedItems:
  - mongodb-schema-designer
  - mongodb-naming-conventions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MongoDB Schema Validation Rules

## Rule
Every production collection MUST have JSON Schema validation to enforce document structure, required fields, and data types.

## Format
```javascript
db.createCollection("collectionName", {
  validator: { $jsonSchema: { /* schema */ } },
  validationLevel: "strict",
  validationAction: "error"
});
```

## Requirements

### 1. Define Schema for Every Collection
```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "name", "role", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
          description: "Must be a valid email address"
        },
        name: {
          bsonType: "string",
          minLength: 2,
          maxLength: 100
        },
        role: {
          bsonType: "string",
          enum: ["admin", "user", "moderator"]
        },
        profile: {
          bsonType: "object",
          properties: {
            bio: { bsonType: "string", maxLength: 500 },
            avatarUrl: { bsonType: "string" }
          }
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      },
      additionalProperties: false
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});
```

### 2. Add schemaVersion to Documents
```javascript
// Include version for schema evolution
{
  _id: ObjectId("..."),
  schemaVersion: 2,
  email: "user@example.com",
  name: "Jane Smith",
  role: "user",
  createdAt: ISODate("2025-01-01")
}
```

### 3. Validate Nested Documents
```javascript
properties: {
  address: {
    bsonType: "object",
    required: ["street", "city", "country"],
    properties: {
      street: { bsonType: "string" },
      city: { bsonType: "string" },
      state: { bsonType: "string" },
      country: { bsonType: "string" },
      postalCode: { bsonType: "string" }
    }
  }
}
```

## Examples

### Good
```javascript
// Strict validation catches bad data at write time
db.users.insertOne({ email: "invalid", name: "J", role: "superadmin" });
// Error: Document failed validation
```

### Bad
```javascript
// No validation — any shape of document is accepted
db.users.insertOne({ foo: "bar", random: 42 });
// Succeeds — data integrity is lost
```

## Enforcement
Add schema validation as part of collection creation scripts in your migration pipeline. Use validationLevel "strict" for new collections and "moderate" during migration periods.
