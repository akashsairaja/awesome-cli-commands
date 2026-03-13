---
id: postgresql-postgres-best-practices
stackId: postgresql
type: skill
name: Postgres Best Practices
description: >-
  Postgres performance optimization and best practices from Supabase.
difficulty: beginner
tags:
  - postgresql
  - postgres
  - best
  - practices
  - performance
  - security
  - optimization
  - monitoring
compatibility:
  - claude-code
faq:
  - question: "When should I use the Postgres Best Practices skill?"
    answer: >-
      Postgres performance optimization and best practices from Supabase. This
      skill provides a structured workflow for query optimization, index
      strategy, connection pooling, and migration safety.
  - question: "What tools and setup does Postgres Best Practices require?"
    answer: >-
      Works with standard PostgreSQL tooling (psql, pg_dump). Review the setup
      section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Supabase Postgres Best Practices

Comprehensive performance optimization guide for Postgres, maintained by Supabase. Contains rules across 8 categories, prioritized by impact to guide automated query optimization and schema design.

## When to Apply

Reference these guidelines when:
- Writing SQL queries or designing schemas
- Implementing indexes or query optimization
- Reviewing database performance issues
- Configuring connection pooling or scaling
- Optimizing for Postgres-specific features
- Working with Row-Level Security (RLS)

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Query Performance | CRITICAL | `query-` |
| 2 | Connection Management | CRITICAL | `conn-` |
| 3 | Security & RLS | CRITICAL | `security-` |
| 4 | Schema Design | HIGH | `schema-` |
| 5 | Concurrency & Locking | MEDIUM-HIGH | `lock-` |
| 6 | Data Access Patterns | MEDIUM | `data-` |
| 7 | Monitoring & Diagnostics | LOW-MEDIUM | `monitor-` |
| 8 | Advanced Features | LOW | `advanced-` |

## How to Use

Read individual rule files for detailed explanations and SQL examples:

```
rules/query-missing-indexes.md
rules/schema-partial-indexes.md
rules/_sections.md
```

Each rule file contains:
- Brief explanation of why it matters
- Incorrect SQL example with explanation
- Correct SQL example with explanation
- Optional EXPLAIN output or metrics
- Additional context and references
- Supabase-specific notes (when applicable)

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
