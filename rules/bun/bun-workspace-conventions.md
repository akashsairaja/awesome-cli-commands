---
id: bun-workspace-conventions
stackId: bun
type: rule
name: Bun Workspace Structure Standards
description: >-
  Organize Bun monorepos with proper workspace configuration — package.json
  workspaces, shared dependencies, inter-package references, and consistent
  script naming.
difficulty: intermediate
globs:
  - '**/bunfig.toml'
  - '**/package.json'
  - '**/*.ts'
tags:
  - workspaces
  - monorepo
  - package-management
  - dependencies
  - project-structure
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
  - question: How do Bun workspaces differ from npm workspaces?
    answer: >-
      Bun workspaces use the same package.json 'workspaces' field as npm and
      Yarn, making migration easy. Bun installs dependencies significantly
      faster and uses a binary lockfile (bun.lockb). The workspace: protocol
      works identically for inter-package references.
  - question: Should shared dependencies go in root or individual packages?
    answer: >-
      Dev dependencies used everywhere (TypeScript, ESLint, Prettier) go in the
      root package.json. Runtime dependencies specific to a package go in that
      package's package.json. Shared runtime libraries should be their own
      workspace package referenced via workspace: protocol.
relatedItems:
  - bun-config-conventions
  - bun-test-patterns
  - npm-package-json-standards
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Bun Workspace Structure Standards

## Rule
Bun monorepos MUST use the workspaces field in the root package.json. Shared dependencies go in the root. Packages reference each other with workspace: protocol.

## Format
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"]
}
```

## Good Examples
```
my-monorepo/
├── package.json          # workspaces: ["packages/*", "apps/*"]
├── bunfig.toml           # Shared config
├── packages/
│   ├── shared/
│   │   └── package.json  # "name": "@myapp/shared"
│   └── ui/
│       └── package.json  # "name": "@myapp/ui"
└── apps/
    ├── web/
    │   └── package.json  # depends on "@myapp/shared": "workspace:*"
    └── api/
        └── package.json
```

```json
{
  "name": "@myapp/web",
  "dependencies": {
    "@myapp/shared": "workspace:*",
    "@myapp/ui": "workspace:*"
  }
}
```

## Bad Examples
```json
{
  "dependencies": {
    "@myapp/shared": "file:../../packages/shared"
  }
}
```

```json
{
  "dependencies": {
    "@myapp/shared": "1.0.0"
  }
}
```

## Script Conventions
```bash
# Run from root for any workspace
bun run --filter '@myapp/web' dev
bun run --filter '@myapp/*' build
bun run --filter '*' test
```

## Enforcement
- `bun install` validates workspace configuration
- CI runs `bun install --frozen-lockfile` to verify lock consistency
- Use consistent script names across all packages: dev, build, test, lint
