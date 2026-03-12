---
id: supabase-migration-standards
stackId: supabase
type: rule
name: Database Migration Standards
description: >-
  Enforce standards for Supabase database migrations — one concern per
  migration, mandatory RLS, index requirements, naming conventions, and
  deployment safety rules.
difficulty: intermediate
globs:
  - '**/supabase/migrations/*.sql'
tags:
  - migrations
  - database
  - schema
  - standards
  - postgresql
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
  - question: Why should I never modify a deployed Supabase migration?
    answer: >-
      Deployed migrations have already been applied to the production database.
      Modifying them creates drift between your migration history and the actual
      schema. Other developers who have already run the migration will not
      re-run it. Always create a new migration to make changes.
  - question: What should I include in every table creation migration?
    answer: >-
      Every table migration should include: the CREATE TABLE statement with
      constraints, ALTER TABLE ENABLE ROW LEVEL SECURITY, RLS policies for each
      operation, indexes on foreign keys and query columns, and an updated_at
      trigger if the table has mutable records.
relatedItems:
  - supabase-rls-policy-standards
  - supabase-migrations-workflow
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Database Migration Standards

## Rule
All database schema changes MUST go through migration files. One logical change per migration. Never modify deployed migrations.

## Format
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql

-- Description of what this migration does
-- and why it is needed.

CREATE TABLE table_name ( ... );
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
CREATE INDEX ... ;
CREATE POLICY ... ;
```

## Naming Convention
```
YYYYMMDDHHMMSS_action_subject.sql
```
Examples:
- `20260311120000_create_posts_table.sql`
- `20260311130000_add_tags_to_posts.sql`
- `20260311140000_create_comments_table.sql`

## Rules
1. **One concern per migration** — do not mix table creation with unrelated changes
2. **Always enable RLS** on new tables in the same migration
3. **Always add indexes** for foreign keys and commonly queried columns
4. **Never modify deployed migrations** — create new ones instead
5. **Include RLS policies** in the table creation migration
6. **Add comments** explaining the purpose of each migration
7. **Use IF NOT EXISTS / IF EXISTS** for idempotent operations when appropriate
8. **Test locally** with `supabase db reset` before pushing

## Migration Checklist
```
[ ] Table created with appropriate constraints
[ ] RLS enabled
[ ] RLS policies for all operations (SELECT, INSERT, UPDATE, DELETE)
[ ] Indexes on foreign keys
[ ] Indexes on columns used in queries and RLS
[ ] updated_at trigger if applicable
[ ] Tested with supabase db reset
[ ] Tested with supabase db lint
```

## Examples

### Good
```sql
-- Create profiles table with RLS and indexes
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL CHECK (char_length(username) BETWEEN 3 AND 30),
  avatar_url TEXT,
  bio TEXT CHECK (char_length(bio) <= 500),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_username ON profiles(username);

CREATE POLICY "select_profiles_public" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "update_profiles_owner" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### Bad
- Migration that creates 5 unrelated tables
- Table without RLS enabled
- No indexes on foreign keys
- Modifying a migration that was already deployed

## Enforcement
Run `supabase db lint` in CI to catch issues.
Require migration file review in PRs.
Test with `supabase db reset` in CI.
