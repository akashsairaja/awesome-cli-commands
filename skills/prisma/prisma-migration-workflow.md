---
id: prisma-migration-workflow
stackId: prisma
type: skill
name: Master Prisma Migrations for Production
description: >-
  Implement a production-safe Prisma migration workflow — creating migrations,
  handling breaking changes with expand-and-contract, seeding, and CI/CD
  deployment.
difficulty: advanced
tags:
  - prisma
  - master
  - migrations
  - production
  - deployment
  - migration
  - ci-cd
  - machine-learning
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Master Prisma Migrations for Production skill?"
    answer: >-
      Implement a production-safe Prisma migration workflow — creating
      migrations, handling breaking changes with expand-and-contract, seeding,
      and CI/CD deployment. This skill provides a structured workflow for
      schema design, migration workflows, query optimization, and database
      seeding.
  - question: "What tools and setup does Master Prisma Migrations for Production require?"
    answer: >-
      Requires pip/poetry, Prisma CLI installed. Works with Prisma projects.
      No additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Master Prisma Migrations for Production

## Overview
Prisma Migrate generates SQL migration files from schema changes. In development, it auto-applies and can reset the database. In production, migrations are applied deliberately with `prisma migrate deploy` as part of your CI/CD pipeline.

## Why This Matters
- **Reproducible** — recreate any database state from migration history
- **Safe** — review SQL before it touches production
- **Reversible** — expand-and-contract pattern for zero-downtime changes
- **Collaborative** — team members share the same migration history

## How It Works

### Step 1: Create a Migration
```bash
# Make changes to schema.prisma, then:
npx prisma migrate dev --name add_posts_table
# Creates: prisma/migrations/20260311_add_posts_table/migration.sql
# Auto-applies to local database
```

### Step 2: Review Generated SQL
```sql
-- prisma/migrations/20260311_add_posts_table/migration.sql
CREATE TABLE "Post" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE;
```

### Step 3: Handle Breaking Changes (Expand-and-Contract)
```bash
# Example: Rename column "name" to "fullName"

# Migration 1: Add new column (expand)
npx prisma migrate dev --name add_full_name_column
```

```sql
-- Migration 1: Add column, copy data
ALTER TABLE "User" ADD COLUMN "fullName" TEXT;
UPDATE "User" SET "fullName" = "name";
ALTER TABLE "User" ALTER COLUMN "fullName" SET NOT NULL;
```

```bash
# Deploy Migration 1, update application code to use fullName
# Migration 2: Remove old column (contract)
npx prisma migrate dev --name remove_name_column
```

```sql
-- Migration 2: Remove old column
ALTER TABLE "User" DROP COLUMN "name";
```

### Step 4: Deploy in CI/CD
```yaml
# GitHub Actions deployment
- name: Run migrations
  run: npx prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Generate Prisma Client
  run: npx prisma generate
```

### Step 5: Seed Data
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
```

```json
// package.json
{ "prisma": { "seed": "ts-node prisma/seed.ts" } }
```

## Best Practices
- Review generated SQL before committing migrations
- Use expand-and-contract for breaking schema changes
- Run `prisma migrate deploy` in CI/CD (not `prisma migrate dev`)
- Use `upsert` in seed files for idempotent seeding
- Back up production database before applying destructive migrations
- Keep migrations small and focused (one change per migration)

## Common Mistakes
- Running `prisma migrate dev` in production (can reset data!)
- Not reviewing generated SQL (may contain destructive operations)
- Renaming columns directly (data loss) instead of expand-and-contract
- Forgetting to run `prisma generate` after schema changes
- Not seeding test data for development environments
