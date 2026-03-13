---
id: tmux-copy-mode
stackId: tmux
type: skill
name: >-
  Tmux Copy Mode & Clipboard Integration
description: >-
  Master tmux copy mode with vi keybindings — navigate scrollback, select
  text, yank to system clipboard, and integrate with macOS pbcopy, Linux
  xclip, and WSL clip.exe.
difficulty: intermediate
tags:
  - tmux
  - copy
  - mode
  - clipboard
  - integration
  - rag
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Tmux Copy Mode & Clipboard Integration skill?"
    answer: >-
      Master tmux copy mode with vi keybindings — navigate scrollback, select
      text, yank to system clipboard, and integrate with macOS pbcopy, Linux
      xclip, and WSL clip.exe. This skill provides a structured workflow for
      development tasks.
  - question: "What tools and setup does Tmux Copy Mode & Clipboard Integration require?"
    answer: >-
      Requires pip/poetry installed. Works with tmux projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Tmux Copy Mode & Clipboard Integration

## Overview
Tmux copy mode lets you navigate the scrollback buffer, select text, and copy it — all with vi or emacs keybindings. Proper configuration syncs the tmux clipboard with your system clipboard for seamless copy/paste.

## Why This Matters
- **Access scrollback history** — scroll through terminal output
- **Precise text selection** — vi motions for accurate copying
- **System clipboard sync** — copy from tmux, paste anywhere
- **Cross-platform** — works on macOS, Linux, and WSL

## How It Works

### Step 1: Enable Vi Copy Mode
```bash
# ~/.tmux.conf
set -g mode-keys vi

# Enter copy mode with prefix + [
# Navigate with vi keys (hjkl, w, b, /, ?)
# Start selection with v, yank with y
```

### Step 2: Configure Vi-Style Selection
```bash
# ~/.tmux.conf
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel
bind -T copy-mode-vi C-v send-keys -X rectangle-toggle
```

### Step 3: System Clipboard Integration
```bash
# macOS
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "pbcopy"

# Linux (X11)
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "xclip -selection clipboard"

# Linux (Wayland)
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "wl-copy"

# WSL
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "clip.exe"

# Auto-detect platform
if-shell "uname | grep -q Darwin" \
  "bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel 'pbcopy'" \
  "bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel 'xclip -selection clipboard'"
```

### Step 4: Mouse Selection (Optional)
```bash
# Enable mouse support
set -g mouse on

# Mouse drag copies to clipboard automatically
bind -T copy-mode-vi MouseDragEnd1Pane send-keys -X copy-pipe-and-cancel "pbcopy"
```

## Copy Mode Workflow
```
prefix + [     → Enter copy mode
hjkl           → Navigate (vi motions work: w, b, e, 0, $, gg, G)
/pattern       → Search forward
?pattern       → Search backward
v              → Start selection
V              → Select entire line
C-v            → Rectangle (block) selection
y              → Yank (copy) and exit copy mode
q              → Exit copy mode without copying
```

## Using tmux-yank Plugin
```bash
# ~/.tmux.conf — easier clipboard with TPM plugin
set -g @plugin 'tmux-plugins/tmux-yank'

# Automatic clipboard sync with no manual configuration
# Detects macOS/Linux/WSL automatically
```

## Best Practices
- **Use vi mode** — consistent with Vim/Neovim muscle memory
- **Install tmux-yank** for automatic platform detection
- **Enable mouse** as supplement, not replacement for keyboard
- **Increase scrollback**: `set -g history-limit 50000`
- **Search scrollback** with `/` in copy mode instead of manual scrolling

## Common Mistakes
- Not setting mode-keys to vi (stuck with emacs bindings)
- Missing clipboard tool (xclip not installed on Linux)
- Mouse selection not copying to system clipboard
- Scrollback limit too low (default 2000 lines)
