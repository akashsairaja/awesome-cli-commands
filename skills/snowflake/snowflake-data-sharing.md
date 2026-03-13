---
id: snowflake-data-sharing
stackId: snowflake
type: skill
name: >-
  Secure Data Sharing & Marketplace
description: >-
  Share data securely between Snowflake accounts — direct shares, reader
  accounts, data marketplace listings, and row-level security for controlled
  data distribution.
difficulty: intermediate
tags:
  - snowflake
  - secure
  - data
  - sharing
  - marketplace
  - security
  - monitoring
  - prompting
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Secure Data Sharing & Marketplace skill?"
    answer: >-
      Share data securely between Snowflake accounts — direct shares, reader
      accounts, data marketplace listings, and row-level security for
      controlled data distribution. This skill provides a structured workflow
      for development tasks.
  - question: "What tools and setup does Secure Data Sharing & Marketplace require?"
    answer: >-
      Works with standard snowflake tooling (relevant CLI tools and
      frameworks). No special setup required beyond a working snowflake
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Secure Data Sharing & Marketplace

## Overview
Snowflake Secure Data Sharing lets you share live data between accounts without copying. Consumers query shared data in real-time using their own compute, with no data movement or staleness.

## Why This Matters
- **No data copying** — shared data is always current (live query)
- **Instant** — shares are available immediately, no ETL needed
- **Secure** — granular access control with row-level security
- **Cost efficient** — provider pays storage, consumer pays compute

## How It Works

### Step 1: Create a Share (Provider Side)
```sql
-- Create the share
CREATE SHARE analytics_share;

-- Grant access to specific objects
GRANT USAGE ON DATABASE prod TO SHARE analytics_share;
GRANT USAGE ON SCHEMA prod.gold TO SHARE analytics_share;
GRANT SELECT ON TABLE prod.gold.daily_metrics TO SHARE analytics_share;
GRANT SELECT ON TABLE prod.gold.user_segments TO SHARE analytics_share;

-- Add consumer account(s)
ALTER SHARE analytics_share ADD ACCOUNTS = partner_account;
```

### Step 2: Consume Shared Data (Consumer Side)
```sql
-- Create database from share
CREATE DATABASE partner_data FROM SHARE provider_account.analytics_share;

-- Query shared data (uses consumer's warehouse/compute)
SELECT *
FROM partner_data.gold.daily_metrics
WHERE metric_date >= '2026-03-01';
```

### Step 3: Row-Level Security for Filtered Shares
```sql
-- Create a mapping table for row-level access
CREATE TABLE prod.security.share_access (
  consumer_account STRING,
  allowed_region STRING
);

INSERT INTO prod.security.share_access VALUES
  ('partner_a_account', 'US'),
  ('partner_b_account', 'EU');

-- Create secure view with row filter
CREATE OR REPLACE SECURE VIEW prod.gold.shared_metrics AS
SELECT m.*
FROM prod.gold.daily_metrics m
JOIN prod.security.share_access sa
  ON sa.allowed_region = m.region
  AND sa.consumer_account = CURRENT_ACCOUNT();

-- Share the view (not the underlying table)
GRANT SELECT ON VIEW prod.gold.shared_metrics TO SHARE analytics_share;
```

### Step 4: Reader Accounts (for non-Snowflake consumers)
```sql
-- Create reader account for partners without Snowflake
CREATE MANAGED ACCOUNT partner_reader
  ADMIN_NAME = 'partner_admin'
  ADMIN_PASSWORD = 'SecurePassword123!'
  TYPE = READER;

-- Add reader account to share
ALTER SHARE analytics_share ADD ACCOUNTS = partner_reader;
-- Consumer uses the reader account with their own warehouse
```

## Best Practices
- Use SECURE views for row-level access control in shares
- Document what data is shared and with whom (governance)
- Monitor share usage with ACCOUNT_USAGE.DATA_TRANSFER_HISTORY
- Use reader accounts for partners without Snowflake accounts
- Revoke share access promptly when partnerships end

## Common Mistakes
- Sharing base tables instead of secure views (no access control)
- Not monitoring share usage (unknown data exposure)
- Forgetting to revoke access when partnerships end
- Sharing non-secure views (consumers can see view definition)
- No row-level security on multi-tenant shared data
