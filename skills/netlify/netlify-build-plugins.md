---
id: netlify-build-plugins
stackId: netlify
type: skill
name: Optimize Builds with Netlify Build Plugins
description: >-
  Extend Netlify builds with plugins — cache optimization, sitemap generation,
  Lighthouse auditing, and custom build steps using the Netlify Build Plugin
  API.
difficulty: intermediate
tags:
  - build-plugins
  - caching
  - lighthouse
  - sitemap
  - build-optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Netlify site deployed
  - netlify.toml configured
faq:
  - question: What are Netlify Build Plugins?
    answer: >-
      Build Plugins are modules that hook into Netlify's build lifecycle
      (preBuild, postBuild, onSuccess, onError). Community plugins handle common
      tasks like caching, Lighthouse auditing, and sitemap submission. You can
      also create custom plugins for project-specific automation.
  - question: How do I cache build outputs between Netlify deployments?
    answer: >-
      Use the netlify-plugin-cache plugin or create a custom plugin using
      utils.cache.save() and utils.cache.restore(). Cache node_modules, .cache
      directories, and generated files that do not change between builds. This
      can reduce build times by 30-50%.
relatedItems:
  - netlify-deployment-specialist
  - netlify-functions-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Optimize Builds with Netlify Build Plugins

## Overview
Netlify Build Plugins hook into the build lifecycle to extend functionality. Use community plugins for common tasks (caching, sitemaps, auditing) or build custom plugins for project-specific needs.

## Why This Matters
- **Faster builds** — cache dependencies and build outputs between deploys
- **Quality gates** — run Lighthouse audits on every deployment
- **Automation** — generate sitemaps, submit to search engines, notify teams
- **Customization** — hook into any build lifecycle event

## How It Works

### Step 1: Install Community Plugins
```toml
# netlify.toml
[[plugins]]
  package = "netlify-plugin-cache"
  [plugins.inputs]
    paths = [".cache", "public"]

[[plugins]]
  package = "@netlify/plugin-lighthouse"
  [plugins.inputs]
    output_path = "reports/lighthouse.html"
    audits = [
      { path = "/", thresholds = { performance = 0.9, accessibility = 0.9 } },
      { path = "/blog", thresholds = { performance = 0.8 } }
    ]

[[plugins]]
  package = "netlify-plugin-submit-sitemap"
  [plugins.inputs]
    baseUrl = "https://example.com"
    sitemapPath = "/sitemap.xml"
    providers = ["google", "bing"]
```

### Step 2: Build a Custom Plugin
```javascript
// plugins/notify-deploy/index.js
module.exports = {
  onSuccess: async ({ utils, constants }) => {
    const siteUrl = constants.DEPLOY_URL;
    const siteName = process.env.SITE_NAME;

    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `Deployed ${siteName}: ${siteUrl}`,
      }),
    });

    console.log("Slack notification sent");
  },

  onError: ({ utils, error }) => {
    utils.build.failPlugin(`Build failed: ${error.message}`);
  },
};
```

```toml
# netlify.toml — reference local plugin
[[plugins]]
  package = "./plugins/notify-deploy"
```

### Step 3: Cache Build Outputs
```javascript
// plugins/cache-prisma/index.js
module.exports = {
  onPreBuild: async ({ utils }) => {
    await utils.cache.restore("./node_modules/.prisma");
    await utils.cache.restore("./node_modules/@prisma");
  },
  onPostBuild: async ({ utils }) => {
    await utils.cache.save("./node_modules/.prisma");
    await utils.cache.save("./node_modules/@prisma");
  },
};
```

## Build Lifecycle Events
| Event | When It Runs | Common Use |
|-------|-------------|-----------|
| `onPreBuild` | Before build command | Restore caches, setup |
| `onBuild` | During build | Custom build steps |
| `onPostBuild` | After build, before deploy | Save caches, audits |
| `onSuccess` | After successful deploy | Notifications, webhooks |
| `onError` | On build failure | Error reporting |

## Best Practices
- Cache aggressively — node_modules, .cache, generated files
- Run Lighthouse on key pages with minimum thresholds
- Fail builds on critical audit failures (accessibility, security)
- Use custom plugins for project-specific automation
- Keep plugin count reasonable (each adds build time)

## Common Mistakes
- Not caching between builds (slow builds every time)
- Installing plugins via npm but not referencing in netlify.toml
- Setting Lighthouse thresholds too high initially (builds always fail)
- Not handling plugin errors gracefully (crashes the build)
- Caching paths that should be regenerated on every build
