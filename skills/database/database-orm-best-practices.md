---
id: database-orm-best-practices
stackId: database
type: skill
name: ORM Best Practices & N+1 Query Prevention
description: >-
  Use ORMs effectively — prevent N+1 queries, understand eager vs lazy loading,
  optimize generated SQL, handle transactions correctly, and know when to bypass
  the ORM for raw SQL.
difficulty: intermediate
tags:
  - orm
  - n-plus-one
  - eager-loading
  - prisma
  - typeorm
  - query-optimization
  - database
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - typescript
  - python
  - java
prerequisites:
  - Familiarity with one ORM
  - Basic SQL
faq:
  - question: What is the N+1 query problem?
    answer: >-
      N+1 occurs when you load N parent records (1 query) and then load related
      records for each parent individually (N queries). For 100 users with
      posts, this means 101 database queries instead of 2. It causes exponential
      slowdown as data grows. Fix it with eager loading (include/join) to load
      relations in a single query.
  - question: When should I use raw SQL instead of an ORM?
    answer: >-
      Use raw SQL for: complex aggregations with GROUP BY and HAVING, window
      functions (ROW_NUMBER, LAG/LEAD), recursive CTEs, bulk operations
      (INSERT...SELECT, COPY), and any query where the ORM generates inefficient
      SQL. Use the ORM for simple CRUD, transactions, and type-safe queries.
relatedItems:
  - database-migration-patterns
  - database-design-architect
  - postgresql-query-optimizer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# ORM Best Practices & N+1 Query Prevention

## Overview
ORMs (Prisma, TypeORM, SQLAlchemy, Hibernate) map database tables to code objects. They boost productivity but can generate terrible SQL if used carelessly. The #1 problem is N+1 queries — loading 100 users, then running 100 separate queries for their posts.

## Why This Matters
- N+1 queries can turn a 10ms page load into a 5-second page load
- ORMs hide the SQL — you must understand what queries they generate
- Wrong ORM patterns can be 100x slower than raw SQL

## N+1 Query Prevention

### Step 1: Identify the N+1 Problem
```typescript
// BAD: N+1 queries — 1 query for users + N queries for posts
const users = await prisma.user.findMany();
for (const user of users) {
  // This runs a separate query for EACH user
  const posts = await prisma.post.findMany({ where: { authorId: user.id } });
  console.log(user.name, posts.length);
}
// Total queries: 1 + N (if 100 users → 101 queries)
```

### Step 2: Fix with Eager Loading (include/join)
```typescript
// GOOD: Prisma — 2 queries total (users + posts)
const users = await prisma.user.findMany({
  include: { posts: true },
});
users.forEach(user => console.log(user.name, user.posts.length));

// GOOD: TypeORM — single query with JOIN
const users = await userRepo.find({
  relations: ["posts"],
});

// GOOD: SQLAlchemy — eager loading
users = session.query(User).options(joinedload(User.posts)).all()
```

### Step 3: Select Only What You Need
```typescript
// BAD: Loads all 50 columns
const users = await prisma.user.findMany();

// GOOD: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// GOOD: With relations — select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    posts: {
      select: { id: true, title: true },
      where: { published: true },
      take: 5,
    },
  },
});
```

### Step 4: Use Raw SQL When ORM Is Inefficient
```typescript
// Complex aggregation — ORM generates suboptimal SQL
// Use raw query instead
const topAuthors = await prisma.$queryRaw`
  SELECT u.name, COUNT(p.id) as post_count, AVG(p.view_count) as avg_views
  FROM users u
  JOIN posts p ON p.author_id = u.id
  WHERE p.published = true
  GROUP BY u.id, u.name
  HAVING COUNT(p.id) > 10
  ORDER BY avg_views DESC
  LIMIT 20
`;
```

### Step 5: Handle Transactions Properly
```typescript
// Prisma transaction — all or nothing
const [order, payment] = await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.payment.create({ data: paymentData }),
]);

// Interactive transaction for complex logic
await prisma.$transaction(async (tx) => {
  const account = await tx.account.findUnique({ where: { id: fromId } });
  if (account.balance < amount) throw new Error("Insufficient funds");
  await tx.account.update({ where: { id: fromId }, data: { balance: { decrement: amount } } });
  await tx.account.update({ where: { id: toId }, data: { balance: { increment: amount } } });
});
```

## Best Practices
- Enable query logging in development to see generated SQL
- Use eager loading (include/join) for known relationships
- Select only columns you need — never load entire rows unnecessarily
- Use raw SQL for complex aggregations, CTEs, and window functions
- Batch inserts/updates instead of individual operations
- Use database-level constraints, not just ORM validation

## Common Mistakes
- Not monitoring generated SQL (hidden N+1 queries)
- Eager loading everything (loading the entire database graph)
- Using ORM for bulk operations (use raw INSERT ... SELECT or COPY)
- Ignoring connection pool settings (too few or too many connections)
- Treating the ORM as the only way to query (raw SQL is not shameful)
