---
id: zsh-startup-performance
stackId: zsh
type: rule
name: Zsh Startup Performance Rules
description: >-
  Performance rules for Zsh startup time — lazy-loading heavy tools, plugin
  limits, compinit caching, and profiling requirements to maintain sub-200ms
  shell initialization.
difficulty: intermediate
globs:
  - '**/.zshrc'
  - '**/.zprofile'
  - '**/.zshenv'
tags:
  - performance
  - startup-time
  - lazy-loading
  - profiling
  - optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How do I profile Zsh startup time?
    answer: >-
      Add 'zmodload zsh/zprof' to the top of .zshrc and 'zprof' to the bottom.
      Open a new shell to see a breakdown of time per function. For total time,
      use 'time zsh -i -c exit'. Target under 200ms for a snappy experience.
  - question: Why is my Zsh shell slow to start?
    answer: >-
      Common causes: nvm/pyenv loaded eagerly (300-800ms each), too many Oh My
      Zsh plugins (15+), compinit rebuilding every time, and heavy completion
      scripts. Fix with lazy-loading, plugin limits (5-8), compinit caching, and
      profiling with zprof.
relatedItems:
  - zsh-zshrc-organization
  - zsh-config-specialist
  - zsh-alias-library
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Zsh Startup Performance Rules

## Rule
Zsh interactive shell startup MUST complete in under 200ms. Heavy tools (nvm, pyenv, conda, kubectl completions) MUST be lazy-loaded.

## Performance Budget
| Component | Max Time |
|-----------|----------|
| Total startup | < 200ms |
| compinit | < 30ms |
| Oh My Zsh plugins (combined) | < 100ms |
| Single plugin | < 20ms |
| Prompt init | < 20ms |

## Measurement
```bash
# Measure total startup time
time zsh -i -c exit

# Profile with zprof
# Add to TOP of .zshrc:
zmodload zsh/zprof
# Add to BOTTOM of .zshrc:
zprof
```

## Lazy-Loading Pattern
```bash
# Good: nvm loaded on first use (saves ~500ms)
lazy_load_nvm() {
  unset -f nvm node npm npx
  export NVM_DIR="$HOME/.nvm"
  [[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"
}
nvm() { lazy_load_nvm; nvm "$@"; }
node() { lazy_load_nvm; node "$@"; }
npm() { lazy_load_nvm; npm "$@"; }
npx() { lazy_load_nvm; npx "$@"; }

# Bad: loaded eagerly (adds 500ms+)
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
```

## Plugin Limits
```bash
# Good: 5-8 essential plugins
plugins=(git z fzf zsh-autosuggestions zsh-syntax-highlighting)

# Bad: 15+ plugins
plugins=(git docker kubectl aws npm yarn python ruby rails
         z fzf zsh-autosuggestions zsh-syntax-highlighting
         colored-man-pages web-search encode64)
```

## Compinit Caching
```bash
# Good: rebuild once per day
autoload -Uz compinit
if [[ -n ~/.zcompdump(#qN.mh+24) ]]; then
  compinit
else
  compinit -C
fi

# Bad: rebuild every startup
autoload -Uz compinit && compinit
```

## Good
```bash
# Profile output shows < 200ms total
# num  calls   time            self            name
# 1)   1       15.20   45.00%  15.20   45.00%  compinit
# 2)   1        8.30   24.56%   8.30   24.56%  _zsh_highlight
```

## Bad
```bash
# Profile output shows > 500ms
# num  calls   time            self            name
# 1)   1      520.00   65.00%  520.00  65.00%  nvm_auto
# 2)   1      180.00   22.50%  180.00  22.50%  compinit
```
