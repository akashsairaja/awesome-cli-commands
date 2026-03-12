---
id: snowflake-sql-style-rules
stackId: snowflake
type: rule
name: Snowflake SQL Style Standards
description: >-
  SQL formatting standards for Snowflake — uppercase keywords, CTE patterns,
  fully qualified names, VARIANT handling, and Snowflake-specific syntax for
  readable, maintainable queries.
difficulty: beginner
globs:
  - '**/*.sql'
tags:
  - sql
  - style-guide
  - formatting
  - variant
  - naming-conventions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - sql
faq:
  - question: Why must Snowflake queries use fully qualified table names?
    answer: >-
      Fully qualified names (database.schema.table) remove ambiguity. Without
      them, queries depend on the current USE DATABASE/SCHEMA context, which
      varies by session. This causes queries to break when run from different
      contexts or by different users.
  - question: How should I access VARIANT data in Snowflake?
    answer: >-
      Always cast VARIANT fields to explicit types with :: notation:
      raw_data:user_id::STRING. Access nested fields with dot notation:
      raw_data:event.type::STRING. Access arrays with index:
      raw_data:tags[0]::STRING. Without casting, values remain VARIANT type and
      behave unpredictably in comparisons.
relatedItems:
  - snowflake-warehouse-rules
  - snowflake-security-rules
  - snowflake-query-optimizer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Snowflake SQL Style Standards

## Rule
All Snowflake SQL MUST use uppercase keywords, fully qualified table names, CTEs for complex queries, and follow Snowflake-specific patterns for VARIANT and semi-structured data.

## Keyword and Naming Rules
```sql
-- UPPERCASE: SQL keywords
-- snake_case: tables, columns, CTEs, views
-- SCREAMING_CASE: constants and role names

-- Good
SELECT
  user_id,
  event_type,
  event_timestamp::DATE AS event_date
FROM prod_db.analytics.events
WHERE event_date >= DATEADD(DAY, -30, CURRENT_DATE());

-- Bad
select userId, eventType from events where eventDate >= dateadd(day, -30, current_date())
```

## Fully Qualified Names (Required)
```sql
-- ALWAYS use database.schema.object
-- Good
SELECT * FROM prod_db.analytics.daily_metrics;
CREATE TABLE prod_db.staging.temp_events (...);

-- Bad (depends on USE DATABASE/SCHEMA context)
SELECT * FROM daily_metrics;
```

## CTE Pattern (Required for 3+ Tables)
```sql
WITH active_users AS (
  SELECT DISTINCT user_id
  FROM prod_db.analytics.sessions
  WHERE session_date >= DATEADD(DAY, -7, CURRENT_DATE())
),

user_events AS (
  SELECT
    e.user_id,
    e.event_type,
    COUNT(*) AS event_count
  FROM prod_db.analytics.events e
  INNER JOIN active_users au ON e.user_id = au.user_id
  GROUP BY 1, 2
)

SELECT * FROM user_events WHERE event_count > 10;
```

## VARIANT Data Access
```sql
-- Good — explicit casting with path notation
SELECT
  raw_data:user_id::STRING AS user_id,
  raw_data:event.type::STRING AS event_type,
  raw_data:event.timestamp::TIMESTAMP AS event_ts,
  raw_data:metadata.tags[0]::STRING AS first_tag
FROM prod_db.raw.json_events;

-- Bad — no casting, ambiguous types
SELECT raw_data:user_id, raw_data:event FROM json_events;
```

## Date Functions (Snowflake-Specific)
```sql
-- Use Snowflake-native date functions
DATEADD(DAY, -30, CURRENT_DATE())    -- Not DATE_SUB
DATEDIFF(DAY, start_date, end_date)  -- Not TIMESTAMPDIFF
DATE_TRUNC('MONTH', event_date)      -- Consistent truncation
TO_DATE(string_col, 'YYYY-MM-DD')    -- Explicit format
```

## Anti-Patterns
- SELECT * in production queries (schema coupling, unnecessary I/O)
- Unqualified table names (ambiguous, context-dependent)
- Nested subqueries beyond 2 levels (use CTEs)
- VARIANT access without type casting (returns VARIANT, not usable types)
- GROUP BY ordinal (GROUP BY 1, 2) in complex queries (fragile)
