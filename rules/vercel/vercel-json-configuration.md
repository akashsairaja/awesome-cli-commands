---
id: vercel-json-configuration
stackId: vercel
type: rule
name: vercel.json Configuration Standards
description: >-
  Enforce proper vercel.json configuration — security headers, rewrites,
  redirects, function settings, and caching rules for Vercel deployments.
difficulty: intermediate
globs:
  - '**/vercel.json'
tags:
  - vercel
  - configuration
  - security-headers
  - redirects
  - deployment
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
  - question: What should be in every vercel.json file?
    answer: >-
      Every vercel.json should include: security headers
      (X-Content-Type-Options, X-Frame-Options, Referrer-Policy), the $schema
      field for editor validation, explicit region configuration, and any
      necessary redirects or rewrites. Use the functions field to configure
      timeout and memory for API routes.
  - question: Should I use redirects or rewrites in vercel.json?
    answer: >-
      Use redirects for moved content (preserves SEO with 301/302 status codes).
      Use rewrites for URL masking where the user sees one URL but the server
      serves different content. Redirects change the browser URL, rewrites do
      not.
relatedItems:
  - vercel-deployment-architect
  - vercel-environment-variables
version: 1.0.0
lastUpdated: '2026-03-11'
---

# vercel.json Configuration Standards

## Rule
All Vercel projects MUST include a vercel.json with security headers, proper function configuration, and consistent redirect/rewrite patterns.

## Format
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [...],
  "redirects": [...],
  "rewrites": [...]
}
```

## Required Security Headers
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

## Redirect Rules
```json
{
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true },
    { "source": "/blog/:slug", "destination": "/posts/:slug", "permanent": true }
  ]
}
```
- Use `permanent: true` (301) for SEO-preserving redirects
- Use `permanent: false` (302) for temporary redirects
- Always prefer redirects over rewrites for moved content

## Function Configuration
```json
{
  "functions": {
    "app/api/heavy-computation/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  }
}
```

## Examples

### Good
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ],
  "redirects": [
    { "source": "/docs", "destination": "/documentation", "permanent": true }
  ]
}
```

### Bad
```json
{
  "builds": [{ "src": "*.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/api/(.*)", "dest": "/api/$1" }]
}
```
Using deprecated `builds` and `routes` fields instead of modern configuration.

## Enforcement
Use the JSON schema for validation in your editor.
Review vercel.json in CI with a custom linting step.
