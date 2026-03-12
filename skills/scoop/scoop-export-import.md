---
id: scoop-export-import
stackId: scoop
type: skill
name: Scoop Export & Import for Reproducible Environments
description: >-
  Create reproducible Windows environments with Scoop export/import — backup
  installed apps, share configurations across machines, and automate environment
  provisioning.
difficulty: beginner
tags:
  - scoop-export
  - reproducible
  - environment-setup
  - windows-provisioning
  - backup
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Scoop installed on Windows
  - PowerShell 5.1+
faq:
  - question: How do I backup my Scoop packages?
    answer: >-
      Run 'scoop export > ~/scoop-packages.json' to create a JSON snapshot of
      all installed apps, buckets, and versions. Store this file in your
      dotfiles repository. Restore on any machine with 'scoop import
      ~/scoop-packages.json'.
  - question: What is the Windows equivalent of a Brewfile?
    answer: >-
      Scoop's export JSON file serves the same purpose as Homebrew's Brewfile.
      Run 'scoop export' to generate it. It lists all buckets and installed apps
      with versions. Import with 'scoop import' on a new machine for
      reproducible environments.
relatedItems:
  - scoop-environment-manager
  - scoop-bucket-management
  - scoop-automation-agent
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scoop Export & Import for Reproducible Environments

## Overview
Scoop's export/import feature creates a JSON snapshot of your installed apps, buckets, and versions. Share this file to reproduce your exact environment on any Windows machine — the equivalent of Homebrew's Brewfile.

## Why This Matters
- **Machine migration** — recreate your environment on a new PC
- **Team consistency** — everyone gets the same tools
- **Disaster recovery** — rebuild after a Windows reset
- **Onboarding** — new team members set up in minutes

## How It Works

### Step 1: Export Current Environment
```powershell
# Export to JSON
scoop export > ~/scoop-packages.json

# View the export
cat ~/scoop-packages.json
```

The export file looks like:
```json
{
  "buckets": [
    { "Name": "main", "Source": "https://github.com/ScoopInstaller/Main" },
    { "Name": "extras", "Source": "https://github.com/ScoopInstaller/Extras" }
  ],
  "apps": [
    { "Name": "git", "Source": "main", "Version": "2.44.0" },
    { "Name": "nodejs", "Source": "main", "Version": "21.7.0" },
    { "Name": "neovim", "Source": "main", "Version": "0.9.5" }
  ]
}
```

### Step 2: Import on New Machine
```powershell
# Install Scoop first (if not installed)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# Import packages
scoop import ~/scoop-packages.json
```

### Step 3: Bootstrap Script
```powershell
# bootstrap.ps1 — Full environment setup
$ErrorActionPreference = "Stop"

# Install Scoop if needed
if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
    Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
}

# Install Git first (required for buckets)
scoop install git

# Add buckets
scoop bucket add extras
scoop bucket add versions
scoop bucket add nerd-fonts

# Install core tools
scoop install neovim fzf ripgrep fd bat eza jq starship
scoop install nodejs python go rust

# Install fonts
scoop install nerd-fonts/FiraCode-NF

Write-Host "Environment setup complete!" -ForegroundColor Green
```

## Best Practices
- **Export regularly** — keep the JSON file in your dotfiles repo
- **Include a bootstrap script** — handles Scoop installation + import
- **Test imports on clean machines** — verify reproducibility
- **Version your export** — commit to Git after significant changes
- **Separate team vs personal** — team-export.json vs personal-export.json

## Common Mistakes
- Not installing git before adding buckets (Git is required for buckets)
- Exporting without updating first (includes outdated versions)
- Not testing import on a clean machine
- Missing bucket declarations in bootstrap scripts
