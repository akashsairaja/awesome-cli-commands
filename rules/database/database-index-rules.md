---
id: database-index-rules
stackId: database
type: rule
name: Database Indexing Rules
description: >-
  Enforce indexing standards across any SQL database — required foreign key
  indexes, query-driven index design, composite index ordering, and monitoring
  for unused indexes.
difficulty: intermediate
globs:
  - '**/*.sql'
  - '**/migrations/**'
tags:
  - indexing
  - foreign-keys
  - performance
  - explain
  - standards
  - database
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
  - sql
faq:
  - question: Why must foreign key columns have indexes?
    answer: >-
      Without an index, JOINs on foreign key columns require a full table scan
      (O(N) per join). CASCADE deletes also scan the entire table to find
      dependent rows. On a table with 10M rows, this means every JOIN or parent
      deletion scans all 10M rows. An index makes these operations O(log N).
  - question: How many indexes should a database table have?
    answer: >-
      OLTP tables should have 3-7 indexes. Each index adds ~10% write overhead
      and consumes disk space. Design composite indexes that serve multiple
      query patterns rather than single-column indexes for each column. Monitor
      unused indexes and remove them. One well-designed composite index is
      better than three single-column indexes.
relatedItems:
  - database-schema-standards
  - postgresql-index-strategy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Database Indexing Rules

## Rule
Foreign key columns MUST be indexed. Indexes MUST be designed based on query patterns, not guesses. Unused indexes MUST be removed.

## Format
Every foreign key gets an index. Every slow query gets an EXPLAIN analysis before adding an index.

## Requirements

### 1. Always Index Foreign Key Columns
```sql
-- Foreign keys without indexes cause:
-- 1. Slow JOINs (full table scan to find matching rows)
-- 2. Slow CASCADE deletes (full scan to find dependent rows)

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  product_id BIGINT NOT NULL REFERENCES products(id)
);

-- REQUIRED: indexes on FK columns
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_product_id ON orders (product_id);
```

### 2. Design Indexes from Query Patterns
```sql
-- Query: SELECT * FROM orders WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC
-- Index should match: equality first, then sort
CREATE INDEX idx_orders_user_status_created ON orders (user_id, status, created_at DESC);

-- DON'T create random indexes "just in case"
-- Each index slows writes by 5-10% and uses disk space
```

### 3. Run EXPLAIN Before and After
```sql
-- BEFORE: Verify the problem
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'active';
-- Look for: Seq Scan, high cost, slow actual time

-- Create index
CREATE INDEX idx_orders_user_status ON orders (user_id, status);

-- AFTER: Verify the improvement
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123 AND status = 'active';
-- Should show: Index Scan, low cost, fast actual time
```

### 4. Monitor and Remove Unused Indexes
```sql
-- PostgreSQL: Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexname NOT LIKE '%pkey%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Remove confirmed unused indexes
DROP INDEX CONCURRENTLY idx_orders_old_unused;
```

### 5. Never Over-Index
```bash
# Rule of thumb:
# - OLTP tables: 3-7 indexes maximum
# - Each index adds ~10% write overhead
# - One well-designed composite index > three single-column indexes
```

## Anti-Patterns
- Creating single-column indexes on every column
- Not indexing foreign key columns
- Adding indexes without checking EXPLAIN first
- Keeping unused indexes "just in case"
- Duplicate indexes (idx_a_b supersedes idx_a)

## Enforcement
Run unused index queries monthly. Require EXPLAIN output in PR description for any new index. Use pg_stat_statements to identify queries that need indexes.
