---
id: zsh-completion-config
stackId: zsh
type: skill
name: Zsh Completion System Configuration
description: >-
  Configure Zsh's powerful completion system (compsys) — enable rich tab
  completion for commands, customize matching rules, add completions for
  custom functions, and optimize compinit performance.
difficulty: beginner
tags:
  - zsh
  - completion
  - system
  - configuration
  - deployment
  - docker
  - best-practices
  - refactoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Zsh Completion System Configuration skill?"
    answer: >-
      Configure Zsh's powerful completion system (compsys) — enable rich tab
      completion for commands, customize matching rules, add completions for
      custom functions, and optimize compinit performance. This skill provides
      a structured workflow for development tasks.
  - question: "What tools and setup does Zsh Completion System Configuration require?"
    answer: >-
      Requires Docker, pip/poetry installed. Works with zsh projects. Review
      the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Zsh Completion System Configuration

## Overview
Zsh's completion system (compsys) is the most powerful tab completion engine in any shell. It provides context-aware suggestions for commands, flags, file paths, git branches, Docker containers, and more. Proper configuration transforms tab into a productivity multiplier.

## Why This Matters
- **Context-aware** — different completions for different arguments
- **Rich descriptions** — shows what each flag/option does
- **Fuzzy matching** — finds completions even with typos
- **Custom completions** — add tab completion for your own functions

## How It Works

### Step 1: Initialize Completion
```bash
# ~/.zshrc — basic setup
autoload -Uz compinit
compinit

# Faster: only recompute once per day
autoload -Uz compinit
if [[ -n ~/.zcompdump(#qN.mh+24) ]]; then
  compinit
else
  compinit -C  # Use cached dump
fi
```

### Step 2: Configure Completion Behavior
```bash
# Case-insensitive matching
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'

# Partial word completion
zstyle ':completion:*' matcher-list '' 'm:{a-z}={A-Z}' '+l:|=* r:|=*'

# Menu selection (navigate with arrows)
zstyle ':completion:*' menu select

# Colorize completions
zstyle ':completion:*' list-colors "${(s.:.)LS_COLORS}"

# Group completions by type
zstyle ':completion:*' group-name ''
zstyle ':completion:*:descriptions' format '%B%F{green}── %d ──%f%b'

# Cache completions (faster for slow commands like apt, pip)
zstyle ':completion:*' use-cache on
zstyle ':completion:*' cache-path ~/.zsh/cache
```

### Step 3: Command-Specific Configuration
```bash
# Kill: show process list with colors
zstyle ':completion:*:*:kill:*:processes' list-colors '=(#b) #([0-9]#)*=0=01;31'
zstyle ':completion:*:kill:*' command 'ps -u $USER -o pid,%cpu,tty,cputime,cmd'

# SSH: complete hostnames from config
zstyle ':completion:*:ssh:*' hosts $(grep '^Host' ~/.ssh/config | awk '{print $2}')

# Docker: complete container names
zstyle ':completion:*:docker:*' option-stacking yes

# Git: show branch descriptions
zstyle ':completion:*:git-checkout:*' sort false
```

### Step 4: Custom Function Completion
```bash
# Completion for the gbr function
_gbr() {
  local -a types
  types=(
    'feat:New feature'
    'fix:Bug fix'
    'chore:Maintenance task'
    'refactor:Code restructure'
    'docs:Documentation'
    'test:Test addition'
  )
  _arguments \
    '1:branch type:((${types}))' \
    '*:description:'
}
compdef _gbr gbr

# Completion for a deploy function
_deploy() {
  _arguments \
    '(-e --env)'{-e,--env}'[Target environment]:environment:(staging production)' \
    '(-t --tag)'{-t,--tag}'[Deploy tag]:tag:_git_tags' \
    '(-f --force)'{-f,--force}'[Force deployment]' \
    '(-h --help)'{-h,--help}'[Show help]'
}
compdef _deploy deploy
```

## Best Practices
- **Use compinit caching** — check dump age, rebuild once per day
- **Enable menu select** — arrow-key navigation through completions
- **Configure case-insensitive** matching — saves keystrokes
- **Cache slow completions** — pip, apt, and network-heavy commands
- **Add completions for custom functions** — makes them feel like real commands

## Common Mistakes
- Calling `compinit` multiple times (slow startup)
- Not caching compdump (recomputes every shell start)
- Missing `autoload -Uz compinit` before `compinit`
- Over-configuring zstyle (diminishing returns past basics)
