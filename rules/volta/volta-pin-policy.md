---
id: volta-pin-policy
stackId: volta
type: rule
name: Volta Version Pinning Policy
description: >-
  Enforce Volta version pinning in all Node.js projects — pin Node, npm, and
  Yarn in package.json, use LTS for production, and maintain single source of
  truth for versions.
difficulty: beginner
globs:
  - '**/package.json'
  - '**/.nvmrc'
  - '**/.node-version'
tags:
  - volta-pin
  - version-pinning
  - package-json
  - nodejs-version
  - single-source-of-truth
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: Why should I pin Node AND npm versions with Volta?
    answer: >-
      Different npm versions can produce different lock files, different
      dependency resolution, and different behavior. Pinning both Node and npm
      ensures identical toolchain across all developers and CI. A Node 20 + npm
      10 pin guarantees the same behavior everywhere.
  - question: Should I use .nvmrc or package.json for Node versions?
    answer: >-
      Use package.json with Volta. It's the single source of truth that also
      pins npm/Yarn (which .nvmrc can't do). If your team uses Volta, delete
      .nvmrc files and pin in package.json instead.
relatedItems:
  - volta-project-pinning
  - volta-toolchain-manager
  - volta-no-npm-global
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Volta Version Pinning Policy

## Rule
Every Node.js project MUST pin Node.js AND npm/Yarn versions in package.json using Volta. No .nvmrc, no .node-version files — package.json is the single source of truth.

## Format
```json
{
  "name": "my-project",
  "volta": {
    "node": "20.11.1",
    "npm": "10.4.0"
  }
}
```

## Requirements
1. **Pin Node version** — always specific (20.11.1, not 20)
2. **Pin npm or Yarn** — not just Node
3. **Use LTS for production** — even-numbered Node versions
4. **No .nvmrc files** — delete if present, pin in package.json
5. **Monorepo root only** — workspaces inherit from root

## Commands
```bash
# Pin versions
volta pin node@20     # Resolves to latest 20.x.x
volta pin npm@10

# Verify
cat package.json | jq .volta
```

## Good
```json
{
  "volta": {
    "node": "20.11.1",
    "npm": "10.4.0"
  }
}
```

## Bad
```
# .nvmrc file (not Volta)
20

# package.json with only Node pinned
{
  "volta": {
    "node": "20.11.1"
  }
}
// Missing npm version!
```
