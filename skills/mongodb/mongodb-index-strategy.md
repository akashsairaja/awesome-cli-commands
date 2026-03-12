---
id: mongodb-index-strategy
stackId: mongodb
type: skill
name: MongoDB Compound Index Design
description: >-
  Design optimal MongoDB compound indexes using the ESR rule — Equality, Sort,
  Range field ordering for maximum query coverage and minimal index overhead.
difficulty: intermediate
tags:
  - indexing
  - compound-index
  - esr-rule
  - covered-queries
  - performance
  - mongodb
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - javascript
  - typescript
prerequisites:
  - MongoDB 6.0+
  - Basic find/sort operations
faq:
  - question: What is the ESR rule for MongoDB compound indexes?
    answer: >-
      ESR stands for Equality-Sort-Range. When creating a compound index, place
      fields used for exact matches first (status = 'active'), fields used for
      sorting second (sort by date), and fields used for range queries last
      ($gt, $lt, $regex). This ordering maximizes the index's usefulness.
  - question: How many indexes should a MongoDB collection have?
    answer: >-
      Aim for the minimum number that covers your most frequent queries. Each
      index adds ~10% overhead to writes and consumes RAM. Most collections need
      3-7 indexes. Use db.collection.aggregate([{$indexStats:{}}]) to identify
      unused indexes and remove them.
relatedItems:
  - mongodb-aggregation-pipeline
  - mongodb-performance-analyst
  - mongodb-schema-designer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MongoDB Compound Index Design

## Overview
A well-designed compound index can serve multiple query patterns with a single index. The ESR (Equality, Sort, Range) rule determines the optimal field order. Getting this wrong means MongoDB ignores your index entirely or uses it inefficiently.

## Why This Matters
- A COLLSCAN on 10M documents takes seconds; an index scan takes milliseconds
- One compound index can serve many query patterns (prefix rule)
- Wrong field order in compound indexes makes them useless for your queries

## The ESR Rule

### Step 1: Equality Fields First
```javascript
// Query: find active users in a specific city
// Equality fields: status, city
db.users.createIndex({ status: 1, city: 1, lastLogin: -1 });

// This index supports:
db.users.find({ status: "active", city: "NYC" });  // Uses full prefix
db.users.find({ status: "active" });                 // Uses first field
// Does NOT efficiently support:
db.users.find({ city: "NYC" });  // city is not the first field
```

### Step 2: Sort Fields Second
```javascript
// Query: find active users sorted by lastLogin
// Equality: status | Sort: lastLogin
db.users.createIndex({ status: 1, lastLogin: -1 });

// MongoDB can use the index for both filter AND sort (no in-memory sort needed)
db.users.find({ status: "active" }).sort({ lastLogin: -1 });
```

### Step 3: Range Fields Last
```javascript
// Query: find active users created after a date, sorted by name
// Equality: status | Sort: name | Range: createdAt
db.users.createIndex({ status: 1, name: 1, createdAt: 1 });

db.users.find({
  status: "active",
  createdAt: { $gte: ISODate("2025-01-01") }
}).sort({ name: 1 });
```

### Step 4: Verify with explain()
```javascript
db.users.find({ status: "active", city: "NYC" })
  .sort({ lastLogin: -1 })
  .explain("executionStats");

// Look for:
// stage: "IXSCAN" (good) vs "COLLSCAN" (bad)
// nReturned vs totalKeysExamined — should be close to 1:1
// totalDocsExamined — should equal nReturned for covered queries
```

### Step 5: Covered Queries — No Document Fetch
```javascript
// If the index includes ALL fields in query + projection:
db.users.createIndex({ status: 1, email: 1, name: 1 });

// This query is "covered" — answered entirely from the index:
db.users.find(
  { status: "active" },
  { email: 1, name: 1, _id: 0 }  // Must exclude _id unless it's in the index
);
```

## Best Practices
- Design indexes for your top 5-10 most frequent queries first
- Use the prefix rule: one compound index serves multiple query patterns
- Monitor index usage: db.collection.aggregate([{ $indexStats: {} }])
- Remove unused indexes — each index slows writes by 5-10%
- For sort operations, index sort direction must match query sort direction
- Use partial indexes when queries always filter on a constant condition

## Common Mistakes
- Creating single-field indexes when a compound index would serve all queries
- Putting range fields before sort fields (violates ESR rule)
- Forgetting to exclude _id in projection for covered queries
- Not checking explain() output after creating an index
- Index key pattern sort direction not matching query sort direction
