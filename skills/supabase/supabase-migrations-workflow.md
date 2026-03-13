---
id: supabase-migrations-workflow
stackId: supabase
type: skill
name: Manage Database Migrations with Supabase CLI
description: >-
  Master Supabase database migrations — create, test, and deploy schema
  changes with the Supabase CLI, including RLS policies, functions, and seed
  data.
difficulty: advanced
tags:
  - supabase
  - manage
  - database
  - migrations
  - cli
  - security
  - deployment
  - migration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Manage Database Migrations with Supabase CLI skill?"
    answer: >-
      Master Supabase database migrations — create, test, and deploy schema
      changes with the Supabase CLI, including RLS policies, functions, and
      seed data. This skill provides a structured workflow for auth
      configuration, database migrations, real-time subscriptions, and edge
      functions.
  - question: "What tools and setup does Manage Database Migrations with Supabase CLI require?"
    answer: >-
      Requires npm/yarn/pnpm, Docker, Supabase CLI installed. Works with
      Supabase projects. No additional configuration needed beyond standard
      tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Manage Database Migrations with Supabase CLI

## Overview
Supabase CLI provides a migration workflow for managing database schema changes. Migrations are SQL files that track changes over time, enabling version-controlled database evolution with rollback capability.

## Why This Matters
- **Version control** — database schema changes tracked in Git
- **Team collaboration** — everyone runs the same migrations
- **Reproducible** — recreate the database from scratch for any environment
- **Safe deployments** — test migrations locally before applying to production

## How It Works

### Step 1: Initialize Supabase Locally
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize in your project
supabase init

# Start local Supabase (Docker required)
supabase start
```

### Step 2: Create a Migration
```bash
supabase migration new create_posts_table
# Creates: supabase/migrations/20260311120000_create_posts_table.sql
```

```sql
-- supabase/migrations/20260311120000_create_posts_table.sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_published ON posts(published, created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);

-- RLS Policies
CREATE POLICY "Anyone can read published posts"
  ON posts FOR SELECT
  USING (published = true);

CREATE POLICY "Authors can read own drafts"
  ON posts FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = author_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Step 3: Test Locally
```bash
# Apply migration to local database
supabase db reset

# Verify with SQL editor
supabase db lint
```

### Step 4: Seed Data
```sql
-- supabase/seed.sql
INSERT INTO posts (title, content, slug, published, author_id)
VALUES
  ('Hello World', 'First post content', 'hello-world', true, 'user-uuid-here'),
  ('Draft Post', 'Work in progress', 'draft-post', false, 'user-uuid-here');
```

### Step 5: Deploy to Production
```bash
# Link to remote project
supabase link --project-ref your-project-ref

# Push migrations to production
supabase db push

# Verify
supabase migration list
```

## Best Practices
- One logical change per migration file
- Include RLS policies in the same migration as the table
- Always add indexes for columns used in queries and RLS
- Test migrations with `supabase db reset` before pushing
- Use `supabase db lint` to catch issues
- Include seed data for development and testing
- Never modify deployed migrations — create new ones instead

## Common Mistakes
- Editing already-deployed migrations (causes drift)
- Forgetting to enable RLS on new tables
- Missing indexes on foreign keys and query columns
- Not testing migrations locally before pushing to production
- Creating destructive migrations without data backup plan
