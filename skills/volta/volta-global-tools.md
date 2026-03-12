---
id: volta-global-tools
stackId: volta
type: skill
name: Volta Global Tool Management
description: >-
  Install and manage global CLI tools through Volta — TypeScript, ESLint,
  Prettier, and other tools that respect per-project Node versions while being
  globally accessible.
difficulty: beginner
tags:
  - volta-global
  - global-tools
  - typescript
  - cli-tools
  - shims
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Volta installed
faq:
  - question: How do Volta global tools differ from npm global installs?
    answer: >-
      Volta global tools are project-aware — they use the project's pinned Node
      version when run inside a project. npm globals always use the system Node.
      This means 'volta install typescript' gives you a tsc that adapts to each
      project's Node version automatically.
  - question: Which tools should I install globally with Volta?
    answer: >-
      Install tools you use across all projects: typescript, prettier, eslint,
      tsx (TypeScript runner), turbo (monorepo), and deployment CLIs (vercel,
      netlify-cli). Keep the list short — project-specific tools should be in
      devDependencies, not global.
relatedItems:
  - volta-project-pinning
  - volta-toolchain-manager
  - volta-ci-integration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Volta Global Tool Management

## Overview
Volta manages global CLI tools differently from npm. When you `volta install typescript`, it creates a shim that uses the project's pinned Node version when inside a project, and your default version elsewhere. This eliminates the "global tool uses wrong Node" problem.

## Why This Matters
- **Project-aware globals** — global tools use project's Node version
- **No version conflicts** — each project can have different tool versions
- **Clean uninstall** — `volta uninstall` removes cleanly
- **Portable** — global tools travel with your Volta config

## How It Works

### Step 1: Install Global Tools
```bash
# Install commonly-used global tools
volta install typescript
volta install prettier
volta install eslint
volta install tsx
volta install turbo
volta install vercel

# Install specific versions
volta install typescript@5.3

# List installed tools
volta list all
```

### Step 2: Understand the Shim Behavior
```bash
# Inside a project with Node 20 pinned:
cd ~/projects/app-node20
tsc --version  # Uses Node 20 to run TypeScript

# Inside a project with Node 18 pinned:
cd ~/projects/app-node18
tsc --version  # Uses Node 18 to run TypeScript

# Outside any project:
cd ~
tsc --version  # Uses your default Node version
```

### Step 3: Project-Specific Tool Versions
```bash
# Pin a specific tool version for a project
volta pin typescript@5.0

# This adds to package.json:
# "volta": {
#   "node": "20.11.1",
#   "npm": "10.4.0",
#   "extends": ["typescript@5.0.4"]
# }
```

## Volta Install vs npm install -g
```bash
# Good: Volta-managed (project-aware)
volta install prettier
# Creates a shim that respects per-project Node

# Bad: npm-managed (uses global Node only)
npm install -g prettier
# Always uses global Node, ignoring project pins
```

## Best Practices
- **Use `volta install`** for ALL global tools — never `npm install -g`
- **Pin project-specific versions** when a tool version matters for that project
- **Keep globals minimal** — only tools you use across all projects
- **List periodically**: `volta list all` to audit installed tools
- **Uninstall unused**: `volta uninstall <tool>`

## Common Mistakes
- Using `npm install -g` alongside Volta (shim conflicts)
- Installing too many global tools (hard to maintain)
- Not understanding shim behavior (expecting same version everywhere)
- Forgetting that Volta globals require Volta on the PATH
