---
id: homebrew-brewfile-design
stackId: homebrew
type: skill
name: Brewfile Design for Reproducible Environments
description: >-
  Create comprehensive Brewfiles for reproducible development environments —
  formulae, casks, taps, Mac App Store apps, and VS Code extensions in a
  declarative format.
difficulty: intermediate
tags:
  - homebrew
  - brewfile
  - design
  - reproducible
  - environments
  - security
  - migration
  - docker
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Brewfile Design for Reproducible Environments skill?"
    answer: >-
      Create comprehensive Brewfiles for reproducible development environments
      — formulae, casks, taps, Mac App Store apps, and VS Code extensions in a
      declarative format. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does Brewfile Design for Reproducible Environments require?"
    answer: >-
      Requires Docker, kubectl, Terraform CLI installed. Works with homebrew
      projects. Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Brewfile Design for Reproducible Environments

## Overview
A Brewfile is a declarative list of everything Homebrew should install on your machine. Run `brew bundle` to install everything, `brew bundle cleanup` to remove unlisted packages. It's the foundation of a reproducible macOS development environment.

## Why This Matters
- **One-command setup** — `brew bundle` installs your entire toolchain
- **Team consistency** — everyone gets the same tools and versions
- **Machine migration** — set up a new Mac in minutes, not hours
- **Auditable** — see exactly what's installed and why

## How It Works

### Step 1: Create the Brewfile
```ruby
# ~/Brewfile

# ─── Taps ──────────────────────────────────────────
tap "homebrew/bundle"
tap "homebrew/services"

# ─── CLI Tools ─────────────────────────────────────
brew "git"
brew "gh"                    # GitHub CLI
brew "neovim"
brew "tmux"
brew "starship"              # Cross-shell prompt
brew "fzf"                   # Fuzzy finder
brew "ripgrep"               # Fast grep
brew "fd"                    # Fast find
brew "bat"                   # Better cat
brew "eza"                   # Better ls
brew "jq"                    # JSON processor
brew "yq"                    # YAML processor
brew "httpie"                # HTTP client
brew "tree"
brew "wget"
brew "watch"

# ─── Development ───────────────────────────────────
brew "volta"                 # Node.js version manager
brew "python@3.12"
brew "go"
brew "rust"

# ─── Databases & Services ─────────────────────────
brew "postgresql@16"
brew "redis"

# ─── DevOps / Cloud ───────────────────────────────
brew "docker"
brew "docker-compose"
brew "kubectl"
brew "terraform"
brew "awscli"

# ─── Security ─────────────────────────────────────
brew "gnupg"
brew "pinentry-mac"
brew "gitleaks"

# ─── Cask Applications ────────────────────────────
cask "visual-studio-code"
cask "iterm2"
cask "firefox"
cask "google-chrome"
cask "docker"                # Docker Desktop
cask "raycast"
cask "1password"
cask "slack"
cask "notion"

# ─── Fonts ─────────────────────────────────────────
cask "font-fira-code-nerd-font"
cask "font-jetbrains-mono-nerd-font"

# ─── Mac App Store ─────────────────────────────────
# mas "Xcode", id: 497799835
# mas "Magnet", id: 441258766
```

### Step 2: Install Everything
```bash
# Install all packages from Brewfile
brew bundle

# Install from specific file
brew bundle --file=~/dotfiles/Brewfile

# Check what would be installed
brew bundle check

# List everything not in Brewfile (cleanup candidates)
brew bundle cleanup

# Actually remove unlisted packages
brew bundle cleanup --force
```

### Step 3: Generate Brewfile from Current System
```bash
# Dump current installations to Brewfile
brew bundle dump --file=~/Brewfile --force

# Describe what each formula does
brew bundle dump --describe --file=~/Brewfile
```

## Best Practices
- **Commit Brewfile to dotfiles** — share across machines
- **Use --describe** when dumping to add comments
- **Group by category** with comment headers
- **Run brew bundle check** in CI for team environments
- **Pin versions** for critical tools: `brew "postgresql@16"`
- **Use cleanup** regularly to remove unlisted packages

## Common Mistakes
- Not grouping packages by category (hard to maintain)
- Missing taps that formulae depend on
- Including cask duplicates of brew formulae (docker vs cask docker)
- Not running `brew bundle cleanup` (accumulating unused packages)
- Forgetting to update Brewfile after manual installs
