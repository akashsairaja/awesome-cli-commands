---
id: database-migration-patterns
stackId: database
type: skill
name: Database Migration Patterns & Tools
description: >-
  Implement version-controlled database migrations — tool selection (Prisma,
  Knex, Flyway, Alembic), migration file structure, rollback strategies, and
  CI/CD integration for safe schema evolution.
difficulty: intermediate
tags:
  - migrations
  - prisma
  - knex
  - flyway
  - alembic
  - schema-evolution
  - database
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - sql
  - typescript
  - python
  - java
prerequisites:
  - Basic SQL
  - Familiarity with one migration tool
faq:
  - question: What is a database migration?
    answer: >-
      A database migration is a version-controlled script that changes the
      database schema (create tables, add columns, modify indexes). Migrations
      run sequentially, each building on the previous state. They ensure every
      environment has the same schema and enable rollbacks. Think of them as Git
      for your database schema.
  - question: Which database migration tool should I use?
    answer: >-
      Use Prisma for TypeScript/Node.js projects (best DX, type-safe). Use Knex
      for JavaScript with more manual control. Use Flyway for Java/JVM projects
      (SQL-first approach). Use Alembic for Python/SQLAlchemy. Use
      golang-migrate for Go projects. Choose based on your tech stack and
      preference for SQL-first vs ORM-driven migrations.
  - question: Should I ever edit an applied migration?
    answer: >-
      Never. Once a migration has been applied to any environment, it is
      immutable. If you need to change something, create a new migration that
      modifies the schema. Editing applied migrations causes schema drift — your
      development database will differ from production, leading to deployment
      failures.
relatedItems:
  - database-design-architect
  - database-orm-best-practices
  - postgresql-migration-safety
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Database Migration Patterns & Tools

## Overview
Database migrations are version-controlled scripts that evolve your schema over time. They ensure every environment (dev, staging, production) has the same schema, enable rollbacks, and integrate with CI/CD pipelines.

## Why This Matters
- Without migrations, schema changes are manual and error-prone
- Migrations create a versioned history of every schema change
- Rollback capability is essential for production incident recovery

## Migration Tools by Ecosystem

### Step 1: Prisma (TypeScript/Node.js)
```bash
# Define schema in prisma/schema.prisma
# Generate migration from schema diff
npx prisma migrate dev --name add_user_roles

# Apply migrations to production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### Step 2: Knex (JavaScript/TypeScript)
```bash
# Create migration file
npx knex migrate:make add_user_roles

# Run migrations
npx knex migrate:latest

# Rollback last batch
npx knex migrate:rollback
```

```typescript
// migrations/20250301_add_user_roles.ts
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.enum("role", ["user", "admin"]).defaultTo("user").notNullable();
    table.index(["role"], "idx_users_role");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropIndex(["role"], "idx_users_role");
    table.dropColumn("role");
  });
}
```

### Step 3: Flyway (Java/JVM)
```sql
-- V001__create_users_table.sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- V002__add_user_roles.sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'user';
CREATE INDEX idx_users_role ON users (role);
```

### Step 4: Alembic (Python/SQLAlchemy)
```bash
# Generate migration from model changes
alembic revision --autogenerate -m "add user roles"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

### Step 5: CI/CD Integration
```yaml
# GitHub Actions — run migrations before deployment
- name: Run database migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

# Verify no pending migrations in CI
- name: Check migration status
  run: npx prisma migrate status
```

## Best Practices
- One migration per logical change (don't combine unrelated changes)
- Always write down/rollback migrations
- Use timestamps in migration filenames for ordering
- Test migrations on production-size data before deploying
- Never edit a migration that has been applied to any environment
- Separate schema migrations from data migrations
- Run migrations in CI to catch issues before production

## Common Mistakes
- Editing applied migrations (creates schema drift between environments)
- No rollback scripts (cannot recover from bad migration)
- Running destructive migrations (DROP) without backup verification
- Not testing migrations on large datasets (works on dev, fails on prod)
- Mixing schema and data changes in one migration file
