---
id: databricks-delta-table-rules
stackId: databricks
type: rule
name: Delta Table Configuration Rules
description: >-
  Standards for creating and maintaining Delta Lake tables — required table
  properties, partitioning guidelines, maintenance schedules, and schema
  evolution policies in Databricks.
difficulty: intermediate
globs:
  - '**/*.sql'
  - '**/*.py'
tags:
  - delta-lake
  - table-properties
  - partitioning
  - maintenance
  - schema-evolution
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - sql
faq:
  - question: What table properties should every Delta table have?
    answer: >-
      Every production Delta table should have: autoOptimize.optimizeWrite=true,
      autoOptimize.autoCompact=true, deletedFileRetentionDuration=7 days,
      logRetentionDuration=30 days, and columnMapping.mode=name. Also add a
      COMMENT describing the table's purpose and owner.
  - question: How do I know if my Delta table needs partitioning?
    answer: >-
      Partition if: the column appears in 80%+ of query WHERE clauses, has fewer
      than 10,000 distinct values, and each partition would contain more than
      1GB of data. If these conditions aren't met, use Z-ordering instead — it
      provides similar benefits without partition overhead.
relatedItems:
  - databricks-notebook-standards
  - databricks-sql-style-rules
  - databricks-delta-lake-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Delta Table Configuration Rules

## Rule
All Delta tables MUST have documented table properties, appropriate partitioning, scheduled maintenance, and defined schema evolution policies.

## Required Table Properties
```sql
-- Every production Delta table must have these properties
CREATE TABLE catalog.schema.my_table (...)
USING DELTA
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'delta.deletedFileRetentionDuration' = 'interval 7 days',
  'delta.logRetentionDuration' = 'interval 30 days',
  'delta.columnMapping.mode' = 'name'
);

-- Add descriptive comment
COMMENT ON TABLE catalog.schema.my_table IS
  'Daily aggregated user metrics. Source: silver.user_events. Owner: data-eng.';
```

## Partitioning Rules
```
Rule 1: Only partition if the column is used in 80%+ of queries' WHERE clauses
Rule 2: Column must have < 10,000 distinct values
Rule 3: Each partition should contain > 1GB of data
Rule 4: Date/timestamp columns are the most common partition choice
Rule 5: Never partition by high-cardinality columns (user_id, event_id)
```

### Good Partitioning
```sql
-- Partition by date — low cardinality, used in most queries
PARTITIONED BY (event_date DATE)
```

### Bad Partitioning
```sql
-- Partition by user_id — millions of tiny partitions
PARTITIONED BY (user_id STRING)  -- NEVER do this
```

## Maintenance Schedule
| Table Activity | OPTIMIZE Frequency | VACUUM Frequency |
|---------------|-------------------|------------------|
| Streaming (continuous writes) | autoCompact enabled | Weekly |
| Daily batch | Daily after write | Weekly |
| Weekly batch | After each write | Monthly |
| Read-only / archive | Never | Quarterly |

## Schema Evolution Policy
```sql
-- Enable column mapping for safe schema evolution
ALTER TABLE catalog.schema.my_table
SET TBLPROPERTIES ('delta.columnMapping.mode' = 'name');

-- Safe operations (no data rewrite):
-- Adding columns
ALTER TABLE catalog.schema.my_table ADD COLUMN new_col STRING;

-- Unsafe operations (require careful migration):
-- Renaming columns (with column mapping enabled)
-- Changing column types (may lose data)
-- Dropping columns (irreversible)
```

## Anti-Patterns
- Tables without autoOptimize (small files accumulate)
- No VACUUM schedule (storage costs grow indefinitely)
- Partitioning by high-cardinality columns (millions of tiny partitions)
- No table comments (nobody knows what it contains)
- Missing column mapping mode (schema evolution blocked)
- No defined retention period (time travel data grows forever)
