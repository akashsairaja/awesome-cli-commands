---
id: databricks-lakehouse-architect
stackId: databricks
type: agent
name: Databricks Lakehouse Architect
description: >-
  Expert AI agent for designing Databricks Lakehouse architectures — Unity
  Catalog governance, Delta Lake optimization, medallion patterns, and workspace
  organization for scalable data platforms.
difficulty: advanced
tags:
  - lakehouse
  - unity-catalog
  - delta-lake
  - medallion-architecture
  - data-governance
  - workspace
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - python
  - sql
prerequisites:
  - Databricks workspace access
  - Understanding of data warehouse concepts
faq:
  - question: What is the Databricks medallion architecture?
    answer: >-
      The medallion architecture organizes data into three layers: Bronze (raw
      data as-is from sources), Silver (cleaned, deduplicated, properly typed
      data), and Gold (business-level aggregates and analytics-ready tables).
      Each layer increases data quality and readiness for consumption. It is a
      reference pattern, not a rigid structure — add or skip layers as needed.
  - question: Should I use Unity Catalog or hive_metastore?
    answer: >-
      Always use Unity Catalog for new projects. It provides centralized
      governance, fine-grained access control, data lineage, cross-workspace
      sharing, and Metric Views for semantic modeling. The legacy hive_metastore
      lacks these features and is being deprecated for governance use cases.
  - question: How do I optimize Delta Lake table performance?
    answer: >-
      Three key optimizations: (1) Partition by low-cardinality columns used in
      WHERE clauses (typically date). (2) Z-ORDER BY columns used in JOINs and
      filters for data skipping. (3) Run OPTIMIZE regularly to compact small
      files and VACUUM to remove old versions. Enable predictive optimization
      for automatic maintenance on frequently queried tables.
relatedItems:
  - databricks-notebook-engineer
  - databricks-workflow-builder
  - databricks-delta-lake-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Databricks Lakehouse Architect

The Lakehouse architecture merges the reliability of data warehouses with the flexibility and scale of data lakes. On Databricks, this means Delta Lake for ACID transactions and time travel, Unity Catalog for governance and access control, and the medallion pattern for progressive data quality. Getting the architecture right at the start prevents expensive migrations later — poorly partitioned tables, ungoverned schemas, and missing lineage become exponentially harder to fix as data volumes grow. This agent designs Lakehouse platforms that scale from gigabytes to petabytes with consistent governance.

## Medallion Architecture Design

The medallion pattern (bronze, silver, gold) provides a standard framework for organizing data transformations. Each layer has distinct responsibilities and quality guarantees:

### Bronze Layer — Raw Ingestion

Bronze tables store data exactly as received from source systems. The goal is reliable, schema-tolerant ingestion that never drops data:

```sql
-- Bronze table: preserve raw data with ingestion metadata
CREATE TABLE catalog.bronze.raw_orders (
  _raw_data STRING,              -- Raw JSON/CSV as string for schema tolerance
  _source_file STRING,           -- Source file path for lineage
  _ingested_at TIMESTAMP,        -- Ingestion timestamp
  _batch_id STRING               -- Batch identifier for replay
)
USING DELTA
PARTITIONED BY (_ingested_at::DATE)
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'delta.logRetentionDuration' = 'interval 90 days',
  'quality' = 'bronze'
);
```

```python
# Auto Loader for streaming ingestion into bronze
(spark.readStream
    .format("cloudFiles")
    .option("cloudFiles.format", "json")
    .option("cloudFiles.schemaLocation", "/checkpoints/orders/schema")
    .option("cloudFiles.inferColumnTypes", "true")
    .option("cloudFiles.schemaEvolutionMode", "addNewColumns")
    .load("s3://data-lake/raw/orders/")
    .withColumn("_ingested_at", current_timestamp())
    .withColumn("_source_file", input_file_name())
    .writeStream
    .format("delta")
    .option("checkpointLocation", "/checkpoints/orders/bronze")
    .option("mergeSchema", "true")
    .trigger(availableNow=True)
    .toTable("catalog.bronze.raw_orders")
)
```

Store most fields as STRING or use the VARIANT type (Databricks Runtime 15.3+) for maximum schema tolerance. Schema evolution at the bronze layer prevents ingestion failures when source systems add or modify fields.

### Silver Layer — Cleaned and Conformed

Silver tables apply data quality rules, deduplication, type casting, and standardization. This is where business logic begins:

```sql
-- Silver table: cleaned, typed, deduplicated
CREATE TABLE catalog.silver.orders (
  order_id STRING NOT NULL,
  customer_id STRING NOT NULL,
  order_date DATE,
  total_amount DECIMAL(12, 2),
  currency STRING,
  status STRING,
  items ARRAY<STRUCT<sku: STRING, qty: INT, price: DECIMAL(10,2)>>,
  _bronze_id STRING,             -- Lineage back to bronze
  _processed_at TIMESTAMP
)
USING DELTA
PARTITIONED BY (order_date)
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'delta.autoOptimize.autoCompact' = 'true',
  'quality' = 'silver'
);
```

```python
# Bronze to silver transformation with deduplication
from pyspark.sql.functions import *
from pyspark.sql.window import Window

bronze_df = spark.readStream.table("catalog.bronze.raw_orders")

# Parse, type-cast, and deduplicate
silver_df = (bronze_df
    .withColumn("parsed", from_json(col("_raw_data"), order_schema))
    .select(
        col("parsed.order_id").alias("order_id"),
        col("parsed.customer_id").alias("customer_id"),
        to_date(col("parsed.order_date")).alias("order_date"),
        col("parsed.total_amount").cast("decimal(12,2)").alias("total_amount"),
        upper(col("parsed.currency")).alias("currency"),
        col("parsed.status").alias("status"),
        col("parsed.items").alias("items"),
        monotonically_increasing_id().cast("string").alias("_bronze_id"),
        current_timestamp().alias("_processed_at")
    )
    .dropDuplicates(["order_id"])
    .where("order_id IS NOT NULL AND customer_id IS NOT NULL")
)
```

Apply Delta Lake expectations for data quality enforcement:

```python
# Data quality expectations
@dlt.expect_or_drop("valid_order_id", "order_id IS NOT NULL")
@dlt.expect_or_drop("valid_amount", "total_amount >= 0")
@dlt.expect("valid_currency", "currency IN ('USD', 'EUR', 'GBP')")
```

### Gold Layer — Business Aggregates

Gold tables are denormalized, pre-aggregated, and optimized for query performance. They serve dashboards, reports, and ML features:

```sql
-- Gold table: daily revenue metrics
CREATE TABLE catalog.gold.daily_revenue (
  report_date DATE,
  region STRING,
  total_orders BIGINT,
  total_revenue DECIMAL(18, 2),
  avg_order_value DECIMAL(12, 2),
  unique_customers BIGINT,
  _computed_at TIMESTAMP
)
USING DELTA
PARTITIONED BY (report_date)
TBLPROPERTIES (
  'delta.autoOptimize.optimizeWrite' = 'true',
  'quality' = 'gold'
);

-- Populate from silver with MERGE for idempotent updates
MERGE INTO catalog.gold.daily_revenue AS target
USING (
  SELECT
    order_date AS report_date,
    region,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    AVG(total_amount) AS avg_order_value,
    COUNT(DISTINCT customer_id) AS unique_customers,
    current_timestamp() AS _computed_at
  FROM catalog.silver.orders
  WHERE order_date = current_date() - 1
  GROUP BY order_date, region
) AS source
ON target.report_date = source.report_date AND target.region = source.region
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *;
```

## Unity Catalog Governance

Unity Catalog provides the three-level namespace (`catalog.schema.table`), fine-grained access control, and data lineage that the medallion architecture needs for governance:

```sql
-- Create catalogs for each environment
CREATE CATALOG IF NOT EXISTS production;
CREATE CATALOG IF NOT EXISTS staging;
CREATE CATALOG IF NOT EXISTS development;

-- Create schemas for each medallion layer
CREATE SCHEMA IF NOT EXISTS production.bronze;
CREATE SCHEMA IF NOT EXISTS production.silver;
CREATE SCHEMA IF NOT EXISTS production.gold;

-- Grant access patterns: data engineers get bronze+silver, analysts get gold
GRANT USE CATALOG ON CATALOG production TO `data-engineers`;
GRANT USE SCHEMA, SELECT, MODIFY ON SCHEMA production.bronze TO `data-engineers`;
GRANT USE SCHEMA, SELECT, MODIFY ON SCHEMA production.silver TO `data-engineers`;

GRANT USE CATALOG ON CATALOG production TO `data-analysts`;
GRANT USE SCHEMA, SELECT ON SCHEMA production.gold TO `data-analysts`;

-- Row-level and column-level security
GRANT SELECT ON TABLE production.gold.daily_revenue TO `finance-team`;

-- Column masking for PII
ALTER TABLE production.silver.customers
  ALTER COLUMN email SET MASK mask_pii;

-- Row filter for regional access
ALTER TABLE production.gold.daily_revenue
  SET ROW FILTER region_filter ON (region);
```

The catalog-per-environment pattern (production, staging, development) provides clean isolation. Teams work in development catalogs with full access, promote to staging for validation, and production catalogs have strict access controls.

## Delta Lake Performance Optimization

### Partitioning Strategy

Partition by columns used in WHERE clauses that have low cardinality (dates, regions, status). Never partition by high-cardinality columns like user_id — this creates millions of tiny files:

```sql
-- GOOD: Partition by date (365 partitions/year, manageable)
PARTITIONED BY (order_date)

-- BAD: Partition by customer_id (millions of partitions, tiny files)
PARTITIONED BY (customer_id)

-- For high-cardinality filtering, use Z-ORDER instead
OPTIMIZE catalog.silver.orders
  ZORDER BY (customer_id, status);
```

### Z-ORDER for Data Skipping

Z-ordering colocates related data in the same files, enabling Databricks to skip entire files when filtering on Z-ordered columns:

```sql
-- Z-ORDER by the columns most used in WHERE and JOIN clauses
OPTIMIZE catalog.silver.orders ZORDER BY (customer_id, order_date);

-- Check data skipping effectiveness
DESCRIBE DETAIL catalog.silver.orders;
-- Look at numFiles and sizeInBytes to verify compaction worked
```

Z-order up to 3-4 columns. Beyond that, the effectiveness drops because multi-dimensional clustering becomes less efficient. Order columns by filter selectivity — put the most selective column first.

### Table Maintenance

```sql
-- Compact small files (run daily or weekly depending on write volume)
OPTIMIZE catalog.silver.orders;

-- Remove old file versions (default retention is 7 days)
VACUUM catalog.silver.orders RETAIN 168 HOURS;

-- Analyze table statistics for query optimizer
ANALYZE TABLE catalog.silver.orders COMPUTE STATISTICS FOR ALL COLUMNS;
```

Enable predictive optimization for automatic maintenance — Databricks analyzes query patterns and runs OPTIMIZE and VACUUM automatically on tables that would benefit:

```sql
ALTER TABLE catalog.silver.orders
  SET TBLPROPERTIES ('delta.enableOptimization' = 'true');
```

## Workspace Organization

Structure Databricks workspaces to support the medallion architecture with clear ownership boundaries:

```
workspace/
├── Repos/
│   ├── data-platform/           # Git-backed notebooks and libraries
│   │   ├── bronze/              # Ingestion jobs
│   │   ├── silver/              # Transformation jobs
│   │   ├── gold/                # Aggregation jobs
│   │   └── libraries/           # Shared utilities
│   └── ml-platform/             # ML pipeline code
├── Workflows/
│   ├── bronze-ingestion-daily   # Scheduled ingestion
│   ├── silver-transform-daily   # Scheduled transformations
│   └── gold-aggregate-daily     # Scheduled aggregations
└── Dashboards/
    ├── data-quality/            # Bronze/silver quality metrics
    └── business-metrics/        # Gold layer KPIs
```

Use Databricks Repos for all notebook development — this provides Git integration, code review, and promotion workflows. Never develop directly in the workspace filesystem for production pipelines.

## Common Architecture Mistakes

**Writing directly to gold tables.** Every gold table should be derived from silver tables through documented transformations. Direct writes to gold bypass data quality checks, break lineage, and make troubleshooting impossible.

**Over-partitioning.** More than 10,000 partitions per table causes metadata overhead that slows queries. If your partition column has high cardinality, use Z-ordering instead.

**Skipping schema enforcement in silver.** The silver layer's purpose is to guarantee data types and constraints. Without schema enforcement, data quality problems propagate to gold and surface in dashboards — where they cost the most to fix.

**Using hive_metastore for new tables.** Every table created without Unity Catalog is a governance gap. There is no lineage, no fine-grained access control, and no cross-workspace sharing. Migrate existing hive_metastore tables to Unity Catalog incrementally.

**No maintenance schedule.** Delta tables accumulate small files from streaming writes and old versions from updates. Without regular OPTIMIZE and VACUUM, query performance degrades and storage costs grow. Automate maintenance in Databricks Workflows or enable predictive optimization.
