---
id: databricks-delta-lake-optimization
stackId: databricks
type: skill
name: Delta Lake Table Optimization
description: >-
  Optimize Delta Lake tables for query performance — partitioning strategies,
  Z-ordering, file compaction, vacuum schedules, and table properties for fast
  analytics at scale.
difficulty: intermediate
tags:
  - databricks
  - delta
  - lake
  - table
  - optimization
  - performance
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Delta Lake Table Optimization skill?"
    answer: >-
      Optimize Delta Lake tables for query performance — partitioning
      strategies, Z-ordering, file compaction, vacuum schedules, and table
      properties for fast analytics at scale. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Delta Lake Table Optimization require?"
    answer: >-
      Works with standard databricks tooling (relevant CLI tools and
      frameworks). No special setup required beyond a working databricks
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Delta Lake Table Optimization

## Overview
Delta Lake tables degrade in performance over time as small files accumulate and data layout drifts from query patterns. Regular optimization keeps queries fast and storage costs low.

## Why This Matters
- **Query speed** — proper Z-ordering can improve queries by 10-100x
- **Storage cost** — VACUUM removes old versions, compaction reduces file count
- **Reliability** — optimized tables have predictable performance
- **Scale** — good partitioning prevents full table scans

## How It Works

### Step 1: Partitioning Strategy
```sql
-- Partition by columns used in WHERE clauses
-- Best for date/time filters
CREATE TABLE catalog.schema.events (
  event_id STRING,
  event_type STRING,
  user_id STRING,
  event_timestamp TIMESTAMP,
  payload STRING
)
USING DELTA
PARTITIONED BY (event_date DATE)
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true'
);

-- Rule: Only partition if column has < 10,000 distinct values
-- Rule: Partitions should be > 1GB each for optimal performance
```

### Step 2: Z-Ordering
```sql
-- Z-ORDER by columns used in JOINs and filters (not partition columns)
OPTIMIZE catalog.schema.events
ZORDER BY (user_id, event_type);

-- Run after large writes or on a schedule
-- Z-ORDER is most effective with 2-4 columns
```

### Step 3: File Compaction
```sql
-- OPTIMIZE compacts small files into larger ones
OPTIMIZE catalog.schema.events;

-- Check file sizes before optimization
DESCRIBE DETAIL catalog.schema.events;
-- Look at: numFiles, sizeInBytes

-- Target: files between 256MB-1GB after compaction
```

### Step 4: Vacuum Old Versions
```sql
-- Remove files older than retention period
VACUUM catalog.schema.events RETAIN 168 HOURS; -- 7 days

-- Check history before vacuuming
DESCRIBE HISTORY catalog.schema.events;

-- Set default retention
ALTER TABLE catalog.schema.events
SET TBLPROPERTIES ('delta.deletedFileRetentionDuration' = 'interval 7 days');
```

### Step 5: Table Properties
```sql
ALTER TABLE catalog.schema.events SET TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'delta.targetFileSize' = '256mb',
  'delta.tuneFileSizesForRewrites' = 'true',
  'delta.deletedFileRetentionDuration' = 'interval 7 days',
  'delta.logRetentionDuration' = 'interval 30 days'
);
```

## Best Practices
- Partition by date columns that appear in 80%+ of queries
- Z-ORDER by the 2-4 most filtered/joined columns (excluding partition columns)
- Run OPTIMIZE daily for active tables, weekly for stable tables
- VACUUM after OPTIMIZE, not before
- Enable autoOptimize for streaming and frequent-write tables
- Monitor table stats with DESCRIBE DETAIL regularly

## Common Mistakes
- Over-partitioning (too many small partitions degrade performance)
- Z-ordering by partition columns (redundant, wastes compute)
- Never running VACUUM (storage costs grow indefinitely)
- VACUUM with too short retention (breaks time travel queries)
- Not enabling autoOptimize for streaming tables
