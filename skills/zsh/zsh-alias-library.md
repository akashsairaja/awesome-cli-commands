---
id: zsh-alias-library
stackId: zsh
type: skill
name: Productive Zsh Alias Library
description: >-
  Build a comprehensive Zsh alias library for Git, Docker, npm, navigation, and
  system commands — with suffix aliases, global aliases, and naming conventions.
difficulty: beginner
tags:
  - aliases
  - git-aliases
  - docker-aliases
  - global-aliases
  - productivity
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Zsh 5.8+
faq:
  - question: What are Zsh global aliases?
    answer: >-
      Global aliases (alias -g) expand anywhere in a command line, not just at
      the beginning. For example, 'alias -g G="| grep"' lets you type 'docker ps
      G nginx' which expands to 'docker ps | grep nginx'. They're a
      Zsh-exclusive feature not available in Bash.
  - question: What are Zsh suffix aliases?
    answer: >-
      Suffix aliases (alias -s) auto-execute commands based on file extension.
      'alias -s md=code' means typing './README.md' opens it in VS Code. 'alias
      -s json="jq . <"' pipes JSON files through jq automatically. Another
      Zsh-exclusive feature.
  - question: How many aliases should I define in Zsh?
    answer: >-
      Keep 20-30 aliases for commands you type daily. Organize by tool prefix
      (g=git, d=docker, k=kubectl). If you can't remember an alias, you type it
      fully anyway — so only alias truly frequent commands. Use 'alias | grep
      keyword' to find forgotten aliases.
relatedItems:
  - zsh-config-specialist
  - zsh-custom-functions
  - zsh-completion-config
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Productive Zsh Alias Library

## Overview
Zsh aliases turn long, frequently-typed commands into short keywords. Beyond simple aliases, Zsh supports global aliases (expand anywhere in a command), suffix aliases (open files by extension), and named directory hashes for quick navigation.

## Why This Matters
- **Save keystrokes** — `gst` instead of `git status`
- **Reduce errors** — aliases encode correct flags and options
- **Standardize workflows** — team-shared alias files
- **Zsh-exclusive features** — global and suffix aliases

## Core Alias Patterns

### Git Aliases
```bash
# ~/.zshrc or ~/.zsh/aliases.zsh
alias g="git"
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gcm="git commit -m"
alias gp="git push"
alias gl="git pull"
alias gco="git checkout"
alias gcb="git checkout -b"
alias gd="git diff"
alias gds="git diff --staged"
alias glog="git log --oneline --graph --decorate -20"
alias gst="git stash"
alias gstp="git stash pop"
```

### Docker Aliases
```bash
alias d="docker"
alias dc="docker compose"
alias dcu="docker compose up -d"
alias dcd="docker compose down"
alias dcl="docker compose logs -f"
alias dps="docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"
alias dex="docker exec -it"
alias dprune="docker system prune -af"
```

### Navigation Aliases
```bash
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias ~="cd ~"
alias -- -="cd -"

# Named directory hashes (Zsh-exclusive)
hash -d proj=~/projects
hash -d dots=~/dotfiles
# Usage: cd ~proj  or  ls ~dots
```

### Global Aliases (Expand Anywhere)
```bash
# Zsh-exclusive: expand in any position, not just command position
alias -g G="| grep"
alias -g L="| less"
alias -g H="| head"
alias -g T="| tail"
alias -g J="| jq ."
alias -g C="| wc -l"
alias -g S="| sort"
alias -g U="| sort -u"

# Usage: docker ps G nginx
# Expands to: docker ps | grep nginx
```

### Suffix Aliases (Open by Extension)
```bash
# Zsh-exclusive: auto-open files by extension
alias -s md="code"
alias -s json="jq . <"
alias -s yaml="code"
alias -s log="tail -f"
alias -s git="git clone"

# Usage: just type the filename
# ./README.md  → opens in VS Code
# ./data.json  → pipes through jq
```

## Best Practices
- **Prefix by tool**: `g` for git, `d` for docker, `k` for kubectl
- **Use consistent patterns**: `gs` = git status, `ks` = kubectl status
- **Don't shadow system commands**: use `alias ll` not `alias ls`
- **Split into files**: `~/.zsh/aliases/git.zsh`, `~/.zsh/aliases/docker.zsh`
- **Document aliases**: add comments for team-shared configs
- **Test with `type`**: `type gs` shows what an alias expands to

## Common Mistakes
- Aliasing over system commands without escape (`\command` for original)
- Too many aliases to remember (stick to 20-30 most-used)
- Global aliases in shared scripts (confusing for others)
- Not sourcing alias files from .zshrc after creating them
