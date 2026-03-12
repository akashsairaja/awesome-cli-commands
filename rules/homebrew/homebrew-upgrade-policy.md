---
id: homebrew-upgrade-policy
stackId: homebrew
type: rule
name: Homebrew Upgrade Safety Policy
description: >-
  Safe upgrade procedures for Homebrew packages — review before upgrading, pin
  critical versions, backup databases before upgrades, and selective upgrade
  patterns.
difficulty: intermediate
globs:
  - '**/Brewfile'
tags:
  - upgrades
  - safety
  - version-pinning
  - database-backup
  - maintenance
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Is it safe to run brew upgrade without arguments?
    answer: >-
      No. Running 'brew upgrade' without arguments upgrades everything,
      including databases that may have breaking data format changes. Always run
      'brew outdated' first, then upgrade selectively by category. Pin databases
      and runtimes to prevent accidental upgrades.
  - question: How do I safely upgrade PostgreSQL via Homebrew?
    answer: >-
      First backup with 'pg_dumpall > backup.sql'. Stop the service, upgrade
      with 'brew upgrade postgresql@16', then restart and verify data. Pin the
      version after to prevent accidental future upgrades. Always test your
      application after database upgrades.
relatedItems:
  - homebrew-brewfile-standards
  - homebrew-maintenance
  - homebrew-system-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Homebrew Upgrade Safety Policy

## Rule
Never run `brew upgrade` without first reviewing outdated packages. Pin version-sensitive tools. Backup databases before upgrading their formulae.

## Safe Upgrade Procedure
```bash
# Step 1: Update definitions
brew update

# Step 2: Review what will change
brew outdated

# Step 3: Upgrade by category
brew upgrade git gh neovim ripgrep    # CLI tools (safe)
brew upgrade volta node               # Runtime tools (test after)
# Do NOT upgrade databases without backup

# Step 4: Verify
brew doctor

# Step 5: Clean
brew cleanup --prune=30
```

## Database Upgrades (High Risk)
```bash
# BEFORE upgrading PostgreSQL:
pg_dumpall > ~/backup/pg_backup_$(date +%Y%m%d).sql
brew services stop postgresql@16
brew upgrade postgresql@16
brew services start postgresql@16
# Verify data integrity
```

## Version Pinning
```bash
# Pin critical versions
brew pin postgresql@16
brew pin python@3.12

# Check pinned packages
brew list --pinned

# Upgrade pinned packages explicitly when ready
brew unpin postgresql@16
brew upgrade postgresql@16
brew pin postgresql@16
```

## Good
```bash
brew outdated           # Review first
brew upgrade git gh     # Selective upgrade
```

## Bad
```bash
brew upgrade            # Upgrades EVERYTHING without review
brew upgrade postgresql # No backup taken first
```
