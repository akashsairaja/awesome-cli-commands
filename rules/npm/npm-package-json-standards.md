---
id: npm-package-json-standards
stackId: npm
type: rule
name: package.json Standards
description: >-
  Maintain clean package.json files — required fields for publishing, proper
  version ranges, organized scripts, and correct dependency classification
  between dependencies and devDependencies.
difficulty: beginner
globs:
  - '**/package.json'
  - '**/.npmrc'
tags:
  - package-json
  - versioning
  - dependencies
  - scripts
  - publishing
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
  - question: What version range should I use for npm dependencies?
    answer: >-
      Use ^ (caret) for most dependencies — it allows minor and patch updates:
      '^4.18.0' matches 4.18.0 to 4.x.x. Use exact versions for critical
      dependencies where any change could break: '4.18.2'. Never use * (any
      version) — it allows major version jumps that break APIs.
  - question: What is the difference between dependencies and devDependencies?
    answer: >-
      dependencies are required at runtime — they are installed when users
      install your package. devDependencies are only needed during development
      and testing (TypeScript, ESLint, Jest) — they are not installed by package
      consumers. Misclassifying devDependencies as dependencies bloats install
      size for all users.
relatedItems:
  - npm-lockfile-management
  - npm-publishing-checklist
  - npm-script-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# package.json Standards

## Rule
Every package.json MUST have name, version, description, and license fields. Dependencies MUST use appropriate version ranges. Scripts MUST follow consistent naming conventions.

## Required Fields
```json
{
  "name": "@myorg/my-package",
  "version": "1.0.0",
  "description": "Brief description of what this package does",
  "license": "MIT",
  "type": "module",
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## Script Naming Conventions
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "precommit": "lint-staged"
  }
}
```

## Dependency Classification
| Type | Category | Example |
|------|----------|---------|
| Runtime dependency | dependencies | express, react, lodash |
| Build/test tool | devDependencies | jest, eslint, typescript |
| Peer requirement | peerDependencies | react (for React plugins) |

## Good Examples
```json
{
  "name": "@myorg/api-server",
  "version": "2.1.0",
  "description": "REST API server for the myorg platform",
  "license": "MIT",
  "type": "module",
  "engines": { "node": ">=20.0.0" },
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "lint": "eslint src/"
  },
  "dependencies": {
    "express": "^4.18.2",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vitest": "^1.5.0",
    "eslint": "^9.0.0"
  }
}
```

## Bad Examples
```json
{
  "name": "app",
  "scripts": { "go": "node index.js" },
  "dependencies": {
    "jest": "^29.0.0",
    "typescript": "^5.0.0",
    "express": "*"
  }
}
```

## Enforcement
- Use `npm pkg fix` to auto-correct common issues
- `npm publish --dry-run` to verify package contents
- CI validates engines field matches runtime version
