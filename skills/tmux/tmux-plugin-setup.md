---
id: tmux-plugin-setup
stackId: tmux
type: skill
name: Tmux Plugin Manager (TPM) Setup
description: >-
  Install and configure TPM for tmux plugin management — essential plugins for
  session persistence, clipboard integration, status themes, and pane
  navigation.
difficulty: intermediate
tags:
  - tmux
  - plugin
  - manager
  - tpm
  - setup
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
  - question: "When should I use the Tmux Plugin Manager (TPM) Setup skill?"
    answer: >-
      Install and configure TPM for tmux plugin management — essential plugins
      for session persistence, clipboard integration, status themes, and pane
      navigation. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Tmux Plugin Manager (TPM) Setup require?"
    answer: >-
      Works with standard tmux tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Tmux Plugin Manager (TPM) Setup

## Overview
TPM (Tmux Plugin Manager) automates tmux plugin installation, updates, and cleanup. It's the standard way to extend tmux with community plugins for session persistence, better copy/paste, status bar themes, and Vim-tmux integration.

## Why This Matters
- **One-command plugin install** — prefix + I installs all listed plugins
- **Easy updates** — prefix + U updates all plugins
- **Community ecosystem** — hundreds of pre-built tmux extensions
- **Session persistence** — survive reboots with tmux-resurrect

## How It Works

### Step 1: Install TPM
```bash
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm
```

### Step 2: Configure Plugins in tmux.conf
```bash
# ~/.tmux.conf

# List of plugins
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @plugin 'tmux-plugins/tmux-yank'
set -g @plugin 'christoomey/vim-tmux-navigator'

# Plugin settings
set -g @resurrect-capture-pane-contents 'on'
set -g @continuum-restore 'on'
set -g @continuum-save-interval '15'

# Initialize TPM (MUST be at the very bottom of tmux.conf)
run '~/.tmux/plugins/tpm/tpm'
```

### Step 3: Install Plugins
```bash
# Inside tmux, press:
# prefix + I    (capital I = Install)

# Or from command line:
~/.tmux/plugins/tpm/bin/install_plugins
```

### Step 4: Manage Plugins
```bash
# Update all plugins
# prefix + U

# Remove unlisted plugins
# prefix + alt + u

# From command line
~/.tmux/plugins/tpm/bin/update_plugins all
~/.tmux/plugins/tpm/bin/clean_plugins
```

## Essential Plugin Stack

### tmux-sensible (sane defaults)
```bash
set -g @plugin 'tmux-plugins/tmux-sensible'
# Sets: utf-8, focus-events, escape-time 0, history-limit 50000
```

### tmux-resurrect (session save/restore)
```bash
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @resurrect-strategy-nvim 'session'  # Restore Neovim sessions
set -g @resurrect-capture-pane-contents 'on'
# prefix + Ctrl+s = save, prefix + Ctrl+r = restore
```

### tmux-continuum (auto save/restore)
```bash
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @continuum-restore 'on'       # Auto-restore on tmux start
set -g @continuum-save-interval '15' # Save every 15 minutes
```

### vim-tmux-navigator (seamless pane navigation)
```bash
set -g @plugin 'christoomey/vim-tmux-navigator'
# Ctrl+h/j/k/l moves between Vim splits AND tmux panes seamlessly
```

## Best Practices
- **TPM init must be last line** in tmux.conf — plugins won't load otherwise
- **Start with tmux-sensible** — it sets sane defaults for everyone
- **Always use resurrect + continuum** — session persistence is non-negotiable
- **Keep plugin count low** — 5-8 plugins maximum
- **Source after changes**: `tmux source-file ~/.tmux.conf`

## Common Mistakes
- Putting TPM initialization before plugin list (nothing loads)
- Forgetting to press prefix + I after adding new plugins
- Not running `git clone` for TPM before first use
- Installing too many theme/status plugins that conflict
