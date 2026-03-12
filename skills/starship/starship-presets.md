---
id: starship-presets
stackId: starship
type: skill
name: Starship Preset Themes & Custom Layouts
description: >-
  Use and customize Starship presets — apply built-in themes, create two-line
  prompts, design right-prompts, and build team-shareable configuration files.
difficulty: intermediate
tags:
  - starship-presets
  - themes
  - prompt-layout
  - right-prompt
  - two-line-prompt
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Starship installed
  - Nerd Font (for icon presets)
faq:
  - question: How do I use Starship presets?
    answer: >-
      Run 'starship preset --list' to see available themes, then 'starship
      preset nerd-font-symbols -o ~/.config/starship.toml' to apply one. Presets
      provide complete configurations — customize from there by editing
      individual module sections in the TOML file.
  - question: How do I create a two-line Starship prompt?
    answer: >-
      Add '$line_break' in your format string where you want the line break. Put
      context info (directory, git, language) on line 1 and the input character
      on line 2. This gives you maximum information without crowding the command
      input area.
relatedItems:
  - starship-module-config
  - starship-prompt-designer
  - starship-git-integration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Starship Preset Themes & Custom Layouts

## Overview
Starship ships with community presets for quick theming, and supports advanced layout features like two-line prompts, right-prompts, and transient prompts. This skill covers using presets as starting points and customizing layouts for your workflow.

## Why This Matters
- **Quick start** — presets provide complete, polished configurations
- **Two-line prompts** — more info without crowding the command line
- **Right-prompt** — show secondary info on the right side
- **Team sharing** — distribute standard prompt configs

## How It Works

### Step 1: Apply a Built-in Preset
```bash
# List available presets
starship preset --list

# Apply a preset (overwrites starship.toml)
starship preset nerd-font-symbols -o ~/.config/starship.toml
starship preset plain-text-symbols -o ~/.config/starship.toml
starship preset bracketed-segments -o ~/.config/starship.toml
```

### Step 2: Two-Line Prompt Layout
```toml
# Line 1: context info | Line 2: input prompt
format = """
$directory$git_branch$git_status$nodejs$python$cmd_duration$line_break$character"""

[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"
```

### Step 3: Right-Prompt
```toml
# Show time and duration on the right side
right_format = """$cmd_duration$time"""

[time]
disabled = false
format = "[$time]($style) "
style = "dimmed white"
time_format = "%H:%M"

[cmd_duration]
min_time = 2000
format = "[$duration]($style) "
style = "bold yellow"
```

### Step 4: Minimal DevOps Preset
```toml
# Focused on infrastructure context
format = """
$directory$git_branch$git_status$kubernetes$aws$terraform$docker_context$cmd_duration$line_break$character"""

[kubernetes]
format = '[$symbol$context( \($namespace\))]($style) '
symbol = "⎈ "
disabled = false

[aws]
format = '[$symbol($profile)( \($region\))]($style) '
symbol = "☁️ "
style = "bold orange"

[terraform]
format = '[$symbol$workspace]($style) '
symbol = "💠 "
```

### Step 5: Minimal Speed Preset
```toml
# Ultra-fast: only essential info
format = "$directory$git_branch$character"

[directory]
truncation_length = 2
style = "bold blue"

[git_branch]
format = "[$branch]($style) "
style = "bold green"

[character]
success_symbol = "[>](bold green)"
error_symbol = "[>](bold red)"
```

## Sharing Configurations
```bash
# Store in dotfiles repo
cp ~/.config/starship.toml ~/dotfiles/starship.toml

# Symlink on new machines
ln -sf ~/dotfiles/starship.toml ~/.config/starship.toml

# Or use STARSHIP_CONFIG env var
export STARSHIP_CONFIG=~/dotfiles/starship.toml
```

## Best Practices
- **Start from a preset** — customize from there, don't build from zero
- **Use two-line prompts** when you have 4+ modules enabled
- **Put timing on the right** — keeps input area clean
- **Share via dotfiles** — symlink or STARSHIP_CONFIG env var
- **Test in different directories** — ensure modules activate correctly

## Common Mistakes
- Applying presets without backing up current config
- Two-line prompts without $line_break in format string
- Right-prompt with too many modules (distracting)
- Not testing preset in repos with different languages
