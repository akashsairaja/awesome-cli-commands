---
id: scoop-bucket-management
stackId: scoop
type: skill
name: Scoop Bucket Management
description: >-
  Manage Scoop buckets for comprehensive package coverage — add official and
  community buckets, create custom buckets for internal tools, and organize
  app sources.
difficulty: intermediate
tags:
  - scoop
  - bucket
  - management
  - deployment
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
  - question: "When should I use the Scoop Bucket Management skill?"
    answer: >-
      Manage Scoop buckets for comprehensive package coverage — add official
      and community buckets, create custom buckets for internal tools, and
      organize app sources. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does Scoop Bucket Management require?"
    answer: >-
      Works with standard scoop tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working scoop environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Scoop Bucket Management

## Overview
Scoop buckets are Git repositories containing app manifests (JSON files). The 'main' bucket covers core CLI tools, but adding 'extras', 'versions', and 'nerd-fonts' buckets dramatically expands available packages.

## Why This Matters
- **Package coverage** — main bucket has ~1000 apps, extras adds ~1800 more
- **Version management** — versions bucket allows installing specific versions
- **Custom tools** — create private buckets for internal team tools
- **Nerd Fonts** — essential for terminal customization

## How It Works

### Step 1: Add Essential Buckets
```powershell
# Add the most useful buckets
scoop bucket add extras          # GUI apps, dev tools
scoop bucket add versions        # Multiple versions (python27, nodejs-lts)
scoop bucket add nerd-fonts      # Nerd Font variations
scoop bucket add java            # JDK distributions

# List added buckets
scoop bucket list
```

### Step 2: Search Across Buckets
```powershell
# Search all known buckets (including unadded)
scoop search nodejs

# Search in a specific bucket
scoop bucket known  # List all known buckets

# Check which bucket provides an app
scoop info nodejs
```

### Step 3: Create a Custom Bucket
```powershell
# Create a new bucket repository
mkdir my-scoop-bucket
cd my-scoop-bucket
git init

# Add an app manifest
# bucket/my-internal-tool.json
```

```json
{
  "version": "1.2.3",
  "description": "Internal CLI tool for deployment",
  "homepage": "https://internal.company.com",
  "license": "Proprietary",
  "url": "https://releases.company.com/tool-1.2.3-win64.zip",
  "hash": "sha256:abc123...",
  "bin": "tool.exe",
  "checkver": {
    "url": "https://releases.company.com/latest.json",
    "jsonpath": "$.version"
  },
  "autoupdate": {
    "url": "https://releases.company.com/tool-$version-win64.zip"
  }
}
```

```powershell
# Push to Git and add as bucket
git add . && git commit -m "Add internal tool"
git remote add origin https://github.com/company/scoop-bucket
git push -u origin main

# Add custom bucket
scoop bucket add company https://github.com/company/scoop-bucket
scoop install company/my-internal-tool
```

## Popular Buckets
| Bucket | Apps | Purpose |
|--------|------|---------|
| main | ~1000 | Core CLI tools (default) |
| extras | ~1800 | GUI apps, dev tools |
| versions | ~50 | Specific versions (python27, etc.) |
| nerd-fonts | ~200 | Nerd Font families |
| java | ~20 | JDK distributions |

## Best Practices
- **Add extras immediately** — most developer tools live there
- **Use versions bucket** for language version management
- **Custom buckets via Git** — private repos for internal tools
- **Update buckets regularly**: `scoop update`
- **Remove unused buckets**: `scoop bucket rm <name>`

## Common Mistakes
- Not adding extras bucket (can't find common dev tools)
- Creating custom manifests without checkver/autoupdate
- Not updating buckets before searching (stale manifests)
- Adding too many community buckets (slow updates)
