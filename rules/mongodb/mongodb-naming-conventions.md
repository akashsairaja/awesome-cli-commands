---
id: mongodb-naming-conventions
stackId: mongodb
type: rule
name: MongoDB Naming Conventions
description: >-
  Standardize MongoDB naming patterns — camelCase for fields, plural lowercase
  for collections, descriptive index names, and consistent database naming.
difficulty: beginner
globs:
  - '**/*.js'
  - '**/*.ts'
  - '**/*.json'
tags:
  - naming-conventions
  - camelCase
  - standards
  - collections
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
  - question: Why use camelCase for MongoDB field names?
    answer: >-
      MongoDB documents map directly to JavaScript/JSON objects, where camelCase
      is the standard convention. Using camelCase in the database eliminates the
      need for field name transformation between the database and application
      layers, reducing bugs and simplifying code.
  - question: Should MongoDB collection names be singular or plural?
    answer: >-
      Use plural names (users, orders, products). A collection holds multiple
      documents, so plural makes semantic sense. This is also the convention
      used by Mongoose, MongoDB's official documentation, and most ODMs. Be
      consistent across your entire database.
relatedItems:
  - mongodb-schema-validation
  - mongodb-schema-designer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MongoDB Naming Conventions

## Rule
All MongoDB identifiers MUST follow consistent naming conventions: camelCase for fields, lowercase plural for collections, and descriptive names for indexes.

## Format
```
Databases:     lowercase, hyphens ok     → my-app, user-service
Collections:   plural camelCase          → users, orderItems, productCategories
Fields:        singular camelCase        → firstName, createdAt, isActive
Indexes:       idx_{collection}_{fields} → idx_users_email, idx_orders_status_createdAt
```

## Requirements

### 1. Collection Names
```javascript
// GOOD: plural, camelCase
db.users
db.orderItems
db.productReviews
db.userSessions

// BAD: singular, inconsistent casing
db.User          // PascalCase
db.order_items   // snake_case
db.PRODUCTS      // UPPERCASE
db.product       // singular
```

### 2. Field Names
```javascript
// GOOD: camelCase, descriptive
{
  firstName: "Jane",
  lastName: "Smith",
  emailAddress: "jane@example.com",
  isVerified: true,
  orderCount: 42,
  lastLoginAt: ISODate("2025-03-01"),
  createdAt: ISODate("2025-01-01"),
  updatedAt: ISODate("2025-03-01")
}

// BAD: inconsistent casing, abbreviated
{
  first_name: "Jane",   // snake_case
  LastName: "Smith",     // PascalCase
  email: "jane@...",     // ambiguous (address? verified?)
  verified: true,        // missing "is" prefix for boolean
  cnt: 42                // abbreviated
}
```

### 3. Boolean Fields Use "is/has/can" Prefix
```javascript
{
  isActive: true,
  isVerified: false,
  hasSubscription: true,
  canEdit: false
}
```

### 4. Date Fields Use "At" Suffix
```javascript
{
  createdAt: ISODate("..."),
  updatedAt: ISODate("..."),
  deletedAt: ISODate("..."),
  lastLoginAt: ISODate("..."),
  expiresAt: ISODate("...")
}
```

## Anti-Patterns
- Mixing camelCase and snake_case in the same collection
- Using reserved words as field names (type, id, class)
- Single-character field names for "space savings" (a, b, c)
- Prefixing fields with collection name (user_email in users collection)

## Enforcement
Use a linter or code review checklist to verify naming conventions. Document conventions in a CONTRIBUTING.md file for the team.
