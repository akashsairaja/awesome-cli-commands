---
id: prisma-seeding-setup
stackId: prisma
type: skill
name: Set Up Prisma Database Seeding
description: >-
  Create idempotent database seed scripts with Prisma — development data, test
  fixtures, production reference data, and factory patterns for realistic test
  data.
difficulty: beginner
tags:
  - prisma
  - set
  - database
  - seeding
  - testing
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Set Up Prisma Database Seeding skill?"
    answer: >-
      Create idempotent database seed scripts with Prisma — development data,
      test fixtures, production reference data, and factory patterns for
      realistic test data. This skill provides a structured workflow for
      schema design, migration workflows, query optimization, and database
      seeding.
  - question: "What tools and setup does Set Up Prisma Database Seeding require?"
    answer: >-
      Works with standard Prisma tooling (Prisma CLI, Prisma Studio). Review
      the setup section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Set Up Prisma Database Seeding

## Overview
Database seeding populates your database with initial data for development, testing, or production reference data. Prisma runs seed scripts automatically after `prisma migrate dev` and on demand with `prisma db seed`.

## Why This Matters
- **Development** — start coding with realistic data immediately
- **Testing** — consistent test fixtures for reliable tests
- **Onboarding** — new developers get a populated database instantly
- **Production** — seed reference data (categories, roles, settings)

## How It Works

### Step 1: Configure Seed Script
```json
// package.json
{
  "prisma": {
    "seed": "npx tsx prisma/seed.ts"
  }
}
```

### Step 2: Create Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed roles / reference data (idempotent with upsert)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: Role.ADMIN,
      password: await hashPassword('admin123'),
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      role: Role.USER,
      password: await hashPassword('user123'),
    },
  });

  // Seed sample posts
  const posts = [
    { title: 'Getting Started with Prisma', slug: 'getting-started-prisma', published: true },
    { title: 'Advanced Query Patterns', slug: 'advanced-queries', published: true },
    { title: 'Draft Post', slug: 'draft-post', published: false },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        content: `Content for ${post.title}. This is seeded data.`,
        authorId: admin.id,
      },
    });
  }

  console.log('Seeding complete.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Seeding failed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
```

### Step 3: Factory Pattern for Test Data
```typescript
// prisma/factories.ts
import { PrismaClient, Prisma } from '@prisma/client';

export function createUserFactory(overrides: Partial<Prisma.UserCreateInput> = {}) {
  const id = Math.random().toString(36).slice(2);
  return {
    email: `user-${id}@test.com`,
    name: `Test User ${id}`,
    role: 'USER' as const,
    ...overrides,
  };
}

export function createPostFactory(
  authorId: string,
  overrides: Partial<Prisma.PostCreateInput> = {}
) {
  const id = Math.random().toString(36).slice(2);
  return {
    title: `Test Post ${id}`,
    content: `This is test content for post ${id}`,
    slug: `test-post-${id}`,
    published: true,
    author: { connect: { id: authorId } },
    ...overrides,
  };
}
```

### Step 4: Run Seed
```bash
# Run seed manually
npx prisma db seed

# Seed runs automatically after:
npx prisma migrate dev
npx prisma migrate reset
```

## Best Practices
- Use `upsert` for idempotent seeding (safe to run multiple times)
- Separate development seed data from production reference data
- Use factories for generating test data in test suites
- Always handle disconnection in finally/catch blocks
- Never seed production credentials — use environment-specific seed files
- Keep seed data realistic to catch edge cases early

## Common Mistakes
- Using `create` instead of `upsert` (fails on re-run)
- Seeding real passwords or API keys
- Not disconnecting PrismaClient after seeding
- Seed script with hardcoded IDs (conflicts with auto-generated IDs)
- Missing the prisma.seed config in package.json
