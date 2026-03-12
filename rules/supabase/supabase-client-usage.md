---
id: supabase-client-usage
stackId: supabase
type: rule
name: Supabase Client Usage Standards
description: >-
  Standards for using the Supabase JavaScript client — singleton initialization,
  key management, error handling, and query patterns for safe database access.
difficulty: beginner
globs:
  - '**/lib/supabase*'
  - '**/utils/supabase*'
  - '**/*supabase*.ts'
tags:
  - supabase-client
  - typescript
  - error-handling
  - security
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
  - question: Why should I use a singleton Supabase client?
    answer: >-
      The Supabase client manages WebSocket connections for real-time, auth
      session state, and request headers. Creating multiple instances wastes
      resources and can cause session conflicts. Create one client in a shared
      module and import it everywhere.
  - question: How do I get TypeScript types for my Supabase database?
    answer: >-
      Run 'supabase gen types typescript --project-id your-ref >
      types/supabase.ts' to generate types from your schema. Pass the Database
      type to createClient<Database>() for fully typed queries. Regenerate types
      whenever you create new migrations.
relatedItems:
  - supabase-rls-policy-standards
  - supabase-auth-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Supabase Client Usage Standards

## Rule
Use a singleton Supabase client instance. Never expose the service_role key to the browser. Handle all query errors explicitly.

## Format
```typescript
import { createClient } from '@supabase/supabase-js';

// Client-side: anon key (respects RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side only: service_role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## Rules
1. **Singleton client** — create once, import everywhere
2. **anon key for client** — always use NEXT_PUBLIC_ prefixed key in browser
3. **service_role for server only** — never prefix with NEXT_PUBLIC_
4. **Handle errors** — always check for error in destructured response
5. **Type your queries** — use generated types from Supabase CLI
6. **Select specific columns** — avoid `select('*')` in production

## Error Handling
```typescript
// ALWAYS handle errors explicitly
const { data, error } = await supabase
  .from('posts')
  .select('id, title, content, author_id')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(20);

if (error) {
  console.error('Failed to fetch posts:', error.message);
  throw new Error('Failed to load posts');
}

// data is typed and safe to use
return data;
```

## Generated Types
```bash
# Generate TypeScript types from your database schema
supabase gen types typescript --project-id your-project-ref > types/supabase.ts
```

```typescript
import { Database } from '@/types/supabase';

const supabase = createClient<Database>(url, key);
// Now all queries are fully typed
```

## Examples

### Good
```typescript
const { data, error } = await supabase
  .from('posts')
  .select('id, title, slug, created_at, profiles(username)')
  .eq('published', true)
  .order('created_at', { ascending: false })
  .limit(20);

if (error) throw error;
```

### Bad
```typescript
// No error handling
const { data } = await supabase.from('posts').select('*');

// Service role key in browser code
const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!);

// No type safety
const response = await supabase.from('posts').select();
```

## Enforcement
Lint for NEXT_PUBLIC_*SERVICE_ROLE* patterns.
Require error handling in code reviews.
Generate and commit types as part of migration workflow.
