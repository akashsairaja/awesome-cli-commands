---
id: snowflake-data-pipeline-setup
stackId: snowflake
type: skill
name: 'Data Pipeline with Stages, Pipes & Tasks'
description: >-
  Build automated data pipelines in Snowflake — external stages for data
  landing, Snowpipe for continuous ingestion, streams for CDC, and tasks for
  scheduled transformations.
difficulty: intermediate
tags:
  - stages
  - snowpipe
  - streams
  - tasks
  - data-pipeline
  - cdc
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - sql
prerequisites:
  - Snowflake account with SYSADMIN access
  - Cloud storage (S3/GCS/Azure Blob) configured
faq:
  - question: What is Snowpipe and how does it work?
    answer: >-
      Snowpipe is Snowflake's continuous data ingestion service. It
      automatically loads data from cloud storage (S3, GCS, Azure) into
      Snowflake tables within minutes of file arrival. Configure it with
      AUTO_INGEST=TRUE and set up cloud event notifications to trigger loading.
  - question: How do Snowflake Streams enable change data capture?
    answer: >-
      Streams track row-level changes (inserts, updates, deletes) on a table.
      When you query a stream, you get only the changes since the last
      consumption. Use APPEND_ONLY=TRUE for event data (inserts only) for better
      performance.
  - question: How do I chain multiple Snowflake Tasks?
    answer: >-
      Use the AFTER clause to create task dependencies: CREATE TASK child_task
      AFTER parent_task. Resume tasks bottom-up (child first, then parent). The
      child task runs automatically when the parent completes successfully.
relatedItems:
  - snowflake-time-travel-usage
  - snowflake-data-sharing
  - snowflake-data-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Data Pipeline with Stages, Pipes & Tasks

## Overview
Snowflake provides native data pipeline components: Stages for file access, Snowpipe for auto-ingestion, Streams for change data capture, and Tasks for scheduled SQL. Together they create fully automated ELT pipelines without external orchestration.

## Why This Matters
- **Auto-ingestion** — Snowpipe loads data within minutes of file arrival
- **CDC** — Streams capture inserts, updates, deletes automatically
- **Scheduling** — Tasks run SQL on cron schedules or stream triggers
- **No external tools** — entire pipeline runs inside Snowflake

## How It Works

### Step 1: Create External Stage
```sql
-- Point to cloud storage
CREATE OR REPLACE STAGE raw_data_stage
  URL = 's3://my-bucket/raw/'
  STORAGE_INTEGRATION = my_s3_integration
  FILE_FORMAT = (
    TYPE = 'JSON'
    STRIP_OUTER_ARRAY = TRUE
    DATE_FORMAT = 'YYYY-MM-DD'
  );

-- List files in stage
LIST @raw_data_stage;

-- Preview data
SELECT $1 FROM @raw_data_stage/events/ LIMIT 10;
```

### Step 2: Set Up Snowpipe for Auto-Ingestion
```sql
-- Create target table
CREATE OR REPLACE TABLE raw.events (
  raw_data VARIANT,
  filename STRING DEFAULT METADATA$FILENAME,
  loaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Create pipe for auto-loading
CREATE OR REPLACE PIPE raw_events_pipe
  AUTO_INGEST = TRUE
AS
COPY INTO raw.events (raw_data)
FROM @raw_data_stage/events/
FILE_FORMAT = (TYPE = 'JSON');

-- Get the SQS/SNS notification channel
SHOW PIPES LIKE 'raw_events_pipe';
-- Configure the notification_channel in your S3 bucket event settings
```

### Step 3: Create Stream for CDC
```sql
-- Track changes on the raw table
CREATE OR REPLACE STREAM raw_events_stream
  ON TABLE raw.events
  APPEND_ONLY = TRUE;  -- Only track inserts (common for event data)

-- Check for new data
SELECT SYSTEM$STREAM_HAS_DATA('raw_events_stream');
```

### Step 4: Create Tasks for Transformations
```sql
-- Transform when new data arrives (stream-triggered)
CREATE OR REPLACE TASK transform_events
  WAREHOUSE = etl_wh
  SCHEDULE = '5 MINUTE'
  WHEN SYSTEM$STREAM_HAS_DATA('raw_events_stream')
AS
INSERT INTO staging.events
SELECT
  raw_data:event_id::STRING AS event_id,
  raw_data:event_type::STRING AS event_type,
  raw_data:user_id::STRING AS user_id,
  raw_data:timestamp::TIMESTAMP AS event_timestamp,
  raw_data AS raw_payload
FROM raw_events_stream;

-- Chain tasks for multi-step pipelines
CREATE OR REPLACE TASK build_daily_metrics
  WAREHOUSE = etl_wh
  AFTER transform_events
AS
MERGE INTO analytics.daily_metrics AS target
USING (
  SELECT
    DATE(event_timestamp) AS metric_date,
    COUNT(*) AS event_count,
    COUNT(DISTINCT user_id) AS unique_users
  FROM staging.events
  WHERE event_timestamp >= DATEADD(DAY, -1, CURRENT_DATE())
  GROUP BY DATE(event_timestamp)
) AS source
ON target.metric_date = source.metric_date
WHEN MATCHED THEN UPDATE SET
  event_count = source.event_count,
  unique_users = source.unique_users
WHEN NOT MATCHED THEN INSERT VALUES (
  source.metric_date, source.event_count, source.unique_users
);

-- Resume tasks (they start suspended)
ALTER TASK build_daily_metrics RESUME;
ALTER TASK transform_events RESUME;
```

## Best Practices
- Resume child tasks BEFORE parent tasks (bottom-up)
- Use APPEND_ONLY streams for event/log data (better performance)
- Set appropriate SCHEDULE intervals (don't poll too frequently)
- Monitor pipe status with PIPE_USAGE_HISTORY
- Use MERGE for idempotent transforms (safe to re-run)

## Common Mistakes
- Forgetting to RESUME tasks after creation (they start suspended)
- Resuming parent before child tasks (child never runs)
- Not configuring S3 event notifications for Snowpipe
- Using INSERT without MERGE (duplicate data on re-runs)
- No error handling in task SQL (silent failures)
