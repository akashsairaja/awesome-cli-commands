---
id: starship-module-config
stackId: starship
type: skill
name: Starship Module Configuration Guide
description: >-
  Configure essential Starship modules — directory truncation, git branch and
  status, language versions, command duration, and custom module formatting in
  starship.toml.
difficulty: beginner
tags:
  - starship-modules
  - toml-config
  - prompt-setup
  - git-status
  - language-detection
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - 'Starship installed (curl -sS https://starship.rs/install.sh | sh)'
  - Nerd Font installed (recommended)
faq:
  - question: How do I configure Starship prompt modules?
    answer: >-
      Create ~/.config/starship.toml and add module sections like [git_branch],
      [nodejs], [directory]. Each module has format, style, and detection
      options. Use the top-level 'format' key to control module order. Modules
      auto-activate when relevant files are detected.
  - question: Which Starship modules should I enable?
    answer: >-
      Always enable: directory, git_branch, git_status, character, cmd_duration.
      Enable language modules (nodejs, python, rust) only for languages you use.
      Enable cloud modules (aws, gcloud) only when relevant. Fewer modules =
      faster prompt.
  - question: How do I control the order of Starship modules?
    answer: >-
      Set the 'format' key at the top of starship.toml: format =
      '$directory$git_branch$git_status$nodejs$cmd_duration$line_break$character'.
      Modules appear in the order listed. Use $line_break for multi-line
      prompts.
relatedItems:
  - starship-prompt-designer
  - starship-git-integration
  - starship-presets
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Starship Module Configuration Guide

## Overview
Starship prompts are built from modules — each showing a piece of contextual information. This skill covers configuring the most useful modules with optimal settings for developer workflows.

## Why This Matters
- **Contextual awareness** — see git status, language version, and cloud profile at a glance
- **Customizable** — each module has format, style, and detection options
- **Performance** — disable unused modules for faster prompts

## How It Works

### Step 1: Create starship.toml
```bash
mkdir -p ~/.config && touch ~/.config/starship.toml
```

### Step 2: Configure Core Modules
```toml
# ~/.config/starship.toml

# Prompt format (module order)
format = """
$directory$git_branch$git_status$nodejs$python$rust$docker_context$cmd_duration$line_break$character"""

# Directory
[directory]
truncation_length = 3
truncation_symbol = ".../"
style = "bold cyan"

# Git branch
[git_branch]
format = "[$symbol$branch(:$remote_branch)]($style) "
symbol = " "
style = "bold purple"

# Git status
[git_status]
format = '([[$all_status$ahead_behind]]($style) )'
style = "bold red"
conflicted = "="
ahead = "⇡${count}"
behind = "⇣${count}"
diverged = "⇕⇡${ahead_count}⇣${behind_count}"
untracked = "?${count}"
stashed = "$${count}"
modified = "!${count}"
staged = "+${count}"
deleted = "✘${count}"

# Node.js
[nodejs]
format = "[$symbol($version)]($style) "
symbol = " "
detect_files = ["package.json", ".node-version"]
detect_extensions = ["js", "mjs", "cjs", "ts"]

# Python
[python]
format = '[$symbol${pyenv_prefix}(${version})( \($virtualenv\))]($style) '
symbol = " "

# Command duration (only show for slow commands)
[cmd_duration]
min_time = 2000  # 2 seconds
format = "[$duration]($style) "
style = "bold yellow"

# Prompt character
[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"
```

### Step 3: Initialize in Shell
```bash
# Zsh (~/.zshrc)
eval "$(starship init zsh)"

# Bash (~/.bashrc)
eval "$(starship init bash)"

# Fish (~/.config/fish/config.fish)
starship init fish | source
```

## Module Categories

### Always Enabled
| Module | Purpose |
|--------|---------|
| directory | Current path |
| git_branch | Branch name |
| git_status | Modified/staged/ahead |
| character | Success/error indicator |
| cmd_duration | Slow command alert |

### Enable Per-Need
| Module | When |
|--------|------|
| nodejs, python, rust, go | Language projects |
| docker_context | Docker development |
| aws, gcloud | Cloud projects |
| kubernetes | K8s clusters |
| terraform | IaC projects |

## Best Practices
- **Set format string** to control module order explicitly
- **Use truncation** for directory paths (3 segments max)
- **Show cmd_duration only for slow commands** (> 2 seconds)
- **Disable unused language modules** — they add scan time
- **Use Nerd Font symbols** for compact, visual module labels

## Common Mistakes
- Not creating starship.toml (uses defaults for everything)
- Enabling all modules (slow, noisy prompt)
- Missing Nerd Font (icons show as boxes/question marks)
- Not setting min_time for cmd_duration (shows for every command)
