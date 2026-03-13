---
id: snowflake-time-travel-usage
stackId: snowflake
type: skill
name: >-
  Time Travel & Data Recovery
description: >-
  Use Snowflake Time Travel to query historical data, recover from accidental
  changes, compare data across time, and implement audit patterns — all
  without backup infrastructure.
difficulty: advanced
tags:
  - snowflake
  - time
  - travel
  - data
  - recovery
  - debugging
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Time Travel & Data Recovery skill?"
    answer: >-
      Use Snowflake Time Travel to query historical data, recover from
      accidental changes, compare data across time, and implement audit
      patterns — all without backup infrastructure. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does Time Travel & Data Recovery require?"
    answer: >-
      Works with standard snowflake tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Time Travel & Data Recovery

## Overview
Snowflake Time Travel lets you query data as it existed at any point within the retention period (1-90 days). Use it to recover from accidental deletes, compare data across time, and implement audit trails without any backup infrastructure.

## Why This Matters
- **Recovery** — undo accidental DELETE, TRUNCATE, or DROP operations
- **Auditing** — compare data between any two points in time
- **Debugging** — see what data looked like when a bug occurred
- **No infrastructure** — built into Snowflake, no backup systems needed

## How It Works

### Step 1: Query Historical Data
```sql
-- Query data as of a specific timestamp
SELECT *
FROM prod.analytics.daily_metrics
AT (TIMESTAMP => '2026-03-10 08:00:00'::TIMESTAMP);

-- Query data as of N seconds ago
SELECT *
FROM prod.analytics.daily_metrics
AT (OFFSET => -3600);  -- 1 hour ago

-- Query a specific version (from QUERY_ID)
SELECT *
FROM prod.analytics.daily_metrics
BEFORE (STATEMENT => '01abc-def-ghi');
```

### Step 2: Recover from Accidental Changes
```sql
-- Oops! Someone ran DELETE without WHERE
-- Recover the data:
CREATE TABLE prod.analytics.daily_metrics_recovered
CLONE prod.analytics.daily_metrics
AT (TIMESTAMP => '2026-03-10 07:00:00'::TIMESTAMP);

-- Verify recovered data, then swap
ALTER TABLE prod.analytics.daily_metrics
SWAP WITH prod.analytics.daily_metrics_recovered;
```

### Step 3: Recover Dropped Tables
```sql
-- Oops! Someone dropped the table
-- Undrop it:
UNDROP TABLE prod.analytics.daily_metrics;

-- Also works for schemas and databases
UNDROP SCHEMA prod.analytics;
UNDROP DATABASE prod;
```

### Step 4: Compare Data Across Time
```sql
-- Find what changed between two timestamps
SELECT
  'deleted' AS change_type, old.*
FROM prod.analytics.daily_metrics
  AT (TIMESTAMP => '2026-03-10'::TIMESTAMP) old
LEFT JOIN prod.analytics.daily_metrics current
  ON old.metric_date = current.metric_date
WHERE current.metric_date IS NULL

UNION ALL

SELECT
  'added' AS change_type, current.*
FROM prod.analytics.daily_metrics current
LEFT JOIN prod.analytics.daily_metrics
  AT (TIMESTAMP => '2026-03-10'::TIMESTAMP) old
  ON current.metric_date = old.metric_date
WHERE old.metric_date IS NULL;
```

## Retention Configuration
```sql
-- Set retention period (1-90 days, default 1)
ALTER TABLE prod.analytics.daily_metrics
SET DATA_RETENTION_TIME_IN_DAYS = 30;

-- Check current retention
SHOW TABLES LIKE 'daily_metrics' IN SCHEMA prod.analytics;
```

## Best Practices
- Set DATA_RETENTION_TIME_IN_DAYS to 7-30 for production tables
- Use transient tables (0 days retention) for staging/temp data to save storage
- Document the query_id after major operations for easy rollback reference
- Use CLONE instead of CTAS for recovery (zero-copy, instant)
- Test recovery procedures before you need them

## Common Mistakes
- Default 1-day retention on critical tables (not enough for weekend incidents)
- Using permanent tables for staging data (paying for unnecessary time travel storage)
- Not recording query_id before destructive operations
- CTAS for recovery instead of CLONE (slow and expensive)
- Assuming Time Travel works after retention expires (data is gone)
