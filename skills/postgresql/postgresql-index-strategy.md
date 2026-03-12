---
id: postgresql-index-strategy
stackId: postgresql
type: skill
name: PostgreSQL Index Strategy & Design
description: >-
  Master PostgreSQL indexing — B-tree, GIN, GiST, BRIN index types, partial
  indexes, covering indexes, and composite index column ordering for optimal
  query performance.
difficulty: intermediate
tags:
  - indexing
  - b-tree
  - gin
  - gist
  - brin
  - partial-index
  - performance
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - sql
prerequisites:
  - PostgreSQL 14+
  - Basic SQL knowledge
  - Understanding of EXPLAIN output
faq:
  - question: What are the different index types in PostgreSQL?
    answer: >-
      PostgreSQL supports B-tree (default, for equality/range), GIN (full-text
      search, JSONB, arrays), GiST (geometric data, range types,
      nearest-neighbor), BRIN (large naturally-ordered tables like time-series),
      and Hash (equality only, rarely used). B-tree and GIN cover 95% of use
      cases.
  - question: How do I choose the right column order for a composite index?
    answer: >-
      Put equality columns first (WHERE status = 'active'), then range columns
      (AND created_at > '2025-01-01'). The index can only use columns
      left-to-right up to the first range condition. A query using only the
      second column of a composite index cannot use the index at all.
  - question: What is a partial index and when should I use one?
    answer: >-
      A partial index includes only rows matching a WHERE condition. Use them
      when queries consistently filter on a constant value — e.g., WHERE status
      = 'active' on a table where 90% of rows are inactive. The index is
      dramatically smaller and faster to scan.
relatedItems:
  - postgresql-query-optimizer
  - postgresql-explain-analyze
  - postgresql-migration-safety
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PostgreSQL Index Strategy & Design

## Overview
Indexes are the single most impactful performance tool in PostgreSQL. Choosing the right index type, column order, and filtering conditions can turn a 5-second query into a 5-millisecond query. This skill covers every index type and when to use each one.

## Why This Matters
- A missing index on a 10M row table can make queries 1000x slower
- Wrong index type (B-tree vs GIN) can make an index useless
- Over-indexing wastes disk space and slows writes by 10-30%

## Index Types

### Step 1: B-tree (Default) — Equality & Range Queries
```sql
-- Most common index type — works for =, <, >, <=, >=, BETWEEN, IN, IS NULL
CREATE INDEX idx_users_email ON users (email);

-- Composite index — column order matters!
-- Supports: WHERE status = 'active' AND created_at > '2025-01-01'
-- Also supports: WHERE status = 'active' (leftmost prefix)
-- Does NOT support: WHERE created_at > '2025-01-01' alone (not leftmost)
CREATE INDEX idx_users_status_created ON users (status, created_at);
```

### Step 2: GIN — Full-Text, JSONB, Arrays
```sql
-- Full-text search
CREATE INDEX idx_posts_search ON posts USING GIN (to_tsvector('english', title || ' ' || body));

-- JSONB containment queries (@>, ?, ?|, ?&)
CREATE INDEX idx_products_attrs ON products USING GIN (attributes jsonb_path_ops);

-- Array overlap and containment
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);
-- Supports: WHERE tags @> ARRAY['postgresql'] or WHERE tags && ARRAY['sql','db']
```

### Step 3: Partial Indexes — Index Only What You Query
```sql
-- Only index active users (80% smaller than full index)
CREATE INDEX idx_users_active_email ON users (email)
  WHERE status = 'active';

-- Only index unprocessed orders
CREATE INDEX idx_orders_pending ON orders (created_at)
  WHERE processed_at IS NULL;
```

### Step 4: Covering Indexes — Index-Only Scans
```sql
-- INCLUDE columns returned by query but not searched on
CREATE INDEX idx_users_email_cover ON users (email)
  INCLUDE (name, avatar_url);

-- Query can be satisfied entirely from the index (no table lookup):
-- SELECT name, avatar_url FROM users WHERE email = 'user@example.com';
```

### Step 5: BRIN — Huge Tables with Natural Ordering
```sql
-- For tables where physical row order correlates with column value
-- (e.g., time-series data with auto-incrementing timestamps)
CREATE INDEX idx_events_created ON events USING BRIN (created_at);
-- 1000x smaller than B-tree, slightly slower lookups
```

## Best Practices
- Run EXPLAIN ANALYZE before and after adding an index to verify improvement
- Check for unused indexes: `SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;`
- Always index foreign key columns (needed for JOIN and CASCADE performance)
- Put high-selectivity columns first in composite indexes
- Use partial indexes when queries always filter on a constant condition
- Run ANALYZE after creating indexes on tables with existing data

## Common Mistakes
- Creating single-column indexes for every column (over-indexing)
- Wrong column order in composite indexes (must match query pattern)
- Using B-tree for JSONB queries (need GIN)
- Forgetting CONCURRENTLY for production index creation
- Not monitoring index bloat (REINDEX CONCURRENTLY periodically)
