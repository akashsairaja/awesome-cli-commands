---
id: spark-sql-queries
stackId: spark
type: skill
name: Spark SQL from the Command Line
description: >-
  Run SQL queries with spark-sql CLI — querying Parquet, CSV, and JSON files
  directly, creating temporary views, using Hive metastore, and building
  interactive data analysis workflows.
difficulty: intermediate
tags:
  - spark
  - sql
  - command
  - line
  - optimization
  - debugging
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Spark SQL from the Command Line skill?"
    answer: >-
      Run SQL queries with spark-sql CLI — querying Parquet, CSV, and JSON
      files directly, creating temporary views, using Hive metastore, and
      building interactive data analysis workflows. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does Spark SQL from the Command Line require?"
    answer: >-
      Requires npm/yarn/pnpm, pip/poetry installed. Works with spark projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Spark SQL from the Command Line

## Overview
spark-sql provides an interactive SQL interface to Spark. Query Parquet, CSV, JSON, and Hive tables directly from the terminal without writing application code.

## Why This Matters
- **Exploration** — query data files without writing applications
- **Debugging** — inspect intermediate pipeline outputs
- **Ad-hoc analysis** — SQL on large datasets from the terminal
- **Compatibility** — standard SQL syntax for data teams

## How It Works

### Step 1: Launch spark-sql
```bash
# Local mode
spark-sql --master local[4] --driver-memory 4g

# With YARN
spark-sql --master yarn --queue analytics

# With configuration
spark-sql \
  --master local[4] \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.shuffle.partitions=10
```

### Step 2: Query Files Directly
```bash
# Query Parquet files
spark-sql -e "SELECT count(*) FROM parquet.\`/data/events/\`"

# Query CSV with schema inference
spark-sql -e "
  SELECT * FROM csv.\`/data/sales.csv\`
  LIMIT 10
"

# Query JSON files
spark-sql -e "
  SELECT name, age
  FROM json.\`/data/users.json\`
  WHERE age > 25
"

# Query with options
spark-sql -e "
  CREATE TEMPORARY VIEW sales
  USING csv
  OPTIONS (path '/data/sales.csv', header 'true', inferSchema 'true');
  SELECT product, SUM(amount) as total
  FROM sales
  GROUP BY product
  ORDER BY total DESC;
"
```

### Step 3: Interactive Analysis
```bash
# Inside spark-sql shell:

# Create views
# CREATE TEMPORARY VIEW events USING parquet OPTIONS (path '/data/events/');
# CREATE TEMPORARY VIEW users USING parquet OPTIONS (path '/data/users/');

# Join tables
# SELECT u.name, COUNT(e.event_id) as event_count
# FROM users u
# JOIN events e ON u.user_id = e.user_id
# WHERE e.event_date >= '2024-01-01'
# GROUP BY u.name
# ORDER BY event_count DESC
# LIMIT 20;

# Describe schema
# DESCRIBE events;
# DESCRIBE EXTENDED events;

# Show partitions
# SHOW PARTITIONS events;

# Explain query plan
# EXPLAIN FORMATTED
# SELECT ...;
```

### Step 4: Output & Scripting
```bash
# Execute single query
spark-sql -e "SELECT count(*) FROM parquet.\`/data/events/\`"

# Execute SQL file
spark-sql -f queries/daily_report.sql

# Output to file
spark-sql -e "SELECT * FROM parquet.\`/data/users/\` LIMIT 100" > output.tsv

# Silent mode (no progress bars)
spark-sql --conf spark.ui.showConsoleProgress=false \
  -e "SELECT count(*) FROM parquet.\`/data/events/\`"

# With Hive warehouse
spark-sql \
  --conf spark.sql.warehouse.dir=/user/hive/warehouse \
  --conf spark.hadoop.javax.jdo.option.ConnectionURL=jdbc:derby:;databaseName=metastore_db \
  -e "SHOW TABLES"
```

## Best Practices
- Use -e for single queries, -f for SQL files
- Create temporary views for repeated queries
- Use EXPLAIN to understand query plans before running large queries
- Enable AQE for automatic optimization
- Use LIMIT during exploration to avoid scanning full datasets

## Common Mistakes
- Not using backticks around file paths with special characters
- Missing LIMIT on exploration queries (scans entire dataset)
- Not checking EXPLAIN plan for large queries
- Forgetting --master flag (runs in local[1] by default)
- Not setting enough driver memory for large result sets
