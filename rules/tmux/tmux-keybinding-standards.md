---
id: tmux-keybinding-standards
stackId: tmux
type: rule
name: Tmux Keybinding Conventions
description: >-
  Standards for tmux key bindings — consistent split keys, vi-style pane
  navigation, current-path preservation, and ergonomic prefix key selection.
difficulty: beginner
globs:
  - '**/.tmux.conf'
  - '**/tmux.conf'
tags:
  - keybindings
  - vi-style
  - pane-navigation
  - ergonomics
  - tmux-bindings
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
  - question: What are the best tmux keybindings for splits?
    answer: >-
      Use | for vertical splits and - for horizontal splits — they're visually
      mnemonic. Always add -c '#{pane_current_path}' to preserve the working
      directory. The default % and " bindings are non-intuitive and should be
      replaced.
  - question: Should I use Vim-style navigation in tmux?
    answer: >-
      Yes. Bind h/j/k/l for pane navigation to match Vim muscle memory. Even
      better, install vim-tmux-navigator to seamlessly move between Vim splits
      and tmux panes with the same Ctrl+h/j/k/l keys.
relatedItems:
  - tmux-conf-structure
  - tmux-session-architect
  - vim-keymapping-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Tmux Keybinding Conventions

## Rule
All custom tmux keybindings MUST be ergonomic, consistent, and preserve the current working directory for splits and new windows.

## Required Bindings

### Splits Must Preserve Path
```bash
# Good: preserves current directory
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
bind c new-window -c "#{pane_current_path}"

# Bad: opens in home directory
bind | split-window -h
bind - split-window -v
```

### Pane Navigation (Vi-Style)
```bash
# Good: consistent with Vim
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Better: with vim-tmux-navigator (seamless Vim/tmux)
set -g @plugin 'christoomey/vim-tmux-navigator'
```

### Pane Resizing
```bash
# Good: uppercase = resize, repeatable
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5
```

### Config Reload
```bash
# Good: instant feedback
bind r source-file ~/.tmux.conf \; display "Config reloaded!"
```

## Mnemonic Keys
| Binding | Mnemonic | Action |
|---------|----------|--------|
| `|` | Visual pipe | Vertical split |
| `-` | Visual dash | Horizontal split |
| `h/j/k/l` | Vi motions | Pane navigation |
| `r` | Reload | Source tmux.conf |
| `z` | Zoom | Toggle pane zoom |

## Good
```bash
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
```

## Bad
```bash
# Default % and " are not mnemonic
bind % split-window -h  # What does % mean for horizontal?
bind '"' split-window -v # Confusing
```
