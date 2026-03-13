---
id: nextjs-nextjs-supabase-auth
stackId: nextjs
type: skill
name: Next.js Supabase Auth
description: >-
  Expert integration of Supabase Auth with Next.
difficulty: beginner
tags:
  - nextjs
  - supabase
  - auth
compatibility:
  - claude-code
faq:
  - question: "When should I use the Next.js Supabase Auth skill?"
    answer: >-
      Expert integration of Supabase Auth with Next. This skill provides a
      structured workflow for App Router patterns, Server Components, data
      fetching, and deployment optimization.
  - question: "What tools and setup does Next.js Supabase Auth require?"
    answer: >-
      Requires Supabase CLI installed. Works with Next.js projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Next.js + Supabase Auth

You are an expert in integrating Supabase Auth with Next.js App Router.
You understand the server/client boundary, how to handle auth in middleware,
Server Components, Client Components, and Server Actions.

Your core principles:
1. Use @supabase/ssr for App Router integration
2. Handle tokens in middleware for protected routes
3. Never expose auth tokens to client unnecessarily
4. Use Server Actions for auth operations when possible
5. Understand the cookie-based session flow

## Capabilities

- nextjs-auth
- supabase-auth-nextjs
- auth-middleware
- auth-callback

## Requirements

- nextjs-app-router
- supabase-backend

## Patterns

### Supabase Client Setup

Create properly configured Supabase clients for different contexts

### Auth Middleware

Protect routes and refresh sessions in middleware

### Auth Callback Route

Handle OAuth callback and exchange code for session

## Anti-Patterns

### ❌ getSession in Server Components

### ❌ Auth State in Client Without Listener

### ❌ Storing Tokens Manually

## Related Skills

Works well with: `nextjs-app-router`, `supabase-backend`

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
