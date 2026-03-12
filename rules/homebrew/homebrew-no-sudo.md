---
id: homebrew-no-sudo
stackId: homebrew
type: rule
name: Homebrew No-Sudo Policy
description: >-
  Enforce that Homebrew commands are never run with sudo — fix permission issues
  properly, understand the user-space installation model, and resolve common
  permission errors.
difficulty: beginner
globs:
  - '**/Brewfile'
  - '**/.zshrc'
  - '**/.bashrc'
tags:
  - sudo
  - permissions
  - security
  - best-practices
  - ownership
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
  - question: Why should I never use sudo with Homebrew?
    answer: >-
      Homebrew installs to a user-writable prefix (/opt/homebrew or /usr/local).
      Using sudo creates root-owned files that cause permission errors on
      subsequent operations. Fix permissions with 'sudo chown -R $(whoami)
      $(brew --prefix)/*' instead of using sudo brew.
  - question: How do I fix Homebrew permission errors?
    answer: >-
      Run 'sudo chown -R $(whoami) $(brew --prefix)/*' to reset ownership. Then
      run 'brew doctor' to verify. If errors persist, also fix $(brew --cellar)
      and $(brew --caskroom). Never use sudo brew — always fix the underlying
      permission issue.
relatedItems:
  - homebrew-brewfile-standards
  - homebrew-troubleshooter
  - homebrew-system-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Homebrew No-Sudo Policy

## Rule
Homebrew commands MUST NEVER be run with sudo. Permission issues must be resolved by fixing directory ownership, not by elevating privileges.

## Why
Homebrew is designed to run in user space (/opt/homebrew on Apple Silicon, /usr/local on Intel Mac). Using sudo creates root-owned files that cause cascading permission errors.

## Examples

### Good
```bash
brew install git
brew upgrade
brew services start postgresql@16
```

### Bad
```bash
sudo brew install git        # NEVER
sudo brew upgrade             # NEVER
sudo brew services start ...  # NEVER
```

## Fixing Permission Errors
```bash
# Fix Homebrew prefix ownership
sudo chown -R $(whoami) $(brew --prefix)/*

# Fix specific directories
sudo chown -R $(whoami) /opt/homebrew/var/log
sudo chown -R $(whoami) /opt/homebrew/var/run

# Fix Cellar permissions
sudo chown -R $(whoami) $(brew --cellar)

# Verify with brew doctor
brew doctor
```

## If sudo Was Already Used
```bash
# Reset all Homebrew permissions
sudo chown -R $(whoami) $(brew --prefix)
sudo chown -R $(whoami) $(brew --cellar)
sudo chown -R $(whoami) $(brew --caskroom)
sudo chown -R $(whoami) $(brew --prefix)/var/homebrew/linked

# Verify
brew doctor
```
