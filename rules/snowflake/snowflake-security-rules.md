---
id: snowflake-security-rules
stackId: snowflake
type: rule
name: Snowflake Security & RBAC Rules
description: >-
  Security standards for Snowflake — role hierarchy, least-privilege access,
  ACCOUNTADMIN restrictions, network policies, and audit logging for compliant
  data platforms.
difficulty: intermediate
globs:
  - '**/*.sql'
tags:
  - security
  - rbac
  - roles
  - access-control
  - network-policy
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - sql
faq:
  - question: Why should I never use ACCOUNTADMIN for daily Snowflake work?
    answer: >-
      ACCOUNTADMIN has unrestricted access to everything in the account. Using
      it daily violates least privilege, increases accidental damage risk, and
      makes access auditing meaningless. Create custom roles for each job
      function and use ACCOUNTADMIN only for account-level administration.
  - question: How should Snowflake roles be structured?
    answer: >-
      Build a hierarchy: data_reader (SELECT) -> data_analyst (SELECT + views)
      -> data_engineer (full CRUD) -> data_admin (role management) -> SYSADMIN.
      Grant privileges to roles, assign users to roles. Never grant directly to
      individual users.
relatedItems:
  - snowflake-sql-style-rules
  - snowflake-warehouse-rules
  - snowflake-data-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Snowflake Security & RBAC Rules

## Rule
All Snowflake access MUST go through custom roles in a defined hierarchy. ACCOUNTADMIN is for emergency use only. All actions must be auditable.

## Role Hierarchy (Required)
```sql
-- Create custom role hierarchy
CREATE ROLE data_reader;      -- SELECT only
CREATE ROLE data_analyst;     -- SELECT + CREATE VIEW
CREATE ROLE data_engineer;    -- Full CRUD on assigned schemas
CREATE ROLE data_admin;       -- Role management + grants

-- Build hierarchy
GRANT ROLE data_reader TO ROLE data_analyst;
GRANT ROLE data_analyst TO ROLE data_engineer;
GRANT ROLE data_engineer TO ROLE data_admin;
GRANT ROLE data_admin TO ROLE SYSADMIN;

-- Assign users to roles (not ACCOUNTADMIN)
GRANT ROLE data_analyst TO USER analyst_jane;
GRANT ROLE data_engineer TO USER engineer_bob;
```

## ACCOUNTADMIN Restrictions
```
Rule 1: NEVER use ACCOUNTADMIN for daily operations
Rule 2: Maximum 3 users should have ACCOUNTADMIN
Rule 3: ACCOUNTADMIN requires MFA
Rule 4: Log all ACCOUNTADMIN usage
Rule 5: Only use for: account settings, resource monitors, network policies
```

## Access Grant Pattern
```sql
-- Grant access to roles, not users
-- Good
GRANT SELECT ON ALL TABLES IN SCHEMA prod_db.gold TO ROLE data_reader;
GRANT USAGE ON WAREHOUSE analytics_wh TO ROLE data_analyst;
GRANT USAGE ON DATABASE prod_db TO ROLE data_reader;
GRANT USAGE ON SCHEMA prod_db.gold TO ROLE data_reader;

-- Bad — granting directly to users
GRANT SELECT ON TABLE prod_db.gold.metrics TO USER jane;  -- Not maintainable
```

## Network Policies
```sql
-- Restrict access by IP range
CREATE NETWORK POLICY office_only
  ALLOWED_IP_LIST = ('203.0.113.0/24', '198.51.100.0/24')
  BLOCKED_IP_LIST = ();

ALTER ACCOUNT SET NETWORK_POLICY = office_only;
```

## Audit Monitoring
```sql
-- Monitor login history
SELECT *
FROM SNOWFLAKE.ACCOUNT_USAGE.LOGIN_HISTORY
WHERE IS_SUCCESS = 'NO'
ORDER BY EVENT_TIMESTAMP DESC;

-- Monitor privilege grants
SELECT *
FROM SNOWFLAKE.ACCOUNT_USAGE.GRANTS_TO_USERS
WHERE DELETED_ON IS NULL
ORDER BY CREATED_ON DESC;
```

## Anti-Patterns
- Using ACCOUNTADMIN for daily work
- Granting privileges to individual users (use roles)
- No network policy configured (accessible from any IP)
- Sharing ACCOUNTADMIN credentials
- No MFA on privileged accounts
- Not monitoring failed login attempts
