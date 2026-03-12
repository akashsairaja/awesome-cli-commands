---
id: tmux-conf-structure
stackId: tmux
type: rule
name: tmux.conf Configuration Standards
description: >-
  Enforce organized tmux.conf structure with logical sections, sensible
  defaults, consistent keybindings, and proper plugin initialization order.
difficulty: beginner
globs:
  - '**/.tmux.conf'
  - '**/tmux.conf'
  - '**/.tmux/**'
tags:
  - tmux-conf
  - configuration
  - standards
  - organization
  - defaults
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
  - question: What should the section order be in tmux.conf?
    answer: >-
      Follow this order: General Settings, Prefix Key, Key Bindings, Copy Mode,
      Status Bar, Plugins, Plugin Settings, TPM Initialization (must be last).
      Use comment separators between sections for readability.
  - question: Why must TPM initialization be the last line in tmux.conf?
    answer: >-
      TPM reads the plugin list from tmux.conf and initializes them. If the 'run
      ~/.tmux/plugins/tpm/tpm' line appears before plugin definitions or
      settings, those plugins won't be loaded. Always keep it as the very last
      line.
relatedItems:
  - tmux-session-architect
  - tmux-plugin-setup
  - tmux-keybinding-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# tmux.conf Configuration Standards

## Rule
All tmux configurations MUST follow a consistent section order, use sensible defaults, and properly initialize TPM at the end of the file.

## Format
```bash
# ~/.tmux.conf — Organized in this exact order:

# ─── General Settings ──────────────────────────────
set -g default-terminal "tmux-256color"
set -ag terminal-overrides ",xterm-256color:RGB"
set -g escape-time 0
set -g history-limit 50000
set -g mouse on
set -g base-index 1
setw -g pane-base-index 1
set -g renumber-windows on
set -g focus-events on

# ─── Prefix Key ────────────────────────────────────
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# ─── Key Bindings ──────────────────────────────────
bind r source-file ~/.tmux.conf \; display "Reloaded!"
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# ─── Copy Mode ─────────────────────────────────────
set -g mode-keys vi
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "pbcopy"

# ─── Status Bar ────────────────────────────────────
set -g status-position top
set -g status-interval 5

# ─── Plugins ───────────────────────────────────────
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'

# ─── Plugin Settings ──────────────────────────────
# (plugin-specific options go here)

# ─── Initialize TPM (MUST BE LAST LINE) ───────────
run '~/.tmux/plugins/tpm/tpm'
```

## Requirements
1. **Section headers** with comment separators for readability
2. **escape-time 0** — eliminates delay when pressing Escape
3. **base-index 1** — windows and panes start at 1, not 0
4. **renumber-windows on** — no gaps when closing middle windows
5. **TPM init at the very bottom** — plugins break otherwise

## Good
```bash
# Clear section with comment header
# ─── Key Bindings ──────────────────────────────────
bind | split-window -h -c "#{pane_current_path}"
```

## Bad
```bash
# No sections, random order
set -g mouse on
bind | split-window -h
set -g base-index 1
run '~/.tmux/plugins/tpm/tpm'  # NOT at the bottom!
set -g prefix C-a
```
