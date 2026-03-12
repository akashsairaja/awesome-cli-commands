---
id: prisma-query-standards
stackId: prisma
type: rule
name: Prisma Query Standards
description: >-
  Enforce efficient Prisma query patterns — mandatory select/include usage,
  error handling, transaction requirements, and N+1 prevention standards.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.tsx'
tags:
  - prisma
  - queries
  - error-handling
  - transactions
  - standards
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
  - question: Why should I always use select in Prisma list queries?
    answer: >-
      Without select, Prisma fetches all columns for every row. For list views
      showing title, author, and date, there is no need to fetch the full
      content field. Using select reduces data transfer, memory usage, and query
      time — especially for models with large text or JSON columns.
  - question: How do I handle Prisma errors properly?
    answer: >-
      Catch PrismaClientKnownRequestError and check the error code: P2025
      (record not found), P2002 (unique constraint violation), P2003 (foreign
      key constraint). Map these to appropriate HTTP status codes (404, 409,
      400) instead of returning generic 500 errors.
relatedItems:
  - prisma-schema-conventions
  - prisma-query-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Prisma Query Standards

## Rule
All Prisma queries MUST use explicit select or include, handle errors, and avoid N+1 patterns. Bulk operations MUST use batch methods.

## Format
```typescript
const result = await prisma.model.findMany({
  where: { /* filter */ },
  select: { /* specific fields */ },
  orderBy: { createdAt: 'desc' },
  take: 20,
});
```

## Requirements

### Use select for Lists
```typescript
// GOOD: Only fetch needed fields
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    author: { select: { name: true } },
  },
  take: 20,
});

// BAD: Fetching all fields
const posts = await prisma.post.findMany();
```

### Handle Errors
```typescript
// GOOD: Explicit error handling
try {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  return user;
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') throw new NotFoundError('User not found');
  }
  throw error;
}
```

### Use Transactions for Related Writes
```typescript
// GOOD: Atomic operation
const [post, notification] = await prisma.$transaction([
  prisma.post.create({ data: postData }),
  prisma.notification.create({ data: notificationData }),
]);

// BAD: Non-atomic (notification may fail after post is created)
const post = await prisma.post.create({ data: postData });
const notification = await prisma.notification.create({ data: notificationData });
```

### Batch Operations
```typescript
// GOOD: Single query for bulk insert
await prisma.tag.createMany({ data: tags, skipDuplicates: true });

// BAD: Loop with individual creates
for (const tag of tags) {
  await prisma.tag.create({ data: tag });
}
```

## Anti-Patterns
- Fetching all fields when only a few are needed
- Individual queries in loops (N+1)
- Not handling Prisma-specific errors
- Related writes without transactions
- Offset pagination on large tables

## Enforcement
Enable Prisma query logging in development.
Flag queries without select/include in code review.
Monitor slow queries in production with $on('query').
