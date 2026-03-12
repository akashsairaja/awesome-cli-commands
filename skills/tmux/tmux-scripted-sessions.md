---
id: tmux-scripted-sessions
stackId: tmux
type: skill
name: Scripted Tmux Session Creation
description: >-
  Automate tmux workspace creation with shell scripts and tmuxinator — define
  project-specific layouts, window splits, and startup commands for one-command
  environment setup.
difficulty: intermediate
tags:
  - tmux-scripting
  - tmuxinator
  - workspace-automation
  - session-management
  - shell-scripts
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - tmux 3.0+
  - Bash or Zsh
  - 'tmuxinator (optional, install via gem install tmuxinator)'
faq:
  - question: How do I automate tmux session creation?
    answer: >-
      Write a shell script using tmux commands: new-session, new-window,
      split-window, and send-keys. Or use tmuxinator (YAML config) for complex
      layouts. Both approaches let you create your entire workspace with one
      command — named windows, pane splits, and running processes.
  - question: What is tmuxinator and how is it different from tmux scripts?
    answer: >-
      Tmuxinator is a Ruby gem that manages tmux sessions via YAML config files.
      It's easier to read and maintain than shell scripts for complex layouts.
      Install with 'gem install tmuxinator', create with 'tmuxinator new
      project', and launch with 'tmuxinator start project'.
  - question: How do I reattach to a tmux session without creating a duplicate?
    answer: >-
      Use 'tmux has-session -t name' to check existence first. If it exists,
      attach with 'tmux attach -t name'. If not, create it. This pattern
      prevents duplicate sessions and is the standard approach in automation
      scripts.
relatedItems:
  - tmux-session-architect
  - tmux-copy-mode
  - tmux-plugin-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Scripted Tmux Session Creation

## Overview
Instead of manually creating tmux windows and panes every day, script your entire workspace layout. One command creates a named session with all windows, pane splits, and running processes ready to go.

## Why This Matters
- **Reproducible workspaces** — same layout every time
- **One-command startup** — no manual window/pane creation
- **Project-specific** — different layouts for different projects
- **Onboarding** — new team members get the same environment

## How It Works

### Step 1: Shell Script Approach
```bash
#!/bin/bash
# dev-session.sh — Full-stack dev workspace
SESSION="myproject"

# Kill existing session if it exists
tmux kill-session -t $SESSION 2>/dev/null

# Create session with first window (editor)
tmux new-session -d -s $SESSION -n editor
tmux send-keys -t $SESSION:editor "cd ~/projects/myproject && nvim" C-m

# Window 2: Dev server
tmux new-window -t $SESSION -n server
tmux send-keys -t $SESSION:server "cd ~/projects/myproject && npm run dev" C-m

# Window 3: Split pane — database + logs
tmux new-window -t $SESSION -n services
tmux send-keys -t $SESSION:services "docker compose up db redis" C-m
tmux split-window -h -t $SESSION:services
tmux send-keys -t $SESSION:services "tail -f ~/projects/myproject/logs/app.log" C-m

# Window 4: Git + terminal
tmux new-window -t $SESSION -n git
tmux send-keys -t $SESSION:git "cd ~/projects/myproject && git status" C-m
tmux split-window -v -t $SESSION:git
tmux send-keys -t $SESSION:git "cd ~/projects/myproject" C-m

# Select first window and attach
tmux select-window -t $SESSION:editor
tmux attach-session -t $SESSION
```

### Step 2: Tmuxinator Approach
```yaml
# ~/.tmuxinator/myproject.yml
name: myproject
root: ~/projects/myproject

windows:
  - editor:
      layout: main-vertical
      panes:
        - nvim
  - server:
      panes:
        - npm run dev
  - services:
      layout: even-horizontal
      panes:
        - docker compose up db redis
        - tail -f logs/app.log
  - git:
      layout: even-vertical
      panes:
        - git status
        - # empty shell
```

### Step 3: Launch
```bash
# Shell script
chmod +x dev-session.sh
./dev-session.sh

# Tmuxinator
tmuxinator start myproject

# With custom root directory
tmuxinator start myproject root=~/other/path
```

## Advanced: Conditional Session Attach
```bash
#!/bin/bash
# Attach if session exists, create if not
SESSION="myproject"
tmux has-session -t $SESSION 2>/dev/null
if [ $? != 0 ]; then
  # Session doesn't exist — create it
  tmux new-session -d -s $SESSION -n editor
  tmux send-keys -t $SESSION "nvim" C-m
  # ... create other windows ...
fi
tmux attach-session -t $SESSION
```

## Best Practices
- **Name everything** — sessions, windows, and panes by purpose
- **Use C-m** (not Enter) in send-keys for portability
- **Check for existing sessions** before creating new ones
- **Store scripts in dotfiles** repository for portability
- **Use tmuxinator** for complex layouts (YAML is easier to maintain)

## Common Mistakes
- Forgetting `-d` flag on new-session (blocks script execution)
- Not quoting session names with spaces
- Using `Enter` instead of `C-m` in send-keys
- Creating sessions without checking if one already exists
- Hardcoding paths instead of using variables
