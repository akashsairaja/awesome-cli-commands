---
id: scoop-no-admin
stackId: scoop
type: rule
name: Scoop User-Space Installation Policy
description: >-
  Enforce user-space Scoop installation — no admin privileges, no system-wide
  installs, proper directory structure, and correct execution policy
  configuration.
difficulty: beginner
globs:
  - '**/scoop/**'
  - '**/*.ps1'
tags:
  - user-space
  - no-admin
  - installation
  - permissions
  - windows-security
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
  - question: Why should Scoop not be installed as administrator?
    answer: >-
      Scoop is designed for user-space operation. Admin installation changes
      system PATH, creates files owned by the admin account, and can cause
      permission issues for normal operations. User-space installation works on
      locked-down machines and allows clean removal.
  - question: Can I use Scoop on a corporate machine without admin?
    answer: >-
      Yes, that's a primary use case. Scoop installs to ~/scoop in user space.
      The only prerequisite is PowerShell execution policy set to RemoteSigned
      for the current user scope, which doesn't require admin privileges.
relatedItems:
  - scoop-environment-manager
  - scoop-export-import
  - scoop-manifest-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scoop User-Space Installation Policy

## Rule
Scoop MUST be installed and operated in user space. Never use administrator privileges. Never install to system directories.

## Installation
```powershell
# Good: user-space installation
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Bad: admin/system installation
# Do NOT run PowerShell as Administrator for Scoop
```

## Directory Structure
```
~/scoop/                    # Default root (USERPROFILE/scoop)
├── apps/                   # Installed applications
│   ├── scoop/             # Scoop itself
│   ├── git/               # Example app
│   └── nodejs/
├── buckets/               # Bucket repositories
├── cache/                 # Downloaded files
├── persist/               # Persistent app data
└── shims/                 # PATH shim executables
```

## Good
```powershell
# Normal user context
scoop install git nodejs neovim
scoop update *
```

## Bad
```powershell
# Running as Administrator — NEVER
# Changes system PATH, creates admin-owned files
scoop install --global git  # Avoid global installs
```

## Why User-Space
- No admin password prompts
- Works on locked-down corporate machines
- Clean uninstall (delete ~/scoop)
- No system PATH pollution
- Multiple users can have different installations
