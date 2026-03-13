---
id: prisma-query-optimization
stackId: prisma
type: skill
name: Optimize Prisma Queries for Performance
description: >-
  Eliminate N+1 queries, implement efficient pagination, use select/include
  strategically, and optimize bulk operations with Prisma Client.
difficulty: advanced
tags:
  - prisma
  - optimize
  - queries
  - performance
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Optimize Prisma Queries for Performance skill?"
    answer: >-
      Eliminate N+1 queries, implement efficient pagination, use
      select/include strategically, and optimize bulk operations with Prisma
      Client. This skill provides a structured workflow for schema design,
      migration workflows, query optimization, and database seeding.
  - question: "What tools and setup does Optimize Prisma Queries for Performance require?"
    answer: >-
      Works with standard Prisma tooling (Prisma CLI, Prisma Studio). No
      special setup required beyond a working Node.js ORM environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Optimize Prisma Queries for Performance

## Overview
Prisma generates SQL from your TypeScript queries. Understanding how Prisma translates to SQL helps you write efficient queries. The key patterns: use select to minimize data transfer, include for eager loading, cursor pagination for large datasets, and batch operations for bulk writes.

## Why This Matters
- **N+1 elimination** — one query instead of hundreds
- **Data minimization** — fetch only the fields you need
- **Scalable pagination** — constant-time page loads
- **Bulk efficiency** — single query for batch operations

## How It Works

### Step 1: Fix N+1 Queries
```typescript
// BAD: N+1 — one query per user for their posts
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
}

// GOOD: Eager loading — 2 queries total
const users = await prisma.user.findMany({
  include: {
    posts: {
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});
```

### Step 2: Use Select for Minimal Data
```typescript
// BAD: Fetches all columns including large content fields
const posts = await prisma.post.findMany();

// GOOD: Fetch only needed columns
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    createdAt: true,
    author: {
      select: { name: true, avatar: true },
    },
  },
});
```

### Step 3: Cursor-Based Pagination
```typescript
// BAD: Offset pagination (slow for large datasets)
const posts = await prisma.post.findMany({
  skip: 1000,  // DB must scan 1000 rows to skip them
  take: 20,
});

// GOOD: Cursor pagination (constant time)
const posts = await prisma.post.findMany({
  take: 20,
  cursor: { id: lastPostId },
  skip: 1, // Skip the cursor itself
  orderBy: { createdAt: 'desc' },
});
```

### Step 4: Batch Operations
```typescript
// BAD: Individual creates in a loop
for (const tag of tags) {
  await prisma.tag.create({ data: tag });
}

// GOOD: Single batch insert
await prisma.tag.createMany({
  data: tags,
  skipDuplicates: true,
});

// GOOD: Transaction for related operations
await prisma.$transaction([
  prisma.post.update({ where: { id: postId }, data: { published: true } }),
  prisma.notification.create({ data: { userId: authorId, type: 'PUBLISHED' } }),
]);
```

### Step 5: Query Logging
```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) {
    console.warn(`Slow query (${e.duration}ms):`, e.query);
  }
});
```

## Best Practices
- Enable query logging in development to catch N+1 patterns
- Use `select` for list views, `include` for detail views
- Prefer cursor pagination for any collection over 1K rows
- Use `createMany` / `updateMany` for bulk operations
- Wrap related writes in `$transaction` for atomicity
- Add @@index in schema for columns used in where/orderBy clauses

## Common Mistakes
- Using include without nested select (fetches entire relation)
- Offset pagination on large tables (O(n) performance)
- Individual operations in loops instead of batch operations
- Not monitoring query performance in production
- Missing indexes on commonly filtered columns
