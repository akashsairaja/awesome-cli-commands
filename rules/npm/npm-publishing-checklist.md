---
id: npm-publishing-checklist
stackId: npm
type: rule
name: NPM Publishing Checklist
description: >-
  Follow the complete checklist before publishing npm packages — proper
  package.json fields, files whitelist, prepublish checks, semantic versioning,
  and 2FA requirement.
difficulty: intermediate
globs:
  - '**/package.json'
  - '**/.npmrc'
  - '**/.npmignore'
tags:
  - publishing
  - npm-publish
  - semver
  - package-exports
  - security
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
  - question: What is the files field in package.json and why is it important?
    answer: >-
      The 'files' field is a whitelist of files and directories included when
      your package is published. Without it, npm includes almost everything
      except what is in .npmignore. Always use 'files' to explicitly include
      only dist/, README.md, and LICENSE — this prevents accidentally publishing
      source code, tests, configs, and secrets.
  - question: What is the exports field and why should I use it?
    answer: >-
      The 'exports' field is the modern way to define package entry points,
      replacing 'main'. It supports conditional exports for ESM (import), CJS
      (require), and TypeScript (types) simultaneously. It also prevents deep
      imports into your package internals, which gives you freedom to refactor
      without breaking consumers.
relatedItems:
  - npm-package-json-standards
  - npm-lockfile-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# NPM Publishing Checklist

## Rule
Every npm package MUST pass this checklist before publishing: proper metadata, files field or .npmignore, prepublish build step, semantic version bump, and 2FA enabled on the npm account.

## Required package.json Fields
```json
{
  "name": "@myorg/package-name",
  "version": "1.0.0",
  "description": "Clear, searchable description",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/myorg/package-name.git"
  },
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist/", "README.md", "LICENSE"],
  "keywords": ["relevant", "search", "terms"],
  "engines": { "node": ">=18.0.0" }
}
```

## Pre-Publish Steps
```bash
# 1. Verify package contents
npm pack --dry-run

# 2. Check bundle size
npx bundlephobia <package-name>

# 3. Test the package locally
npm link
cd ../test-project && npm link @myorg/package-name

# 4. Version bump (follows semver)
npm version patch   # Bug fixes: 1.0.0 -> 1.0.1
npm version minor   # New features: 1.0.0 -> 1.1.0
npm version major   # Breaking changes: 1.0.0 -> 2.0.0

# 5. Publish
npm publish --access public
```

## Good: Files Whitelist
```json
{
  "files": ["dist/", "README.md", "LICENSE"]
}
```

## Bad: Publishing Everything
```json
{
}
```

## Enforcement
- `npm pack --dry-run` in CI to verify package contents
- Require 2FA on npm accounts: `npm profile enable-2fa auth-and-writes`
- Use `np` or `release-it` for automated publish workflows
- Provenance: `npm publish --provenance` for supply chain transparency
