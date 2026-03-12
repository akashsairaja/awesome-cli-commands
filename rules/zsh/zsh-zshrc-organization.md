---
id: zsh-zshrc-organization
stackId: zsh
type: rule
name: .zshrc Organization Standards
description: >-
  Enforce a structured, modular .zshrc configuration with logical sections,
  sourced files, startup performance targets, and consistent formatting.
difficulty: beginner
globs:
  - '**/.zshrc'
  - '**/.zsh/**'
  - '**/.zshenv'
  - '**/.zprofile'
tags:
  - zshrc
  - organization
  - modular
  - configuration
  - shell-config
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
  - question: How should I organize my .zshrc file?
    answer: >-
      Keep .zshrc under 200 lines with sections: Environment, Plugin Manager,
      Completion, History, Source External Files, Lazy-Loaded Tools, Prompt.
      Move aliases to ~/.zsh/aliases.zsh and functions to ~/.zsh/functions.zsh.
      Use conditional sourcing for safety.
  - question: Should I put everything in .zshrc or split into files?
    answer: >-
      Split into files. Keep .zshrc as a loader that sources ~/.zsh/aliases.zsh,
      ~/.zsh/functions.zsh, and ~/.zsh/local.zsh (machine-specific, gitignored).
      This keeps each file focused and makes dotfiles portable across machines.
relatedItems:
  - zsh-config-specialist
  - zsh-alias-library
  - zsh-startup-performance
version: 1.0.0
lastUpdated: '2026-03-11'
---

# .zshrc Organization Standards

## Rule
The .zshrc file MUST be organized into logical sections, stay under 200 lines, and source external files for aliases, functions, and tool-specific configuration.

## Format
```bash
# ~/.zshrc — Master configuration (< 200 lines)

# ─── Environment ───────────────────────────────────
export EDITOR="nvim"
export LANG="en_US.UTF-8"
export PATH="$HOME/.local/bin:$PATH"

# ─── Oh My Zsh / Plugin Manager ───────────────────
export ZSH="$HOME/.oh-my-zsh"
plugins=(git docker z fzf zsh-autosuggestions)
source $ZSH/oh-my-zsh.sh

# ─── Completion ────────────────────────────────────
autoload -Uz compinit && compinit -C
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'

# ─── History ───────────────────────────────────────
HISTSIZE=50000
SAVEHIST=50000
setopt SHARE_HISTORY HIST_IGNORE_DUPS HIST_IGNORE_SPACE

# ─── Source External Files ─────────────────────────
[[ -f ~/.zsh/aliases.zsh ]] && source ~/.zsh/aliases.zsh
[[ -f ~/.zsh/functions.zsh ]] && source ~/.zsh/functions.zsh
[[ -f ~/.zsh/local.zsh ]] && source ~/.zsh/local.zsh

# ─── Lazy-Loaded Tools ────────────────────────────
# (nvm, pyenv, rbenv — loaded on first use)

# ─── Prompt (last) ────────────────────────────────
eval "$(starship init zsh)"
```

## File Structure
```
~/.zsh/
├── aliases.zsh     # All aliases
├── functions.zsh   # Custom functions
├── completions.zsh # Custom completions
└── local.zsh       # Machine-specific (gitignored)
```

## Good
```bash
# Conditional sourcing (safe if file missing)
[[ -f ~/.zsh/aliases.zsh ]] && source ~/.zsh/aliases.zsh
```

## Bad
```bash
# 500-line .zshrc with everything inline
# No sections, no comments, no sourced files
alias gs="git status"
alias ga="git add"
# ... 200 more aliases ...
function proj() { ... }
# ... 100 more lines ...
```
