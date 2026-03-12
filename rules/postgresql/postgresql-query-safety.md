---
id: postgresql-query-safety
stackId: postgresql
type: rule
name: PostgreSQL Query Safety Rules
description: >-
  Prevent dangerous PostgreSQL operations — no UPDATE/DELETE without WHERE, no
  SELECT *, mandatory LIMIT on exploratory queries, and parameterized queries to
  prevent SQL injection.
difficulty: beginner
globs:
  - '**/*.sql'
  - '**/*.ts'
  - '**/*.py'
  - '**/*.go'
  - '**/*.rs'
tags:
  - query-safety
  - sql-injection
  - parameterized-queries
  - transactions
  - postgresql
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
languages:
  - sql
  - typescript
  - python
faq:
  - question: Why should I avoid SELECT * in PostgreSQL application queries?
    answer: >-
      SELECT * returns all columns, which wastes bandwidth, prevents index-only
      scans, and breaks when columns are added or removed. Explicit column lists
      are self-documenting, stable across schema changes, and enable PostgreSQL
      to use covering indexes for maximum performance.
  - question: How do parameterized queries prevent SQL injection?
    answer: >-
      Parameterized queries send the SQL template and values separately to
      PostgreSQL. The database engine treats parameters as literal values, never
      as SQL code. Even if a parameter contains malicious SQL like "'; DROP
      TABLE users; --", it is treated as a string value, not executed.
relatedItems:
  - postgresql-naming-conventions
  - postgresql-migration-safety
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PostgreSQL Query Safety Rules

## Rule
All queries MUST follow safety patterns to prevent data loss, performance degradation, and security vulnerabilities.

## Format
Every data-modifying query must include a WHERE clause. Every application query must use parameterized statements.

## Requirements

### 1. Never UPDATE/DELETE Without WHERE
```sql
-- DANGEROUS: Updates every row in the table
UPDATE users SET status = 'inactive';

-- SAFE: Explicit WHERE clause
UPDATE users SET status = 'inactive' WHERE last_login < now() - interval '1 year';

-- SAFEST: Verify with SELECT first, then use CTE
WITH to_deactivate AS (
  SELECT id FROM users WHERE last_login < now() - interval '1 year'
)
UPDATE users SET status = 'inactive' WHERE id IN (SELECT id FROM to_deactivate);
```

### 2. No SELECT * in Application Code
```sql
-- BAD: Returns all columns, breaks when schema changes
SELECT * FROM users;

-- GOOD: Explicit columns — self-documenting, stable
SELECT id, email, name, status FROM users WHERE id = $1;
```

### 3. Always Use Parameterized Queries
```sql
-- DANGEROUS: SQL injection vulnerable
query = f"SELECT * FROM users WHERE email = '{user_input}'"

-- SAFE: Parameterized
query = "SELECT id, email, name FROM users WHERE email = $1"
-- Pass user_input as parameter
```

### 4. Use LIMIT on Exploratory Queries
```sql
-- DANGEROUS: Could return 100M rows
SELECT id, email FROM users WHERE status = 'active';

-- SAFE: Bounded result set
SELECT id, email FROM users WHERE status = 'active' LIMIT 100;
```

### 5. Wrap Multi-Statement Changes in Transactions
```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- If anything fails, ROLLBACK undoes both changes
```

## Anti-Patterns
- Using string concatenation to build SQL queries
- Running DELETE without first counting affected rows
- Using TRUNCATE instead of DELETE when you need to preserve triggers/logs
- Not using transactions for multi-step operations

## Enforcement
Use pg_stat_statements to monitor for queries without WHERE clauses. Configure statement_timeout to kill runaway queries.
