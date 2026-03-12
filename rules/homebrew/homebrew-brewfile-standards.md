---
id: homebrew-brewfile-standards
stackId: homebrew
type: rule
name: Brewfile Organization Standards
description: >-
  Enforce structured Brewfile formatting with section grouping, tap
  declarations, version pinning for critical tools, and descriptive comments for
  team-shared configurations.
difficulty: beginner
globs:
  - '**/Brewfile'
  - '**/Brewfile.lock.json'
tags:
  - brewfile
  - organization
  - standards
  - version-pinning
  - team-config
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
  - question: How should I organize a Brewfile?
    answer: >-
      Organize into sections: Taps first, then CLI tools, Development tools,
      Databases, Applications (casks), and Fonts. Use comment headers between
      sections. Pin version-sensitive packages (postgresql@16). Add inline
      comments for non-obvious packages.
  - question: Should I pin package versions in Brewfile?
    answer: >-
      Pin databases (postgresql@16, mysql@8.0) and runtimes (python@3.12) —
      their upgrades can break data or applications. CLI tools (git, gh,
      ripgrep) generally don't need pinning as they're backward-compatible.
relatedItems:
  - homebrew-brewfile-design
  - homebrew-system-manager
  - homebrew-no-sudo
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Brewfile Organization Standards

## Rule
All Brewfiles MUST be organized into named sections with comment headers, declare taps explicitly, pin version-sensitive packages, and include purpose comments for non-obvious entries.

## Format
```ruby
# Brewfile — Organized in this order:

# ─── Taps ──────────────────────────────────────────
tap "homebrew/bundle"
tap "homebrew/services"

# ─── CLI Essentials ────────────────────────────────
brew "git"           # Version control
brew "gh"            # GitHub CLI

# ─── Development ───────────────────────────────────
brew "volta"         # Node.js version manager
brew "python@3.12"   # Pinned Python version

# ─── Databases ─────────────────────────────────────
brew "postgresql@16" # Pinned PostgreSQL version
brew "redis"

# ─── Applications ─────────────────────────────────
cask "visual-studio-code"
cask "iterm2"

# ─── Fonts ─────────────────────────────────────────
cask "font-fira-code-nerd-font"
```

## Requirements
1. **Section headers** with comment separators
2. **Taps first** — before any brew/cask entries
3. **Pin versions** for databases and runtimes: `postgresql@16` not `postgresql`
4. **Comments** on non-obvious packages

## Good
```ruby
tap "homebrew/services"
brew "postgresql@16"  # Database — pinned for data compatibility
```

## Bad
```ruby
# No organization, no comments, no version pinning
brew "postgresql"
brew "git"
cask "chrome"
brew "redis"
tap "homebrew/services"
```
