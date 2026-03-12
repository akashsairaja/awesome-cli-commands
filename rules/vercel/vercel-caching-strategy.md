---
id: vercel-caching-strategy
stackId: vercel
type: rule
name: Caching & Performance Standards
description: >-
  Define caching rules for Vercel deployments — Cache-Control headers, ISR
  revalidation intervals, edge caching, and static asset optimization standards.
difficulty: intermediate
globs:
  - '**/app/**/*.ts'
  - '**/app/**/*.tsx'
  - '**/next.config.*'
tags:
  - caching
  - performance
  - cdn
  - cache-control
  - optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How does caching work on Vercel?
    answer: >-
      Vercel uses a multi-tier caching system: static assets are cached
      indefinitely with immutable headers, ISR pages are cached at the edge with
      stale-while-revalidate, and API responses can be cached with explicit
      Cache-Control headers. The CDN serves cached content globally with
      sub-50ms latency.
  - question: When should I use force-dynamic vs ISR on Vercel?
    answer: >-
      Use force-dynamic only for truly dynamic content that changes on every
      request (user-specific data, real-time pricing). For most content, ISR
      with on-demand revalidation provides better performance — pages are cached
      at the edge and updated only when content changes.
relatedItems:
  - vercel-isr-configuration
  - vercel-deployment-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Caching & Performance Standards

## Rule
All Vercel deployments MUST implement proper caching strategies for static assets, API responses, and ISR pages to maximize CDN efficiency and minimize serverless invocations.

## Cache Tiers

### Static Assets (Immutable)
```
Cache-Control: public, max-age=31536000, immutable
```
Applies to: _next/static/*, fonts, images with content hash.

### ISR Pages
```
Cache-Control: s-maxage=3600, stale-while-revalidate=86400
```
Applies to: Pages with `export const revalidate = 3600`.

### API Responses (Dynamic)
```
Cache-Control: s-maxage=60, stale-while-revalidate=300
```
Applies to: Frequently accessed API routes.

### No Cache (Personalized)
```
Cache-Control: private, no-cache, no-store
```
Applies to: User-specific data, authentication endpoints.

## Rules
1. Static assets MUST use immutable cache headers (Next.js does this automatically)
2. ISR pages MUST have a `revalidate` export matching content freshness needs
3. API routes MUST set explicit Cache-Control headers for cacheable responses
4. Personalized responses MUST use `private, no-cache` headers
5. Image optimization MUST use `next/image` for automatic format/size optimization
6. Third-party scripts MUST use `next/script` with appropriate loading strategy

## Examples

### Good
```typescript
// API route with proper caching
export async function GET() {
  const data = await fetchProducts();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' }
  });
}

// ISR page with appropriate revalidation
export const revalidate = 3600; // 1 hour for blog posts
```

### Bad
```typescript
// No caching on frequently accessed data
export async function GET() {
  const data = await fetchProducts();
  return NextResponse.json(data); // No Cache-Control = no CDN caching
}

// SSR when ISR would suffice
export const dynamic = 'force-dynamic'; // Unnecessary for semi-static content
```

## Enforcement
Review Cache-Control headers in Vercel deployment logs.
Use Vercel Analytics to monitor cache hit rates.
Audit `force-dynamic` usage — ensure it is justified.
