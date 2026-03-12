---
id: prisma-schema-conventions
stackId: prisma
type: rule
name: Prisma Schema Conventions
description: >-
  Enforce consistent Prisma schema patterns — naming conventions, required
  fields, index requirements, relation definitions, and model organization
  standards.
difficulty: beginner
globs:
  - '**/prisma/schema.prisma'
  - '**/prisma/schema/*.prisma'
tags:
  - prisma
  - schema
  - naming-conventions
  - indexes
  - standards
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
  - question: Why should every Prisma model have createdAt and updatedAt?
    answer: >-
      createdAt and updatedAt provide essential audit information for debugging,
      analytics, and data management. @default(now()) auto-sets creation time,
      and @updatedAt automatically updates on every modification. They are
      virtually zero-cost and invaluable for production operations.
  - question: Why must foreign key columns have indexes in Prisma?
    answer: >-
      Without an index, queries that filter or join on a foreign key require a
      full table scan. Prisma does not auto-create indexes on relation fields.
      Add @@index([foreignKeyField]) to every relation to ensure JOIN and WHERE
      queries perform well as data grows.
relatedItems:
  - prisma-schema-architect
  - prisma-query-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Prisma Schema Conventions

## Rule
All Prisma schema models MUST follow consistent naming, include standard fields, define proper relations, and have appropriate indexes.

## Format
```prisma
model ModelName {
  id        String   @id @default(cuid())
  // ... model fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId String

  // Indexes
  @@index([authorId])
  @@index([createdAt])
}
```

## Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Model | PascalCase singular | `User`, `BlogPost` |
| Field | camelCase | `firstName`, `createdAt` |
| Enum | PascalCase | `Role`, `PostStatus` |
| Enum value | SCREAMING_SNAKE | `ADMIN`, `DRAFT` |
| Relation field | camelCase singular/plural | `author`, `posts` |
| Foreign key | camelCase + Id | `authorId`, `categoryId` |

## Required Fields (Every Model)
```prisma
id        String   @id @default(cuid())
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

## Relation Rules
```prisma
// ALWAYS define both sides
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId String
  @@index([authorId])
}
```

## Index Requirements
1. ALL foreign key columns MUST have @@index
2. Columns used in WHERE clauses SHOULD have @@index
3. Columns used in ORDER BY SHOULD have @@index
4. Unique constraints create implicit indexes
5. Composite indexes for multi-column queries

## Examples

### Good
```prisma
model Post {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  content     String
  published   Boolean    @default(false)
  author      User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId    String
  tags        Tag[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([authorId])
  @@index([published, createdAt(sort: Desc)])
}
```

### Bad
```prisma
model post {                    // Wrong: lowercase
  id        Int    @id @default(autoincrement())
  Title     String              // Wrong: PascalCase field
  author_id String              // Wrong: snake_case
  // Missing createdAt, updatedAt
  // Missing @@index on author_id
  // Missing relation definition
}
```

## Enforcement
Use prisma format to auto-format schema files.
Review schema changes in PRs with attention to naming and indexes.
