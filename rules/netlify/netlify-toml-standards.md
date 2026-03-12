---
id: netlify-toml-standards
stackId: netlify
type: rule
name: netlify.toml Configuration Standards
description: >-
  Enforce consistent netlify.toml configuration — build settings, deploy
  contexts, security headers, redirect rules, and function configuration for all
  Netlify projects.
difficulty: beginner
globs:
  - '**/netlify.toml'
  - '**/_redirects'
  - '**/_headers'
tags:
  - netlify
  - configuration
  - security-headers
  - toml
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
  - question: What should every netlify.toml file include?
    answer: >-
      Every netlify.toml should include: build settings (command, publish
      directory), Node.js version, security headers (X-Content-Type-Options,
      X-Frame-Options), and deploy context overrides for preview and production
      environments. Add functions directory if using Netlify Functions.
  - question: Do netlify.toml settings override Netlify dashboard settings?
    answer: >-
      It depends on the setting. Build commands in netlify.toml take precedence,
      but some dashboard settings (like environment variables and domain
      configuration) cannot be set in netlify.toml. Always check Netlify's
      documentation for precedence rules.
relatedItems:
  - netlify-deployment-specialist
  - netlify-redirects-config
version: 1.0.0
lastUpdated: '2026-03-11'
---

# netlify.toml Configuration Standards

## Rule
All Netlify projects MUST use netlify.toml for configuration instead of dashboard settings. All settings must be version-controlled and reviewable.

## Format
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--prefer-offline"

[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build:preview"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Required Sections

### Build Settings
- Explicit `command` and `publish` directory
- `NODE_VERSION` pinned in build.environment
- Functions directory specified

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Deploy Contexts
- Production-specific settings in [context.production]
- Preview-specific settings in [context.deploy-preview]

## Examples

### Good
```toml
[build]
  command = "npm run build"
  publish = "build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Bad
- No netlify.toml (all settings in dashboard — not version controlled)
- Missing security headers
- No Node version pinned (uses Netlify default, may change)
- No deploy context overrides

## Enforcement
Review netlify.toml in every PR that modifies it.
Use Netlify's config validation in the build log to catch errors.
