---
id: firebase-hosting-config
stackId: firebase
type: skill
name: Configure Firebase Hosting with Cloud Functions
description: >-
  Set up Firebase Hosting for static sites and SSR — deploy targets, multi-site
  hosting, Cloud Functions integration, and CDN caching configuration.
difficulty: beginner
tags:
  - firebase-hosting
  - cdn
  - ssr
  - multi-site
  - deployment
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Firebase project
  - Firebase CLI installed
faq:
  - question: How do I integrate Firebase Hosting with Cloud Functions?
    answer: >-
      Use the rewrites field in firebase.json to route specific URL patterns to
      Cloud Functions. For example, route '/api/**' to a function named 'api'.
      The Hosting CDN handles static files while Functions handle dynamic
      routes, giving you the best of both worlds.
  - question: What are Firebase Hosting preview channels?
    answer: >-
      Preview channels create temporary deployment URLs for testing. Run
      'firebase hosting:channel:deploy my-preview' to deploy a branch to a
      unique URL. Channels expire automatically and are perfect for PR reviews
      and QA testing without affecting production.
relatedItems:
  - firebase-cloud-functions
  - firebase-security-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Configure Firebase Hosting with Cloud Functions

## Overview
Firebase Hosting provides fast, secure CDN hosting with HTTPS. Integrate with Cloud Functions for server-side rendering, API endpoints, and dynamic content. Configure multi-site hosting for staging and production.

## Why This Matters
- **Global CDN** — content served from nearest edge location
- **Free SSL** — automatic HTTPS for custom domains
- **SSR support** — Cloud Functions handle dynamic routes
- **Atomic deploys** — all files deploy at once, no partial states

## How It Works

### Step 1: Basic Hosting Configuration
```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" }
        ]
      }
    ]
  }
}
```

### Step 2: Integrate Cloud Functions for SSR
```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "/api/**",
        "function": {
          "functionId": "api",
          "region": "us-central1"
        }
      },
      {
        "source": "/ssr/**",
        "function": {
          "functionId": "ssrApp",
          "region": "us-central1"
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Step 3: Multi-Site Hosting
```json
{
  "hosting": [
    {
      "target": "app",
      "public": "apps/web/dist",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "docs",
      "public": "apps/docs/dist",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

```bash
# Associate targets with sites
firebase target:apply hosting app my-app-prod
firebase target:apply hosting docs my-docs-prod

# Deploy specific target
firebase deploy --only hosting:app
```

### Step 4: Preview Channels
```bash
# Create a temporary preview channel (expires in 7 days)
firebase hosting:channel:deploy preview-feature-x --expires 7d

# Share the preview URL for testing
# https://my-project--preview-feature-x.web.app
```

## Best Practices
- Set long cache headers for hashed assets (JS, CSS with content hash)
- Use rewrites for SPA routing and Cloud Functions integration
- Configure multi-site hosting for staging and production
- Use preview channels for PR review and QA testing
- Enable security headers on all responses
- Deploy with `firebase deploy --only hosting` to avoid redeploying functions

## Common Mistakes
- Missing SPA rewrite rule (404 on client-side routes)
- Not caching static assets (slow repeat visits)
- Deploying everything instead of just hosting (slow deploys)
- Not using preview channels for testing (deploying directly to production)
- Missing security headers
