---
id: postgresql-migration-safety
stackId: postgresql
type: skill
name: Zero-Downtime PostgreSQL Migrations
description: >-
  Execute safe schema migrations on production PostgreSQL databases — adding
  columns, creating indexes concurrently, renaming tables, and avoiding locks
  that block reads and writes.
difficulty: intermediate
tags:
  - postgresql
  - zero-downtime
  - migrations
  - migration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Zero-Downtime PostgreSQL Migrations skill?"
    answer: >-
      Execute safe schema migrations on production PostgreSQL databases —
      adding columns, creating indexes concurrently, renaming tables, and
      avoiding locks that block reads and writes. This skill provides a
      structured workflow for query optimization, index strategy, connection
      pooling, and migration safety.
  - question: "What tools and setup does Zero-Downtime PostgreSQL Migrations require?"
    answer: >-
      Works with standard PostgreSQL tooling (psql, pg_dump). No special setup
      required beyond a working PostgreSQL database environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Zero-Downtime PostgreSQL Migrations

## Overview
Schema migrations on production databases can cause outages if done incorrectly. A simple ALTER TABLE can lock a table for minutes on large datasets. This skill covers safe migration patterns that avoid downtime.

## Why This Matters
- ALTER TABLE ... ADD COLUMN with DEFAULT acquires ACCESS EXCLUSIVE lock on PG < 11
- CREATE INDEX locks writes for the entire duration (can be hours on large tables)
- Renaming a column breaks running application instances immediately

## Safe Migration Patterns

### Step 1: Add Columns Safely
```sql
-- SAFE (PG 11+): Adding a column with a non-volatile DEFAULT is instant
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- SAFE: Adding a nullable column is always instant
ALTER TABLE users ADD COLUMN middle_name TEXT;

-- DANGEROUS: Adding NOT NULL without DEFAULT on PG < 11
-- ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'; -- rewrites table!

-- Safe alternative for adding NOT NULL:
ALTER TABLE users ADD COLUMN role TEXT;
-- Backfill in batches:
UPDATE users SET role = 'user' WHERE role IS NULL AND id BETWEEN 1 AND 100000;
UPDATE users SET role = 'user' WHERE role IS NULL AND id BETWEEN 100001 AND 200000;
-- Then add the constraint:
ALTER TABLE users ALTER COLUMN role SET NOT NULL;
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';
```

### Step 2: Create Indexes Without Blocking
```sql
-- ALWAYS use CONCURRENTLY for production indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);

-- If it fails partway (INVALID state), drop and retry:
DROP INDEX CONCURRENTLY idx_users_email;
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);

-- Check for invalid indexes:
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public'
AND indexname IN (SELECT indexrelid::regclass::text FROM pg_index WHERE NOT indisvalid);
```

### Step 3: Rename Tables/Columns Without Downtime
```sql
-- Never rename directly in production — use a multi-step approach:

-- 1. Create new column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- 2. Backfill data
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- 3. Add trigger to keep columns in sync during deploy
CREATE FUNCTION sync_name_columns() RETURNS trigger AS $$
BEGIN
  IF NEW.name IS DISTINCT FROM OLD.name THEN
    NEW.full_name := NEW.name;
  END IF;
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    NEW.name := NEW.full_name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Deploy application code using new column
-- 5. Drop old column and trigger after all instances updated
```

### Step 4: Add Constraints Without Locking
```sql
-- Add foreign key WITHOUT validation (instant, no lock):
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  NOT VALID;

-- Validate in background (takes ShareUpdateExclusiveLock, doesn't block reads/writes):
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_user;

-- Same pattern for CHECK constraints:
ALTER TABLE products ADD CONSTRAINT chk_positive_price CHECK (price > 0) NOT VALID;
ALTER TABLE products VALIDATE CONSTRAINT chk_positive_price;
```

## Best Practices
- Always test migrations on a copy of production data first
- Set a lock timeout to fail fast instead of blocking: SET lock_timeout = '5s';
- Run migrations during low-traffic periods when possible
- Use tools like pgroll, reshape, or pg-osc for complex migrations
- Monitor pg_locks during migration to catch unexpected blocking
- Backfill data in batches with LIMIT and explicit ID ranges

## Common Mistakes
- Running CREATE INDEX without CONCURRENTLY on production
- Not setting lock_timeout (migration blocks all queries indefinitely)
- Dropping columns before all application instances are updated
- Adding NOT NULL constraint without backfilling existing rows first
- Running migrations inside a single long transaction (holds locks longer)
