---
id: snowflake-warehouse-rules
stackId: snowflake
type: rule
name: Warehouse Configuration Rules
description: >-
  Standards for Snowflake virtual warehouse configuration — sizing,
  auto-suspend, scaling policies, resource monitors, and workload separation for
  cost-efficient operations.
difficulty: intermediate
globs:
  - '**/*.sql'
tags:
  - warehouses
  - cost-optimization
  - auto-suspend
  - resource-monitors
  - sizing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - sql
faq:
  - question: What auto-suspend value should I use for Snowflake warehouses?
    answer: >-
      Use 60 seconds for interactive BI and dev warehouses (frequent use, quick
      resume). Use 300 seconds for ETL and data science warehouses (avoid costly
      resume between batch tasks). Never set auto-suspend to 0 — it keeps the
      warehouse running and burning credits indefinitely.
  - question: Why do I need separate warehouses for different workloads?
    answer: >-
      Separate warehouses let you optimize each independently: sizing,
      auto-suspend timing, scaling policy, and cost monitoring. A single shared
      warehouse means ETL jobs compete with BI queries, making it impossible to
      guarantee performance or track costs by team.
relatedItems:
  - snowflake-sql-style-rules
  - snowflake-security-rules
  - snowflake-data-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Warehouse Configuration Rules

## Rule
All Snowflake warehouses MUST have auto-suspend configured, resource monitors attached, and be sized appropriately for their workload type.

## Required Configuration
```sql
CREATE WAREHOUSE etl_wh WITH
  WAREHOUSE_SIZE = 'SMALL'
  AUTO_SUSPEND = 300            -- REQUIRED: seconds (60-3600)
  AUTO_RESUME = TRUE            -- REQUIRED
  MIN_CLUSTER_COUNT = 1
  MAX_CLUSTER_COUNT = 3         -- For multi-cluster
  SCALING_POLICY = 'ECONOMY'    -- For batch workloads
  INITIALLY_SUSPENDED = TRUE
  COMMENT = 'ETL pipeline processing. Owner: data-engineering.';
```

## Warehouse Separation (Required)
```sql
-- Separate warehouses by workload type
-- Good
CREATE WAREHOUSE etl_wh ...;        -- Data engineering
CREATE WAREHOUSE analytics_wh ...;  -- BI and reporting
CREATE WAREHOUSE ds_wh ...;         -- Data science
CREATE WAREHOUSE dev_wh ...;        -- Development/testing

-- Bad — one warehouse for everything
CREATE WAREHOUSE my_warehouse ...;  -- ETL + BI + DS mixed
```

## Auto-Suspend Rules
| Workload | Auto-Suspend | Why |
|----------|-------------|-----|
| Interactive BI | 60 seconds | Quick resume, frequent use |
| ETL/ELT | 300 seconds | Avoid resume between tasks |
| Data Science | 300 seconds | Long intervals between queries |
| Dev/Test | 60 seconds | Minimize idle costs |

## Resource Monitors (Required)
```sql
-- Every warehouse must have a resource monitor
CREATE RESOURCE MONITOR etl_monitor WITH
  CREDIT_QUOTA = 500
  FREQUENCY = MONTHLY
  START_TIMESTAMP = IMMEDIATELY
  TRIGGERS
    ON 75 PERCENT DO NOTIFY
    ON 90 PERCENT DO NOTIFY
    ON 100 PERCENT DO SUSPEND;

ALTER WAREHOUSE etl_wh SET RESOURCE_MONITOR = etl_monitor;
```

## Sizing Guidelines
```
Rule: Start XSMALL, scale up only when queries are consistently slow
Rule: Double size = 2x compute, 2x cost, but NOT always 2x faster
Rule: Wide queries (many rows, few columns) benefit from larger size
Rule: Deep queries (many joins, complex logic) may not benefit from scaling up
```

## Good Configuration
```sql
-- Dedicated, right-sized, monitored
CREATE WAREHOUSE analytics_wh WITH
  WAREHOUSE_SIZE = 'XSMALL'
  AUTO_SUSPEND = 60
  AUTO_RESUME = TRUE
  SCALING_POLICY = 'STANDARD'
  COMMENT = 'BI dashboard queries. Owner: analytics.';
```

## Bad Configuration
```sql
-- Oversized, no suspend, no monitor
CREATE WAREHOUSE my_wh WITH
  WAREHOUSE_SIZE = 'XLARGE'     -- Start small!
  AUTO_SUSPEND = 0              -- Never suspends! Burns credits 24/7
  -- No COMMENT, no resource monitor
```

## Anti-Patterns
- AUTO_SUSPEND = 0 (warehouse never suspends, burns credits)
- No resource monitor (surprise bills)
- Starting with LARGE+ size (wasteful, start XSMALL)
- One warehouse for all workloads (can't optimize individually)
- Missing COMMENT (nobody knows the warehouse's purpose)
