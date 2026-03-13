---
id: volta-project-pinning
stackId: volta
type: skill
name: Volta Project Version Pinning
description: >-
  Pin Node.js, npm, and Yarn versions per project with Volta — automatic
  version switching, package.json integration, and team-wide consistency
  without manual intervention.
difficulty: advanced
tags:
  - volta
  - project
  - version
  - pinning
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
  - question: "When should I use the Volta Project Version Pinning skill?"
    answer: >-
      Pin Node.js, npm, and Yarn versions per project with Volta — automatic
      version switching, package.json integration, and team-wide consistency
      without manual intervention. This skill provides a structured workflow
      for development tasks.
  - question: "What tools and setup does Volta Project Version Pinning require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with volta projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Volta Project Version Pinning

## Overview
Volta pins tool versions directly in package.json. When you `cd` into a project, Volta automatically uses the pinned version — no `.nvmrc`, no `nvm use`, no shell hooks. It just works.

## Why This Matters
- **Zero-effort switching** — cd into project, correct Node activates
- **Team consistency** — version is in package.json, committed to Git
- **Pins npm/Yarn too** — not just Node (which nvm can't do)
- **No .nvmrc** — one fewer config file to maintain

## How It Works

### Step 1: Install Volta
```bash
# macOS/Linux
curl https://get.volta.sh | bash

# Windows
# Download installer from https://volta.sh

# Verify
volta --version
```

### Step 2: Install and Pin Node
```bash
# Install latest LTS and pin to current project
volta pin node@20

# Install specific version
volta pin node@20.11.1

# Pin npm version
volta pin npm@10

# Pin Yarn version
volta pin yarn@4
```

### Step 3: Check package.json
```json
{
  "name": "my-project",
  "volta": {
    "node": "20.11.1",
    "npm": "10.4.0",
    "yarn": "4.1.0"
  }
}
```

### Step 4: Verify Automatic Switching
```bash
# Inside project directory
cd ~/projects/my-project
node --version   # → v20.11.1

# In a different project with different pin
cd ~/projects/other-project
node --version   # → v18.19.0 (whatever that project pins)

# Outside any project (uses default)
cd ~
node --version   # → default version
```

### Step 5: Set Global Defaults
```bash
# Install a default Node version (used outside projects)
volta install node@20

# Install default global tools
volta install npm@10
volta install typescript
volta install prettier
```

## Monorepo Configuration
```json
// Root package.json — all workspaces inherit this
{
  "name": "monorepo",
  "volta": {
    "node": "20.11.1",
    "npm": "10.4.0"
  },
  "workspaces": ["packages/*"]
}
// Workspace package.json files do NOT need volta section
```

## Best Practices
- **Pin in every project** — don't rely on default version
- **Pin npm/Yarn alongside Node** — complete toolchain consistency
- **Use LTS versions** for production projects
- **Set a global default** for use outside projects
- **Commit package.json** — volta section is part of the project
- **Use volta install** for global tools, not `npm install -g`

## Common Mistakes
- Pinning Node but not npm (npm version matters too)
- Using `npm install -g` instead of `volta install` (bypasses Volta)
- Not pinning in monorepo root (workspaces don't inherit)
- Having nvm installed alongside Volta (conflicts)
- Forgetting to commit package.json after pinning
