---
id: prisma-migration-rules
stackId: prisma
type: rule
name: Migration Safety Rules
description: >-
  Enforce safe Prisma migration practices — review generated SQL,
  expand-and-contract for breaking changes, mandatory backup before destructive
  operations.
difficulty: intermediate
globs:
  - '**/prisma/migrations/**/*.sql'
  - '**/prisma/schema.prisma'
tags:
  - prisma
  - migrations
  - safety
  - database
  - breaking-changes
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
faq:
  - question: What is the expand-and-contract pattern for Prisma migrations?
    answer: >-
      Expand-and-contract is a two-phase migration strategy: (1) Expand — add
      the new column/table alongside the old one, migrate data, and update code
      to write to both. (2) Contract — once all code uses the new column, remove
      the old one. This prevents downtime and data loss.
  - question: How do I add a NOT NULL column to an existing table in Prisma?
    answer: >-
      First add the column as nullable or with a default value. Then create a
      data migration to populate existing rows. Finally, alter the column to NOT
      NULL in a separate migration. Trying to add NOT NULL directly will fail if
      any existing row has a null value.
relatedItems:
  - prisma-migration-workflow
  - prisma-schema-conventions
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Migration Safety Rules

## Rule
All Prisma migrations MUST be reviewed before deployment. Breaking changes MUST use expand-and-contract. Destructive operations MUST have a backup.

## Requirements

### Pre-Deployment Checklist
1. Review generated SQL in migration file
2. Verify indexes are created for new columns used in queries
3. Check for destructive operations (DROP, ALTER TYPE, rename)
4. Ensure migration is tested locally with `prisma migrate dev`
5. Run `prisma migrate deploy` in CI staging before production

### Breaking Changes
```
Phase 1 (Expand):
  - Add new column/table
  - Copy/transform data
  - Deploy application reading from both old and new

Phase 2 (Contract):
  - Deploy application using only new column/table
  - Remove old column/table in separate migration
```

### Destructive Operations Requiring Backup
| Operation | Risk | Mitigation |
|-----------|------|-----------|
| DROP TABLE | Data loss | Backup table, verify no references |
| DROP COLUMN | Data loss | Expand-and-contract |
| ALTER TYPE | Data truncation | Add new column, migrate, drop old |
| Rename column | App breaks | Expand-and-contract |
| Add NOT NULL | Fails on existing nulls | Default value or data migration |

### Safe vs Unsafe Operations
```
SAFE (apply directly):
  - CREATE TABLE
  - ADD COLUMN (nullable or with default)
  - CREATE INDEX
  - ADD CONSTRAINT (if data complies)

UNSAFE (needs expand-and-contract):
  - DROP TABLE
  - DROP COLUMN
  - RENAME COLUMN
  - CHANGE COLUMN TYPE
  - ADD NOT NULL to existing column
```

## Examples

### Good
- Adding a nullable column with a migration
- Using expand-and-contract for column rename
- Creating a backup before dropping a table

### Bad
- Dropping a column without verifying no code references it
- Renaming a column directly (breaks running application)
- Adding NOT NULL without a default value (fails if existing nulls)

## Enforcement
Require PR review for all migration files.
Run migrations in staging environment before production.
Maintain database backup schedule independent of migrations.
