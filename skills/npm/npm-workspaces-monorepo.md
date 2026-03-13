---
id: npm-workspaces-monorepo
stackId: npm
type: skill
name: NPM Workspaces for Monorepos
description: >-
  Set up npm workspaces to manage multiple packages in a single repository —
  shared dependencies, cross-package scripts, and publishing workflows for
  monorepo projects.
difficulty: intermediate
tags:
  - npm
  - workspaces
  - monorepos
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the NPM Workspaces for Monorepos skill?"
    answer: >-
      Set up npm workspaces to manage multiple packages in a single repository
      — shared dependencies, cross-package scripts, and publishing workflows
      for monorepo projects. This skill provides a structured workflow for
      dependency management, monorepo architecture, script automation, and
      package publishing.
  - question: "What tools and setup does NPM Workspaces for Monorepos require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with npm/pnpm/yarn projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# NPM Workspaces for Monorepos

## Overview
NPM workspaces let you manage multiple packages in a single repository with shared dependencies, unified scripts, and cross-package references. No additional tooling like Lerna is required for most use cases.

## Why This Matters
- **Shared dependencies** — one node_modules, deduplicated packages
- **Cross-references** — packages import each other without publishing
- **Unified commands** — run scripts across all packages from the root
- **Atomic changes** — modify multiple packages in a single commit

## Step 1: Configure Root package.json
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

## Step 2: Create Package Structure
```
my-monorepo/
  package.json          # Root — defines workspaces
  packages/
    shared/
      package.json      # @myorg/shared
      src/index.ts
    ui/
      package.json      # @myorg/ui
      src/index.ts
  apps/
    web/
      package.json      # @myorg/web
      src/index.ts
    api/
      package.json      # @myorg/api
      src/index.ts
```

## Step 3: Cross-Package References
```json
// apps/web/package.json
{
  "name": "@myorg/web",
  "dependencies": {
    "@myorg/shared": "*",
    "@myorg/ui": "*"
  }
}
```
```bash
# Install all workspace dependencies
npm install
# @myorg/shared and @myorg/ui are symlinked automatically
```

## Step 4: Run Scripts Across Workspaces
```bash
# Run in a specific workspace
npm run build --workspace=packages/shared
npm run build -w packages/shared  # Short form

# Run in all workspaces
npm run build --workspaces
npm run build -ws  # Short form

# Run in all workspaces, continue on error
npm run test -ws --if-present
```

## Step 5: Root Scripts for Common Commands
```json
{
  "scripts": {
    "build": "npm run build -ws",
    "test": "npm run test -ws --if-present",
    "lint": "npm run lint -ws --if-present",
    "clean": "npm run clean -ws --if-present && rm -rf node_modules"
  }
}
```

## Best Practices
- Use scoped package names (`@myorg/package`) for workspace packages
- Set `"private": true` on the root package.json
- Use `"*"` version for internal workspace dependencies
- Run `npm install` from the root — never from individual packages
- Use `--if-present` flag when not all packages have the script
- Keep shared dev dependencies (TypeScript, ESLint) at the root level

## Common Mistakes
- Running npm install inside individual workspace packages
- Not using scoped names (name collisions with public packages)
- Forgetting to set workspace packages as dependencies before importing
- Publishing workspace packages without building first
