---
id: tmux-naming-conventions
stackId: tmux
type: rule
name: Tmux Session & Window Naming
description: >-
  Enforce descriptive naming for tmux sessions and windows — project-based
  sessions, purpose-driven window names, and automatic renaming policies.
difficulty: beginner
globs:
  - '**/.tmux.conf'
  - '**/tmux.conf'
  - '**/.tmuxinator/**'
tags:
  - naming
  - sessions
  - windows
  - organization
  - conventions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should I name tmux sessions and windows?
    answer: >-
      Named sessions and windows let you navigate instantly with 'tmux switch -t
      projectname' and see at a glance what each workspace contains. Default
      numeric names (0, 1, 2) become unmanageable with multiple projects. Naming
      is essential for automation scripts too.
  - question: Should I enable or disable automatic window renaming?
    answer: >-
      Disable it with 'set -g allow-rename off' if you prefer manual, stable
      names. Enable it if you want windows to show the current command or
      directory. Most power users disable it because manual names are more
      meaningful than 'vim' or 'node'.
relatedItems:
  - tmux-scripted-sessions
  - tmux-conf-structure
  - tmux-session-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Tmux Session & Window Naming

## Rule
All tmux sessions and windows MUST have descriptive names. Never use default numeric names.

## Session Naming
```bash
# Good: descriptive project/purpose names
tmux new -s myproject
tmux new -s devops
tmux new -s monitoring
tmux new -s notes

# Bad: default or meaningless names
tmux new           # Creates "0"
tmux new -s a      # Not descriptive
tmux new -s test   # Too vague
```

## Window Naming
```bash
# Good: purpose-driven names
tmux rename-window editor
tmux rename-window server
tmux rename-window database
tmux rename-window logs
tmux rename-window git

# Bad: default names
# Window names like "0:bash" or "1:zsh"
```

## Auto-Rename Policy
```bash
# Option 1: Disable auto-rename (keep manual names)
set -g allow-rename off
setw -g automatic-rename off

# Option 2: Auto-rename based on running command (useful for some)
setw -g automatic-rename on
set -g automatic-rename-format '#{b:pane_current_path}'
```

## Naming Patterns
| Session | Windows |
|---------|---------|
| `webapp` | editor, frontend, backend, db, logs |
| `devops` | terraform, k8s, monitoring, docs |
| `personal` | notes, dotfiles, scratch |

## Script Integration
```bash
# Always name in automation scripts
tmux new-session -d -s "$PROJECT_NAME" -n editor
tmux new-window -t "$PROJECT_NAME" -n server
tmux new-window -t "$PROJECT_NAME" -n git
```

## Good
```bash
tmux new -s webapp -n editor
# Session: webapp, Window: editor — instantly identifiable
```

## Bad
```bash
tmux new
# Session: 0, Window: 0:bash — meaningless
```
