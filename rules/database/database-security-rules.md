---
id: database-security-rules
stackId: database
type: rule
name: Database Security Standards
description: >-
  Enforce database security — least-privilege access, parameterized queries,
  encrypted connections, secret management, and audit logging for production
  database deployments.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.py'
  - '**/*.java'
  - '**/*.sql'
  - '**/.env*'
tags:
  - security
  - least-privilege
  - sql-injection
  - encryption
  - credentials
  - database
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
  - question: What is the principle of least privilege for database access?
    answer: >-
      Each application or user gets only the minimum permissions needed. A
      read-only reporting service gets SELECT only. A web application gets
      SELECT, INSERT, UPDATE, DELETE but never CREATE TABLE, DROP, or superuser
      access. This limits the blast radius of a compromised credential.
  - question: How do parameterized queries prevent SQL injection?
    answer: >-
      Parameterized queries separate the SQL structure from user data. The
      database engine compiles the SQL template first, then inserts parameter
      values as literal data — never as executable SQL. Even if a parameter
      contains malicious SQL ('; DROP TABLE users;), it is treated as a string
      value, not a command.
relatedItems:
  - database-schema-standards
  - postgresql-query-safety
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Database Security Standards

## Rule
All database access MUST use least-privilege roles, parameterized queries, encrypted connections, and externalized credentials.

## Format
Every application connects with a role that has only the permissions it needs. Every query uses parameterized statements.

## Requirements

### 1. Least-Privilege Database Roles
```sql
-- Create role with minimum required permissions
CREATE ROLE app_reader;
GRANT CONNECT ON DATABASE myapp TO app_reader;
GRANT USAGE ON SCHEMA public TO app_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_reader;

CREATE ROLE app_writer;
GRANT CONNECT ON DATABASE myapp TO app_writer;
GRANT USAGE ON SCHEMA public TO app_writer;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_writer;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_writer;

-- Application uses app_writer; reporting tools use app_reader
-- NEVER use superuser/postgres role for application connections
```

### 2. Parameterized Queries Everywhere
```typescript
// BAD: SQL injection vulnerable
const query = `SELECT * FROM users WHERE email = '${userInput}'`;

// GOOD: Parameterized
const result = await pool.query(
  "SELECT id, email, name FROM users WHERE email = $1",
  [userInput]
);

// GOOD: ORM with parameter binding
const user = await prisma.user.findUnique({
  where: { email: userInput },
});
```

### 3. Encrypted Connections (TLS)
```typescript
// Always use SSL/TLS for database connections
const pool = new Pool({
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("/path/to/ca-cert.pem"),
  },
});

// Or via connection string
// postgresql://user:pass@host:5432/db?sslmode=verify-full
```

### 4. Externalize Credentials
```bash
# NEVER hardcode credentials in source code
# Use environment variables or secret management

# Environment variables
DATABASE_URL=postgresql://user:pass@host:5432/db

# Better: Use a secret manager
# AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager
```

### 5. Audit Logging
```sql
-- Enable query logging for sensitive tables
ALTER TABLE users SET (log_statement = 'all');

-- Or use pg_audit extension for comprehensive audit
CREATE EXTENSION pgaudit;
SET pgaudit.log = 'write';
SET pgaudit.log_relation = on;
```

## Anti-Patterns
- Using superuser credentials for application connections
- String concatenation in SQL queries (SQL injection)
- Database credentials in source code or config files
- Unencrypted connections to remote databases
- No audit trail for data modifications
- Granting ALL PRIVILEGES to application roles

## Enforcement
Use CI checks to scan for hardcoded connection strings. Require TLS for all non-localhost connections. Audit role permissions quarterly.
