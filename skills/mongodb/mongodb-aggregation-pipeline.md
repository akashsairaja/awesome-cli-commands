---
id: mongodb-aggregation-pipeline
stackId: mongodb
type: skill
name: MongoDB Aggregation Pipeline Mastery
description: >-
  Build powerful MongoDB aggregation pipelines — $match, $group, $lookup,
  $unwind, $facet stages with stage ordering optimization and index-aware
  pipeline design.
difficulty: intermediate
tags:
  - aggregation
  - pipeline
  - match
  - group
  - lookup
  - facet
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
  - Basic CRUD operations
  - Understanding of document structure
faq:
  - question: What is a MongoDB aggregation pipeline?
    answer: >-
      An aggregation pipeline processes documents through a sequence of stages —
      $match (filter), $group (aggregate), $sort (order), $lookup (join),
      $project (reshape). Each stage transforms the document stream. It is
      MongoDB's equivalent of SQL GROUP BY, JOIN, and subqueries combined.
  - question: How do I optimize MongoDB aggregation pipeline performance?
    answer: >-
      Three rules: (1) Put $match first to reduce documents entering the
      pipeline. (2) Add $project early to drop unneeded fields. (3) Create
      indexes that support your $match and $sort stages. Also use allowDiskUse
      for large datasets and set maxTimeMS to prevent runaway queries.
  - question: How does $lookup work in MongoDB and is it like a SQL JOIN?
    answer: >-
      Yes, $lookup performs a left outer join between collections. It matches a
      field in the input documents (localField) with a field in the joined
      collection (foreignField) and adds the matching documents as an array.
      Unlike SQL JOINs, it always returns an array — use $unwind to flatten it.
relatedItems:
  - mongodb-schema-designer
  - mongodb-index-strategy
  - mongodb-performance-analyst
version: 1.0.0
lastUpdated: '2026-03-11'
---

# MongoDB Aggregation Pipeline Mastery

## Overview
The aggregation pipeline is MongoDB's data processing framework. It transforms documents through a sequence of stages — filtering, grouping, joining, reshaping — like a Unix pipeline for your data. Mastering stage ordering is the key to performance.

## Why This Matters
- Aggregation pipelines replace complex application-side data processing
- Proper stage ordering can make pipelines 100x faster
- $lookup enables relational-style joins without a relational database
- $facet enables multiple aggregation results in a single query

## Core Pipeline Stages

### Step 1: $match — Filter Early
```javascript
// ALWAYS put $match first to reduce documents flowing through the pipeline
db.orders.aggregate([
  { $match: {
    status: "completed",
    createdAt: { $gte: ISODate("2025-01-01") }
  }},
  // ... further stages process fewer documents
]);
```

### Step 2: $group — Aggregate Data
```javascript
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $group: {
    _id: "$customerId",
    totalSpent: { $sum: "$amount" },
    orderCount: { $sum: 1 },
    avgOrder: { $avg: "$amount" },
    lastOrder: { $max: "$createdAt" },
    items: { $push: "$items" }
  }},
  { $sort: { totalSpent: -1 } },
  { $limit: 10 }
]);
```

### Step 3: $lookup — Join Collections
```javascript
// Join orders with customer details
db.orders.aggregate([
  { $match: { status: "completed" } },
  { $lookup: {
    from: "customers",
    localField: "customerId",
    foreignField: "_id",
    as: "customer"
  }},
  { $unwind: "$customer" },  // Convert array to single object
  { $project: {
    orderNumber: 1,
    amount: 1,
    "customer.name": 1,
    "customer.email": 1
  }}
]);
```

### Step 4: $facet — Multiple Aggregations in One Query
```javascript
// Get results and metadata in a single query
db.products.aggregate([
  { $match: { category: "electronics" } },
  { $facet: {
    results: [
      { $sort: { price: -1 } },
      { $skip: 20 },
      { $limit: 10 }
    ],
    totalCount: [
      { $count: "count" }
    ],
    priceRange: [
      { $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        avgPrice: { $avg: "$price" }
      }}
    ]
  }}
]);
```

### Step 5: $bucket — Histogram/Distribution Analysis
```javascript
db.orders.aggregate([
  { $bucket: {
    groupBy: "$amount",
    boundaries: [0, 50, 100, 250, 500, 1000, Infinity],
    default: "Other",
    output: {
      count: { $sum: 1 },
      avgAmount: { $avg: "$amount" }
    }
  }}
]);
```

## Best Practices
- Put $match and $project as early as possible to reduce document count
- Create indexes that support your $match and $sort stages
- Use $project to drop unneeded fields before $group (less memory)
- Set maxTimeMS on aggregation queries to prevent runaway pipelines
- Use allowDiskUse: true for large sorts that exceed 100MB memory limit
- Prefer $lookup with pipeline subquery over simple $lookup for filtered joins

## Common Mistakes
- Starting pipeline with $group instead of $match (processes all documents)
- Using $unwind on large arrays without $match first (document explosion)
- Not projecting out unnecessary fields before expensive stages
- Using JavaScript expressions ($where) instead of native operators
- Forgetting that $sort + $limit at the end of pipeline can use top-k optimization
