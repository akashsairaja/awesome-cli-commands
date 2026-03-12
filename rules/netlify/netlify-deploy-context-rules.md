---
id: netlify-deploy-context-rules
stackId: netlify
type: rule
name: Deploy Context & Environment Rules
description: >-
  Standards for managing Netlify deploy contexts — production, preview, and
  branch deploy configurations with proper environment variable isolation and
  build commands.
difficulty: beginner
globs:
  - '**/netlify.toml'
tags:
  - deploy-context
  - environment-variables
  - preview
  - production
  - configuration
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
  - question: What are Netlify deploy contexts?
    answer: >-
      Deploy contexts let you configure different settings for production,
      deploy-preview (PR previews), and branch-deploy environments. Each context
      can have its own build command, environment variables, headers, and
      redirects. This enables environment-specific behavior without code
      changes.
  - question: How do I prevent Netlify preview deployments from being indexed by Google?
    answer: >-
      Add an X-Robots-Tag: noindex header in the deploy-preview context. You can
      set this in netlify.toml headers for all routes, then override it in the
      production context to allow indexing. This prevents preview URLs from
      appearing in search results.
relatedItems:
  - netlify-deployment-specialist
  - netlify-toml-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Deploy Context & Environment Rules

## Rule
All Netlify projects MUST define separate configurations for production, deploy-preview, and branch-deploy contexts. Environment variables MUST be scoped to the appropriate context.

## Format
```toml
[context.production]
  command = "npm run build"
  environment = { NEXT_PUBLIC_ENV = "production" }

[context.deploy-preview]
  command = "npm run build:preview"
  environment = { NEXT_PUBLIC_ENV = "preview", ROBOTS_NOINDEX = "true" }

[context.branch-deploy]
  command = "npm run build:staging"
  environment = { NEXT_PUBLIC_ENV = "staging" }
```

## Rules
1. Production builds MUST use optimized build commands
2. Preview deployments MUST set X-Robots-Tag: noindex to prevent indexing
3. Sensitive environment variables MUST be set in Netlify dashboard (not netlify.toml)
4. Each context SHOULD have appropriate API endpoints configured
5. Preview deployments SHOULD use test/staging API keys
6. Branch deploys SHOULD only be enabled for specific branches when needed

## Preview Deployment Protection
```toml
[[headers]]
  for = "/*"
  [headers.values]
    # Only on previews — prevent search engine indexing
    X-Robots-Tag = "noindex, nofollow"

[context.production.headers]
  for = "/*"
  [context.production.headers.values]
    # Override on production — allow indexing
    X-Robots-Tag = "index, follow"
```

## Environment Variable Scoping
| Variable | Production | Preview | Development |
|----------|-----------|---------|-------------|
| API_URL | api.example.com | staging-api.example.com | localhost:3001 |
| DATABASE_URL | prod-db | staging-db | local-db |
| ANALYTICS_ID | real-id | (unset) | (unset) |

## Examples

### Good
- Separate build commands per context
- Test API keys on preview, production keys on production
- noindex on preview deployments
- Sensitive variables in dashboard, non-sensitive in netlify.toml

### Bad
- Same configuration for all contexts
- Production API keys on preview deployments
- Preview deployments indexed by search engines
- All secrets committed in netlify.toml

## Enforcement
Review deploy context configuration in netlify.toml.
Verify preview deployments have noindex headers.
Audit environment variables in Netlify dashboard quarterly.
