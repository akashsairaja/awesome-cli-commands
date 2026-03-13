---
id: supabase-rls-architect
stackId: supabase
type: agent
name: Supabase RLS Policy Architect
description: >-
  Expert AI agent for designing Supabase Row Level Security policies —
  role-based access, column-level security, policy composition, and performance
  optimization for PostgreSQL RLS.
difficulty: advanced
tags:
  - supabase
  - rls
  - row-level-security
  - postgresql
  - access-control
  - multi-tenant
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Supabase project
  - Basic PostgreSQL knowledge
  - Understanding of JWT authentication
faq:
  - question: What is Row Level Security (RLS) in Supabase?
    answer: >-
      RLS is a PostgreSQL feature that restricts which rows a user can access.
      In Supabase, RLS policies use the authenticated user's JWT token
      (auth.uid(), auth.jwt()) to enforce access control at the database level.
      Every query is automatically filtered by these policies, making them
      impossible to bypass from client code.
  - question: Why should I use RLS instead of API-level authorization?
    answer: >-
      RLS enforces access control at the database level, so even direct SQL
      access or compromised API endpoints cannot bypass security. It is the
      strongest form of authorization because the database itself refuses to
      return unauthorized data. API-level auth is an additional layer, not a
      replacement.
  - question: How do I optimize slow RLS policies in Supabase?
    answer: >-
      Index all columns referenced in RLS policy expressions (especially
      user_id, org_id). Wrap auth function calls in (select auth.uid()) to
      enable per-statement caching. Avoid subqueries — use JOINs or
      materialized views instead. Keep policies simple with one concern per
      policy. Use EXPLAIN ANALYZE to identify policy-related performance issues.
relatedItems:
  - supabase-edge-functions
  - supabase-migrations-workflow
  - supabase-auth-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Supabase RLS Policy Architect

Row Level Security is what makes Supabase's direct-from-client architecture secure. Without it, anyone with the anon key can read every row in every table. With well-designed RLS, the database itself becomes the authorization layer — no middleware needed, no API endpoints to misconfigure, no authorization logic scattered across services. This agent designs RLS policies that are secure by default, performant at scale, and maintainable as your data model evolves.

## RLS Fundamentals: USING vs WITH CHECK

Every RLS policy has two clauses that serve different purposes:

- **USING** controls which existing rows a user can see (applied to SELECT, UPDATE, DELETE).
- **WITH CHECK** controls which new or modified rows a user can create (applied to INSERT, UPDATE).

A common mistake is conflating the two. An UPDATE policy needs both: USING determines which rows the user can attempt to modify, and WITH CHECK ensures the modified row still satisfies the policy (preventing a user from reassigning a row to another user):

```sql
-- Users can only update their own rows, and cannot change the owner
create policy "Users update own rows"
  on documents for update
  using ( user_id = (select auth.uid()) )
  with check ( user_id = (select auth.uid()) );
```

Without the WITH CHECK clause on UPDATE, a user could change `user_id` to another user's ID, effectively transferring ownership and creating a privilege escalation.

## The auth.uid() Caching Pattern

Supabase's `auth.uid()` function extracts the user ID from the JWT on every row evaluation. On a table with 100,000 rows, that function call happens 100,000 times per query. Wrapping it in a subselect tells PostgreSQL to evaluate it once and cache the result:

```sql
-- SLOW: auth.uid() called per row
create policy "slow_policy" on documents for select
  using ( user_id = auth.uid() );

-- FAST: auth.uid() evaluated once via initPlan caching
create policy "fast_policy" on documents for select
  using ( user_id = (select auth.uid()) );
```

This pattern applies to all auth functions: `auth.uid()`, `auth.jwt()`, `auth.role()`. Always wrap them in `(select ...)` in production policies. The performance difference grows linearly with table size — on large tables, this single change can turn 3-second queries into 2ms responses.

## User Ownership Policies

The most common RLS pattern. Every row has a `user_id` column linking it to its owner:

```sql
-- Enable RLS (Supabase enables this by default on new tables)
alter table documents enable row level security;

-- Separate policies for each operation
create policy "Users read own documents"
  on documents for select
  using ( user_id = (select auth.uid()) );

create policy "Users create own documents"
  on documents for insert
  with check ( user_id = (select auth.uid()) );

create policy "Users update own documents"
  on documents for update
  using ( user_id = (select auth.uid()) )
  with check ( user_id = (select auth.uid()) );

create policy "Users delete own documents"
  on documents for delete
  using ( user_id = (select auth.uid()) );
```

Always write separate policies per operation. A combined policy is harder to audit, harder to debug, and harder to modify when requirements change (e.g., allowing read but not delete).

## Multi-Tenant Organization Policies

SaaS applications need organization-scoped access where users see all data belonging to their org, not just their own. This requires a membership lookup:

```sql
-- Create a helper function for org membership (SECURITY DEFINER for performance)
create or replace function public.get_user_org_ids()
returns setof uuid
language sql
security definer
set search_path = ''
stable
as $$
  select org_id from public.org_members
  where user_id = (select auth.uid())
    and status = 'active'
$$;

-- Policy using the helper
create policy "Org members read org data"
  on projects for select
  using ( org_id in (select public.get_user_org_ids()) );
```

The `SECURITY DEFINER` function runs with the function owner's privileges, bypassing RLS on the `org_members` table itself. This avoids circular RLS dependencies (where the membership table's RLS would need to check membership, creating infinite recursion). Always set `search_path = ''` on SECURITY DEFINER functions to prevent search path injection attacks.

## Role-Based Access Control via JWT Claims

For granular permissions, embed roles in the JWT via Supabase custom claims or app_metadata:

```sql
-- Admin users can read all data
create policy "Admins read all"
  on documents for select
  using (
    (select auth.jwt() ->> 'role') = 'admin'
    or
    (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Role hierarchy: managers can update team members' data
create policy "Managers update team data"
  on tasks for update
  using (
    user_id = (select auth.uid())
    or
    exists (
      select 1 from team_members
      where team_members.manager_id = (select auth.uid())
        and team_members.user_id = tasks.user_id
    )
  );
```

For complex role hierarchies, store roles in a database table rather than JWT claims. JWTs are minted at login and not updated until refresh — a role change in the database would not take effect until the next token refresh.

## Storage RLS for File Access Control

Supabase Storage uses the same RLS engine. Policies on the `storage.objects` table control file uploads, downloads, and deletions:

```sql
-- Users can upload to their own folder
create policy "Users upload own files"
  on storage.objects for insert
  with check (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users can read their own files
create policy "Users read own files"
  on storage.objects for select
  using (
    bucket_id = 'user-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Public bucket: anyone can read, only authenticated users can upload
create policy "Public read"
  on storage.objects for select
  using ( bucket_id = 'public-assets' );

create policy "Authenticated upload to public"
  on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and (select auth.role()) = 'authenticated'
  );
```

## Performance Optimization

RLS policies are evaluated for every row in the result set. Poor policy design turns simple queries into full table scans.

**Index every column referenced in policies.** The most critical optimization. If your policy checks `user_id = (select auth.uid())`, there must be an index on `user_id`:

```sql
create index idx_documents_user_id on documents(user_id);
create index idx_projects_org_id on projects(org_id);
create index idx_org_members_user_org on org_members(user_id, org_id);
```

**Use EXPLAIN ANALYZE to verify.** Run queries with `set role authenticated; set request.jwt.claims = '{"sub":"..."}';` in the SQL editor to simulate an authenticated user, then check the query plan:

```sql
-- Simulate an authenticated request
set role authenticated;
set request.jwt.claims = '{"sub": "d0e9a1b2-..."}';

explain analyze select * from documents where title like '%report%';
-- Check for Seq Scan on documents — indicates missing index
-- Policy should trigger Index Scan on user_id
```

**Avoid nested subqueries in policies.** Each subquery can trigger its own RLS evaluation, creating cascading performance problems. Extract complex lookups into `SECURITY DEFINER` helper functions that bypass RLS:

```sql
-- BAD: Nested subquery that triggers RLS on org_members
create policy "bad_policy" on projects for select
  using (
    org_id in (
      select org_id from org_members where user_id = (select auth.uid())
    )
  );

-- GOOD: Helper function that bypasses RLS on org_members
create policy "good_policy" on projects for select
  using ( org_id in (select public.get_user_org_ids()) );
```

## Common Security Pitfalls

**Forgetting RLS on new tables.** Every table accessible from the client must have RLS enabled. A table without RLS exposes all data to anyone with the anon key. Supabase Dashboard warns about this, but CI/CD migrations can skip the check.

**Using service_role key from client code.** The service_role key bypasses all RLS. It must never appear in client-side code, environment variables accessible to the browser, or public repositories.

**Permissive policies that stack.** PostgreSQL RLS policies are OR'd together by default (permissive mode). If you have one policy that grants access to own rows and another that grants access to public rows, a user gets both. Use `RESTRICTIVE` policies when you need AND logic:

```sql
-- This policy RESTRICTS (AND) rather than permits (OR)
create policy "Must be active user"
  on documents for select
  as restrictive
  using (
    exists (
      select 1 from profiles
      where profiles.id = (select auth.uid())
        and profiles.is_active = true
    )
  );
```

Restrictive policies act as mandatory filters that must all pass in addition to at least one permissive policy passing. Use them for global constraints like "user account must be active" or "subscription must not be expired."
