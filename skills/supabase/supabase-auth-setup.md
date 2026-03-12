---
id: supabase-auth-setup
stackId: supabase
type: skill
name: Implement Supabase Auth with RLS Integration
description: >-
  Set up Supabase Authentication with multiple providers, session management,
  and Row Level Security integration for end-to-end authorization.
difficulty: intermediate
tags:
  - authentication
  - supabase-auth
  - rls
  - oauth
  - session-management
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Supabase project
  - React/Next.js application
faq:
  - question: How does Supabase Auth integrate with Row Level Security?
    answer: >-
      When a user authenticates, Supabase includes their JWT token with every
      database request. RLS policies access this token via auth.uid() (user ID)
      and auth.jwt() (full claims). The database automatically filters rows
      based on these policies, creating end-to-end authorization without
      middleware.
  - question: Should I use the anon key or service_role key in my app?
    answer: >-
      Use the anon key on the client — it respects RLS policies and limits
      access based on the authenticated user. The service_role key bypasses ALL
      RLS and should ONLY be used in secure server-side code (Edge Functions,
      API routes). Never expose the service_role key to the browser.
  - question: How do I add custom user data beyond what Supabase Auth stores?
    answer: >-
      Create a 'profiles' table linked to auth.users via a foreign key on user
      ID. Use a database trigger or auth hook to create a profile automatically
      when a user signs up. Store additional data (avatar, bio, preferences) in
      this profiles table with RLS policies.
relatedItems:
  - supabase-rls-architect
  - supabase-migrations-workflow
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Implement Supabase Auth with RLS Integration

## Overview
Supabase Auth provides authentication that integrates directly with PostgreSQL Row Level Security. When a user authenticates, their JWT token is automatically available in RLS policies via auth.uid() and auth.jwt(), creating a seamless auth-to-database security chain.

## Why This Matters
- **Database-level security** — auth tokens enforced in RLS policies
- **Multiple providers** — email, Google, GitHub, Apple, phone
- **Session management** — automatic token refresh and session persistence
- **Zero middleware** — client talks directly to database with auth context

## How It Works

### Step 1: Initialize Supabase Client
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Step 2: Implement Auth Flows
```typescript
// Email/password sign-up
async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

// OAuth sign-in (Google)
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}

// Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
```

### Step 3: Auth State Listener
```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}
```

### Step 4: RLS Policies Using Auth
```sql
-- Users can only read their own profile
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Anyone can read published posts
CREATE POLICY "Public read published posts"
  ON posts FOR SELECT
  USING (published = true OR auth.uid() = author_id);
```

### Step 5: Auth Callback Handler (Next.js)
```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(requestUrl.origin);
}
```

## Best Practices
- Always use onAuthStateChange for reactive auth state
- Configure email templates in Supabase dashboard
- Enable email confirmation for production
- Use auth.uid() in RLS policies for ownership checks
- Handle auth errors gracefully with user-friendly messages
- Use Supabase Auth Helpers for framework-specific integration

## Common Mistakes
- Not handling auth state changes reactively (stale UI)
- Forgetting to set up the auth callback route for OAuth
- Using the service_role key on the client (bypasses RLS!)
- Not enabling email confirmation in production
- Storing user data only in auth.users (use a profiles table)
