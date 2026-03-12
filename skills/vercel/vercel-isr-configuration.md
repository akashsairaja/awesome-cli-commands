---
id: vercel-isr-configuration
stackId: vercel
type: skill
name: Implement ISR with On-Demand Revalidation
description: >-
  Master Incremental Static Regeneration on Vercel — time-based and on-demand
  revalidation, stale-while-revalidate patterns, and cache management for
  dynamic content.
difficulty: intermediate
tags:
  - isr
  - revalidation
  - caching
  - static-generation
  - next-js
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Next.js 13+ with App Router
  - Vercel deployment
faq:
  - question: What is Incremental Static Regeneration (ISR) on Vercel?
    answer: >-
      ISR lets you update static pages after build time without redeploying.
      Pages are served from the CDN and revalidated in the background either on
      a time interval (e.g., every hour) or on-demand via API calls. This
      combines static performance with dynamic content freshness.
  - question: What is the difference between time-based and on-demand revalidation?
    answer: >-
      Time-based revalidation regenerates pages after a set interval (e.g.,
      every 3600 seconds). On-demand revalidation triggers regeneration
      immediately via an API call — typically from a CMS webhook. On-demand is
      faster for content updates but requires webhook integration.
  - question: How do cache tags work with ISR on Vercel?
    answer: >-
      Cache tags label fetch requests with identifiers like 'posts' or
      'post-my-slug'. When content changes, calling
      revalidateTag('post-my-slug') invalidates all cached responses with that
      tag. This enables granular cache control without knowing every URL that
      uses the data.
relatedItems:
  - vercel-deployment-architect
  - vercel-edge-functions
  - vercel-monorepo-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Implement ISR with On-Demand Revalidation

## Overview
Incremental Static Regeneration (ISR) combines the performance of static pages with the freshness of dynamic content. Pages are statically generated at build time, then revalidated in the background — either on a time interval or on-demand via webhook.

## Why This Matters
- **Static performance** — pages served from CDN edge in <50ms
- **Fresh content** — pages update without full rebuild
- **Cost efficiency** — reduces serverless function invocations
- **Scalability** — handles traffic spikes without compute scaling

## How It Works

### Step 1: Time-Based Revalidation
```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return <Article post={post} />;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### Step 2: On-Demand Revalidation via API Route
```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidation-secret');
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path, tag } = await request.json();

  if (tag) {
    revalidateTag(tag);
    return NextResponse.json({ revalidated: true, tag });
  }

  if (path) {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, path });
  }

  return NextResponse.json({ error: 'Missing path or tag' }, { status: 400 });
}
```

### Step 3: Tag-Based Cache Management
```typescript
// lib/api.ts
export async function getPost(slug: string) {
  const res = await fetch(`${API_URL}/posts/${slug}`, {
    next: {
      tags: ['posts', `post-${slug}`],
      revalidate: 3600,
    },
  });
  return res.json();
}

// When a post is updated, revalidate by tag:
// POST /api/revalidate { "tag": "post-my-article" }
```

### Step 4: Webhook Integration (CMS)
```typescript
// app/api/cms-webhook/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  const payload = await request.json();

  // Sanity CMS webhook
  if (payload._type === 'post') {
    revalidateTag(`post-${payload.slug.current}`);
    revalidateTag('posts'); // Revalidate listing pages too
  }

  return NextResponse.json({ received: true });
}
```

## Best Practices
- Use tag-based revalidation for granular cache control
- Set a fallback revalidate time even with on-demand (safety net)
- Protect revalidation endpoints with a shared secret
- Revalidate listing pages when individual items change
- Use `generateStaticParams` for known paths at build time
- Monitor cache hit rates with Vercel Analytics

## Common Mistakes
- Setting revalidate too low (defeats the purpose of caching)
- Not revalidating listing pages when detail pages change
- Exposing revalidation endpoints without authentication
- Using SSR when ISR with on-demand revalidation would suffice
- Not handling 404 cases with `notFound()` for deleted content
