---
id: supabase-rls-policy-standards
stackId: supabase
type: rule
name: RLS Policy Writing Standards
description: >-
  Enforce standards for Supabase Row Level Security policies — separate policies
  per operation, naming conventions, performance indexing, and mandatory testing
  requirements.
difficulty: intermediate
globs:
  - '**/supabase/migrations/*.sql'
  - '**/supabase/seed.sql'
tags:
  - rls
  - security
  - postgresql
  - policies
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
  - question: Why should I write separate RLS policies for each operation?
    answer: >-
      Separate policies are easier to audit, test, and modify. A combined FOR
      ALL policy hides the access logic for each operation. With separate
      policies, you can clearly see who can SELECT vs INSERT vs UPDATE vs
      DELETE, making security reviews straightforward.
  - question: How do I test Supabase RLS policies?
    answer: >-
      Use the Supabase local development environment (supabase start). Write
      test queries that assume different user contexts using
      set_config('request.jwt.claims', ...). Verify that unauthorized operations
      are rejected and authorized operations succeed. Include these tests in
      your CI pipeline.
relatedItems:
  - supabase-rls-architect
  - supabase-migration-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# RLS Policy Writing Standards

## Rule
Every table MUST have RLS enabled with explicit policies for each operation. Write separate policies for SELECT, INSERT, UPDATE, and DELETE. Never combine operations.

## Format
```sql
CREATE POLICY "descriptive_policy_name"
  ON table_name
  FOR <operation>
  USING (<read_condition>)
  WITH CHECK (<write_condition>);
```

## Naming Convention
```
{action}_{subject}_{scope}
```
Examples:
- `select_posts_public` — Anyone can read published posts
- `insert_posts_authenticated` — Authenticated users can create posts
- `update_posts_owner` — Authors can update their own posts
- `delete_posts_admin` — Admins can delete any post

## Requirements

### Mandatory
1. RLS MUST be enabled on every table: `ALTER TABLE x ENABLE ROW LEVEL SECURITY;`
2. Separate policy for each operation (SELECT, INSERT, UPDATE, DELETE)
3. All columns referenced in policies MUST have indexes
4. Owner checks use `auth.uid() = user_id_column`
5. Role checks use `auth.jwt() ->> 'role'`

### Policy Patterns
```sql
-- Public read
CREATE POLICY "select_posts_public" ON posts
  FOR SELECT USING (published = true);

-- Owner read (including drafts)
CREATE POLICY "select_posts_owner" ON posts
  FOR SELECT USING (auth.uid() = author_id);

-- Authenticated insert with ownership
CREATE POLICY "insert_posts_authenticated" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id
    AND title IS NOT NULL
    AND char_length(title) <= 200
  );

-- Owner update (cannot change author)
CREATE POLICY "update_posts_owner" ON posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Admin delete
CREATE POLICY "delete_posts_admin" ON posts
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

## Examples

### Good
- Separate policies with descriptive names
- Indexes on auth-referenced columns
- Validation in WITH CHECK clauses
- Different access levels per operation

### Bad
```sql
-- Combined operations (hard to audit)
CREATE POLICY "all_access" ON posts
  FOR ALL USING (auth.uid() = author_id);

-- Too permissive
CREATE POLICY "anyone" ON posts
  FOR ALL USING (true) WITH CHECK (true);
```

## Enforcement
Test all policies with Supabase local development.
Include policy tests in CI pipeline.
Review RLS in every migration PR.
