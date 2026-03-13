---
id: database-migration-patterns
stackId: database
type: skill
name: >-
  Database Migration Patterns & Tools
description: >-
  Implement version-controlled database migrations — tool selection (Prisma,
  Knex, Flyway, Alembic), migration file structure, rollback strategies, and
  CI/CD integration for safe schema evolution.
difficulty: advanced
tags:
  - database
  - migration
  - patterns
  - tools
  - deployment
  - ci-cd
  - machine-learning
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Database Migration Patterns & Tools skill?"
    answer: >-
      Implement version-controlled database migrations — tool selection
      (Prisma, Knex, Flyway, Alembic), migration file structure, rollback
      strategies, and CI/CD integration for safe schema evolution. This skill
      provides a structured workflow for schema design, query optimization,
      migration strategies, and data modeling.
  - question: "What tools and setup does Database Migration Patterns & Tools require?"
    answer: >-
      Requires pip/poetry, Prisma CLI installed. Works with Database projects.
      No additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
