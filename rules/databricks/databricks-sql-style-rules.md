---
id: databricks-sql-style-rules
stackId: databricks
type: rule
name: Databricks SQL Style Guide
description: >-
  SQL formatting and style standards for Databricks — keyword casing, CTE
  patterns, Delta-specific syntax, naming conventions, and query optimization
  rules for readable, performant queries.
difficulty: beginner
globs:
  - '**/*.sql'
  - '**/*.py'
tags:
  - sql
  - style-guide
  - formatting
  - naming-conventions
  - cte
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - sql
faq:
  - question: Why should I use CTEs instead of subqueries in Databricks?
    answer: >-
      CTEs (Common Table Expressions) make complex queries readable by breaking
      them into named, logical steps. They're easier to debug (run each CTE
      independently), maintain (modify one step without affecting others), and
      review. Nested subqueries become unreadable beyond 2 levels.
  - question: Why must I always use the three-level namespace?
    answer: >-
      The three-level namespace (catalog.schema.table) eliminates ambiguity
      about which data you're accessing. Without it, queries depend on the
      default catalog/schema setting, which varies by user and cluster. Explicit
      namespaces prevent accidental reads from wrong environments.
relatedItems:
  - databricks-notebook-standards
  - databricks-delta-table-rules
  - databricks-lakehouse-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Databricks SQL Style Guide

## Rule
All SQL in Databricks notebooks, queries, and pipelines MUST follow these formatting and style standards for readability and maintainability.

## Keyword Casing
```sql
-- ALWAYS: uppercase SQL keywords
SELECT
  user_id,
  event_type,
  COUNT(*) AS event_count
FROM catalog.schema.events
WHERE event_date >= '2026-01-01'
GROUP BY user_id, event_type
HAVING COUNT(*) > 10
ORDER BY event_count DESC;
```

## CTE Pattern (Required for Complex Queries)
```sql
-- Good — CTEs for readability
WITH active_users AS (
  SELECT DISTINCT user_id
  FROM prod.silver.user_sessions
  WHERE last_active >= CURRENT_DATE - INTERVAL 30 DAYS
),

user_events AS (
  SELECT
    e.user_id,
    e.event_type,
    COUNT(*) AS event_count
  FROM prod.silver.events e
  INNER JOIN active_users au ON e.user_id = au.user_id
  GROUP BY e.user_id, e.event_type
)

SELECT *
FROM user_events
WHERE event_count > 5
ORDER BY event_count DESC;

-- Bad — nested subqueries
SELECT * FROM (
  SELECT user_id, COUNT(*) as cnt FROM (
    SELECT DISTINCT user_id FROM sessions WHERE ...
  ) t1 JOIN events ON ... GROUP BY user_id
) t2 WHERE cnt > 5;
```

## Naming Conventions
```sql
-- Tables: snake_case, descriptive nouns
-- Good: daily_active_users, order_line_items
-- Bad: DAU, tbl_orders, data2

-- Columns: snake_case, no abbreviations
-- Good: user_id, created_at, event_timestamp
-- Bad: uid, ts, col1

-- CTEs: snake_case, descriptive
-- Good: active_users, monthly_revenue
-- Bad: t1, tmp, cte1

-- Aliases: meaningful, not single letters (except standard joins)
-- Good: events e, users u (standard), daily_metrics dm
-- Bad: x, t1, foo
```

## Three-Level Namespace (Required)
```sql
-- ALWAYS use full catalog.schema.table path
-- Good
SELECT * FROM prod_catalog.gold.daily_metrics;

-- Bad (assumes default catalog/schema)
SELECT * FROM daily_metrics;
```

## Delta-Specific Syntax
```sql
-- MERGE for upserts (not DELETE + INSERT)
MERGE INTO prod.silver.users AS target
USING staging.users AS source
ON target.user_id = source.user_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;

-- Time travel for debugging
SELECT * FROM prod.silver.users VERSION AS OF 5;
SELECT * FROM prod.silver.users TIMESTAMP AS OF '2026-03-10';
```

## Anti-Patterns
- SELECT * in production queries (fragile schema coupling)
- Nested subqueries instead of CTEs (unreadable)
- Missing three-level namespace (ambiguous table references)
- DELETE + INSERT instead of MERGE for upserts (not atomic)
- Lowercase SQL keywords mixed with uppercase (inconsistent)
