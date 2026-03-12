---
id: scoop-version-management
stackId: scoop
type: rule
name: Scoop Version Management Rules
description: >-
  Rules for managing tool versions with Scoop — hold critical versions, use the
  versions bucket, handle side-by-side installations, and safe upgrade
  procedures.
difficulty: beginner
globs:
  - '**/scoop/**'
tags:
  - version-management
  - hold
  - pinning
  - safe-updates
  - versions-bucket
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How do I prevent Scoop from updating a specific package?
    answer: >-
      Use 'scoop hold <package>' to prevent updates. Check held packages with
      'scoop list | Select-String Held'. When ready to update, use 'scoop unhold
      <package>', update it, then re-hold. This is equivalent to 'brew pin' in
      Homebrew.
  - question: How do I install a specific version of a tool with Scoop?
    answer: >-
      Add the versions bucket with 'scoop bucket add versions', then install the
      specific version like 'scoop install versions/python310' or 'scoop install
      versions/nodejs-lts'. Switch between versions with 'scoop reset' to update
      shims.
relatedItems:
  - scoop-no-admin
  - scoop-cleanup-maintenance
  - scoop-environment-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scoop Version Management Rules

## Rule
Version-sensitive tools MUST be held to prevent automatic upgrades. Use the versions bucket for specific version requirements. Always check status before updating.

## Version Pinning
```powershell
# Hold critical tools
scoop hold nodejs
scoop hold python

# Check held packages
scoop list | Select-String "Held"

# Release when ready to update
scoop unhold nodejs
scoop update nodejs
scoop hold nodejs
```

## Versions Bucket
```powershell
# Install specific versions
scoop bucket add versions
scoop install versions/python310    # Python 3.10
scoop install versions/nodejs-lts   # Node.js LTS

# Switch between versions
scoop reset python310    # Use Python 3.10
scoop reset python       # Use latest Python
```

## Safe Update Procedure
```powershell
# 1. Check what's outdated
scoop status

# 2. Update by category
scoop update git gh ripgrep    # CLI tools (safe)
# scoop update nodejs          # Runtime (test after)
# scoop update python          # Runtime (test after)

# 3. Verify
scoop status
scoop checkup
```

## Good
```powershell
scoop status                    # Review first
scoop hold nodejs               # Pin version
scoop update git gh ripgrep     # Selective update
```

## Bad
```powershell
scoop update *                  # Updates everything blindly
# Node.js major version bumps, Python breaks, chaos
```
