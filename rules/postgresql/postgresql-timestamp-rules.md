---
id: postgresql-timestamp-rules
stackId: postgresql
type: rule
name: PostgreSQL Timestamp & Timezone Standards
description: >-
  Enforce consistent timestamp handling in PostgreSQL — always use TIMESTAMPTZ,
  store UTC, handle timezone conversions at the application layer, and include
  audit columns.
difficulty: beginner
globs:
  - '**/*.sql'
  - '**/migrations/**'
tags:
  - timestamps
  - timezone
  - utc
  - audit-columns
  - timestamptz
  - postgresql
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
  - question: Why should I use TIMESTAMPTZ instead of TIMESTAMP in PostgreSQL?
    answer: >-
      TIMESTAMP WITHOUT TIME ZONE stores a naive datetime with no timezone
      context — if your server timezone changes or clients connect from
      different timezones, the same value is interpreted differently.
      TIMESTAMPTZ stores the moment in UTC and converts for display, making it
      unambiguous and correct across all contexts.
  - question: Should I store timestamps in UTC in PostgreSQL?
    answer: >-
      Yes. PostgreSQL internally stores TIMESTAMPTZ in UTC regardless of the
      session timezone. Setting the server timezone to UTC ensures consistency.
      Convert to local timezones at the application layer or in SELECT queries
      using AT TIME ZONE for display purposes only.
relatedItems:
  - postgresql-naming-conventions
  - postgresql-database-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PostgreSQL Timestamp & Timezone Standards

## Rule
All timestamp columns MUST use TIMESTAMPTZ (timestamp with time zone). All timestamps are stored in UTC. Timezone conversion happens at the application layer.

## Format
```sql
-- ALWAYS use TIMESTAMPTZ
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

-- NEVER use TIMESTAMP (without time zone)
-- created_at TIMESTAMP  -- WRONG: ambiguous timezone
```

## Requirements

### 1. Every Table Gets Audit Columns
```sql
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  -- ... business columns ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update updated_at with trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 2. Database Timezone is UTC
```sql
-- Set at the server level
ALTER SYSTEM SET timezone = 'UTC';

-- Verify
SHOW timezone;  -- Should return 'UTC'
```

### 3. Query with Timezone-Aware Functions
```sql
-- GOOD: Compare with timezone-aware literal
SELECT * FROM orders WHERE created_at >= '2025-01-01T00:00:00Z';

-- GOOD: Convert for display
SELECT created_at AT TIME ZONE 'America/New_York' AS local_time FROM orders;

-- BAD: Using date_trunc without timezone consideration
-- date_trunc('day', created_at)  -- Truncates in session timezone, not UTC
```

### 4. Use Intervals for Date Math
```sql
-- GOOD: interval arithmetic
SELECT * FROM orders WHERE created_at >= now() - interval '30 days';

-- BAD: string math
-- WHERE created_at >= '2025-02-01'  -- Breaks next month
```

## Examples

### Good
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Bad
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255),
  event_time TIMESTAMP,         -- Missing timezone
  created_date DATE              -- Losing time precision
  -- Missing created_at/updated_at
);
```

## Enforcement
Use squawk or a custom SQL linter to flag TIMESTAMP WITHOUT TIME ZONE in migration files. Add a CI check that rejects any new TIMESTAMP column that is not TIMESTAMPTZ.
