---
id: database-database-design
stackId: database
type: skill
name: Database Design
description: >-
  > **Learn to THINK, not copy SQL patterns.** **Read ONLY files relevant to
  the request!** Check the content map, find what you need. | File |
  Description | When to Read |
difficulty: beginner
tags:
  - database
  - design
  - performance
  - deployment
  - migration
  - optimization
  - serverless
compatibility:
  - claude-code
faq:
  - question: "When should I use the Database Design skill?"
    answer: >-
      > **Learn to THINK, not copy SQL patterns.** **Read ONLY files relevant
      to the request!** Check the content map, find what you need. | File |
      Description | When to Read | This skill provides a structured workflow
      for schema design, query optimization, migration strategies, and data
      modeling.
  - question: "What tools and setup does Database Design require?"
    answer: >-
      Works with standard Database tooling (SQL clients, ORM tools). No
      special setup required beyond a working database environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Database Design

> **Learn to THINK, not copy SQL patterns.**

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

| File | Description | When to Read |
|------|-------------|--------------|
| `database-selection.md` | PostgreSQL vs Neon vs Turso vs SQLite | Choosing database |
| `orm-selection.md` | Drizzle vs Prisma vs Kysely | Choosing ORM |
| `schema-design.md` | Normalization, PKs, relationships | Designing schema |
| `indexing.md` | Index types, composite indexes | Performance tuning |
| `optimization.md` | N+1, EXPLAIN ANALYZE | Query optimization |
| `migrations.md` | Safe migrations, serverless DBs | Schema changes |

---

## ⚠️ Core Principle

- ASK user for database preferences when unclear
- Choose database/ORM based on CONTEXT
- Don't default to PostgreSQL for everything

---

## Decision Checklist

Before designing schema:

- [ ] Asked user about database preference?
- [ ] Chosen database for THIS context?
- [ ] Considered deployment environment?
- [ ] Planned index strategy?
- [ ] Defined relationship types?

---

## Anti-Patterns

❌ Default to PostgreSQL for simple apps (SQLite may suffice)
❌ Skip indexing
❌ Use SELECT * in production
❌ Store JSON when structured data is better
❌ Ignore N+1 queries

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
