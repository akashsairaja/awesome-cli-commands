---
id: databricks-unity-catalog-setup
stackId: databricks
type: skill
name: >-
  Unity Catalog Setup & Governance
description: >-
  Set up Databricks Unity Catalog for centralized data governance — metastore
  configuration, catalog/schema hierarchy, access controls, data lineage, and
  cross-workspace sharing.
difficulty: intermediate
tags:
  - databricks
  - unity
  - catalog
  - setup
  - governance
  - security
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Unity Catalog Setup & Governance skill?"
    answer: >-
      Set up Databricks Unity Catalog for centralized data governance —
      metastore configuration, catalog/schema hierarchy, access controls, data
      lineage, and cross-workspace sharing. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Unity Catalog Setup & Governance require?"
    answer: >-
      Works with standard databricks tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Unity Catalog Setup & Governance

## Overview
Unity Catalog provides centralized governance for all data assets in Databricks. It manages access control, data lineage, auditing, and sharing across workspaces and clouds with a three-level namespace: catalog.schema.table.

## Why This Matters
- **Centralized governance** — one place for all access control
- **Data lineage** — automatic tracking of data flow between tables
- **Fine-grained access** — column-level and row-level security
- **Cross-workspace** — share data between Databricks workspaces
- **Compliance** — audit logs for regulatory requirements

## How It Works

### Step 1: Create Catalog Hierarchy
```sql
-- Create catalogs for environments
CREATE CATALOG IF NOT EXISTS prod_catalog;
CREATE CATALOG IF NOT EXISTS dev_catalog;

-- Create schemas within catalogs
CREATE SCHEMA IF NOT EXISTS prod_catalog.bronze;
CREATE SCHEMA IF NOT EXISTS prod_catalog.silver;
CREATE SCHEMA IF NOT EXISTS prod_catalog.gold;

-- Create managed tables
CREATE TABLE prod_catalog.bronze.raw_events (
  event_id STRING,
  payload STRING,
  ingested_at TIMESTAMP
) USING DELTA;
```

### Step 2: Configure Access Controls
```sql
-- Grant catalog-level access
GRANT USE CATALOG ON CATALOG prod_catalog TO `data-engineers`;
GRANT USE CATALOG ON CATALOG prod_catalog TO `data-analysts`;

-- Grant schema-level access
GRANT USE SCHEMA ON SCHEMA prod_catalog.gold TO `data-analysts`;
GRANT SELECT ON SCHEMA prod_catalog.gold TO `data-analysts`;

-- Engineers get full access to all layers
GRANT ALL PRIVILEGES ON SCHEMA prod_catalog.bronze TO `data-engineers`;
GRANT ALL PRIVILEGES ON SCHEMA prod_catalog.silver TO `data-engineers`;
GRANT ALL PRIVILEGES ON SCHEMA prod_catalog.gold TO `data-engineers`;

-- Restrict specific tables
GRANT SELECT ON TABLE prod_catalog.gold.daily_metrics TO `dashboard-users`;
```

### Step 3: External Locations
```sql
-- Register cloud storage for external tables
CREATE EXTERNAL LOCATION IF NOT EXISTS raw_landing
  URL 's3://my-bucket/raw/'
  WITH (STORAGE CREDENTIAL my_aws_credential);

-- Create external table
CREATE TABLE prod_catalog.bronze.external_events
  LOCATION 's3://my-bucket/raw/events/'
  AS SELECT * FROM ...;
```

### Step 4: Data Lineage and Auditing
```sql
-- Lineage is automatic — Unity Catalog tracks:
-- Which tables read from which sources
-- Which notebooks/jobs modify which tables
-- Column-level lineage through transformations

-- View lineage in the Catalog Explorer UI
-- Or query system tables for programmatic access
SELECT * FROM system.access.audit
WHERE action_name = 'getTable'
AND request_params.full_name_arg LIKE 'prod_catalog.gold%';
```

## Best Practices
- One catalog per environment (dev, staging, prod)
- Three schemas per catalog following medallion (bronze, silver, gold)
- Grant access at schema level, restrict at table level when needed
- Use groups, not individual users, for access grants
- Enable audit logging for compliance-sensitive data
- Tag sensitive columns for data classification

## Common Mistakes
- Granting access to individual users instead of groups
- Not creating separate dev/prod catalogs (risky development)
- Skipping external location setup (can't access cloud storage)
- Not reviewing lineage after pipeline changes
- Missing GRANT USE CATALOG (users can't see anything without it)
