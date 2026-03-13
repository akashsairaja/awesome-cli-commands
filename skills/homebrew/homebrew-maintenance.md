---
id: homebrew-maintenance
stackId: homebrew
type: skill
name: >-
  Homebrew Maintenance & Cleanup
description: >-
  Keep Homebrew healthy with regular maintenance — safe upgrades, cleanup
  routines, doctor diagnostics, pinning critical versions, and disk space
  recovery.
difficulty: intermediate
tags:
  - homebrew
  - maintenance
  - cleanup
  - security
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
  - question: "When should I use the Homebrew Maintenance & Cleanup skill?"
    answer: >-
      Keep Homebrew healthy with regular maintenance — safe upgrades, cleanup
      routines, doctor diagnostics, pinning critical versions, and disk space
      recovery. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Homebrew Maintenance & Cleanup require?"
    answer: >-
      Works with standard homebrew tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Homebrew Maintenance & Cleanup

## Overview
Regular Homebrew maintenance prevents broken installations, frees disk space, and keeps your toolchain current. This skill covers safe upgrade workflows, cleanup routines, and diagnostic commands.

## Why This Matters
- **Disk space** — old versions accumulate (10GB+ without cleanup)
- **Security** — outdated packages have known vulnerabilities
- **Stability** — regular maintenance prevents cascading failures
- **Reproducibility** — keep Brewfile in sync with actual state

## Maintenance Routine

### Weekly: Update and Check
```bash
# Update Homebrew itself and formula definitions
brew update

# See what's outdated
brew outdated

# Check system health
brew doctor
```

### Monthly: Upgrade and Clean
```bash
# Upgrade all packages (review first!)
brew outdated               # Check what will upgrade
brew upgrade                # Upgrade everything

# Or upgrade selectively
brew upgrade git gh neovim  # Only specific packages

# Clean up old versions
brew cleanup --prune=30     # Remove versions older than 30 days
brew autoremove             # Remove unused dependencies

# Sync Brewfile
brew bundle dump --file=~/Brewfile --describe --force
```

### Diagnostic Commands
```bash
# Full system health check
brew doctor

# Show configuration
brew config

# List installed packages with sizes
brew list --formula | xargs brew info --json | jq -r '.[] | "\(.name): \(.installed[0].installed_on_request)"'

# Find disk usage
du -sh $(brew --cellar)     # Formula storage
du -sh $(brew --caskroom)   # Cask storage

# Check dependencies of a formula
brew deps --tree postgresql@16
brew uses --installed git    # What depends on git
```

### Pinning Critical Versions
```bash
# Pin to prevent accidental upgrades
brew pin postgresql@16
brew pin node@20

# List pinned packages
brew list --pinned

# Unpin when ready to upgrade
brew unpin postgresql@16
```

## Safe Upgrade Workflow
```bash
# 1. Update formula definitions
brew update

# 2. Review what will change
brew outdated

# 3. Upgrade specific categories
brew upgrade git gh neovim tmux  # CLI tools (safe)
# brew upgrade postgresql@16     # Databases (caution — backup first!)

# 4. Verify nothing broke
brew doctor

# 5. Clean up
brew cleanup --prune=30
brew autoremove
```

## Best Practices
- **Never upgrade everything blindly** — review `brew outdated` first
- **Pin database versions** — data format changes can break things
- **Run `brew doctor` after upgrades** — catch issues early
- **Clean up monthly** — old versions waste 10GB+
- **Update Brewfile** after changes — keep it in sync
- **Backup databases** before upgrading database formulae

## Common Mistakes
- Running `brew upgrade` without checking what's outdated
- Not cleaning up (disk space waste)
- Ignoring `brew doctor` warnings until they cause failures
- Upgrading databases without backing up data first
- Not pinning critical tool versions
