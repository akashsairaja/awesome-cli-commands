---
id: netlify-redirects-config
stackId: netlify
type: skill
name: Master Netlify Redirects and Rewrites
description: >-
  Configure Netlify redirects and rewrites for SPA routing, URL migrations,
  proxy rules, and geo-based routing using netlify.toml and _redirects file.
difficulty: beginner
tags:
  - redirects
  - rewrites
  - spa-routing
  - url-migration
  - proxy
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Netlify site deployed
faq:
  - question: How do I set up SPA routing on Netlify?
    answer: >-
      Add a catch-all redirect rule: from '/*' to '/index.html' with status 200.
      This tells Netlify to serve index.html for all routes that don't match a
      static file, allowing your client-side router (React Router, Vue Router)
      to handle the URL.
  - question: What is the difference between a redirect and a rewrite on Netlify?
    answer: >-
      A redirect (301/302) changes the URL in the browser and sends a new HTTP
      response. A rewrite (200 status) serves different content without changing
      the URL. Rewrites are used for SPA routing and API proxying where you want
      to mask the actual content source.
  - question: Should I use _redirects or netlify.toml for redirect rules?
    answer: >-
      Use netlify.toml — it supports more features (conditions, headers, force),
      is easier to read, and keeps all configuration in one file. The _redirects
      file is simpler but limited. If you use both, netlify.toml rules take
      precedence.
relatedItems:
  - netlify-deployment-specialist
  - netlify-functions-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Master Netlify Redirects and Rewrites

## Overview
Netlify's redirect engine handles URL routing at the CDN edge — SPA fallbacks, URL migrations, API proxying, and geo-based routing. Rules are processed in order, with the first match winning.

## Why This Matters
- **SPA routing** — prevents 404s on client-side routes
- **SEO migrations** — preserve search rankings when URLs change
- **API proxying** — avoid CORS issues by proxying through your domain
- **Geo routing** — serve different content based on visitor location

## How It Works

### Step 1: SPA Fallback (Most Common)
```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: URL Migrations with 301 Redirects
```toml
[[redirects]]
  from = "/old-blog/*"
  to = "/blog/:splat"
  status = 301

[[redirects]]
  from = "/about-us"
  to = "/about"
  status = 301
```

### Step 3: API Proxy (Avoid CORS)
```toml
[[redirects]]
  from = "/api/*"
  to = "https://api.example.com/:splat"
  status = 200
  force = true
  headers = {X-Custom-Header = "my-value"}
```

### Step 4: Geo-Based Routing
```toml
[[redirects]]
  from = "/*"
  to = "/eu/:splat"
  status = 302
  conditions = {Country = ["DE", "FR", "IT", "ES"]}

[[redirects]]
  from = "/*"
  to = "/default/:splat"
  status = 200
```

### Step 5: Role-Based Access (with Netlify Identity)
```toml
[[redirects]]
  from = "/admin/*"
  to = "/admin/:splat"
  status = 200
  conditions = {Role = ["admin"]}

[[redirects]]
  from = "/admin/*"
  to = /login
  status = 302
```

## Best Practices
- Place specific redirects BEFORE catch-all rules (first match wins)
- Use 301 for permanent moves (SEO credit transfers), 302 for temporary
- Use `force = true` for proxy rules to always apply (even if file exists)
- Test redirects with Netlify's playground: netlify.com/docs/redirects
- Use `:splat` for wildcard captures, `:param` for named captures
- Keep redirect count reasonable (< 1000 rules)

## Common Mistakes
- Placing SPA catch-all before specific redirects (overrides everything)
- Using 302 instead of 301 for permanent URL migrations (loses SEO value)
- Not using `force = true` on proxy rules (fails if matching static file exists)
- Mixing _redirects file with netlify.toml rules (unpredictable ordering)
- Redirect loops (A -> B -> A)
