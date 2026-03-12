---
id: starship-toml-structure
stackId: starship
type: rule
name: starship.toml Organization Standards
description: >-
  Enforce structured starship.toml configuration with explicit format string,
  grouped module sections, consistent styling, and documented module choices.
difficulty: beginner
globs:
  - '**/starship.toml'
  - '**/.config/starship.toml'
tags:
  - starship-toml
  - configuration
  - organization
  - structure
  - formatting
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
  - question: How should I organize my starship.toml file?
    answer: >-
      Start with the format string (controls module order), then Global
      Settings, Core Modules (character, directory), Git Modules, Language
      Modules, Cloud/Tool Modules, and finally Disabled Modules. Use comment
      headers between groups for readability.
  - question: Should I use an explicit format string in starship.toml?
    answer: >-
      Yes. Without an explicit format string, Starship uses its default module
      order which includes many modules you may not want. An explicit format
      gives you control over which modules appear and in what order, improving
      both performance and readability.
relatedItems:
  - starship-module-config
  - starship-prompt-designer
  - starship-performance
version: 1.0.0
lastUpdated: '2026-03-11'
---

# starship.toml Organization Standards

## Rule
All starship.toml files MUST have an explicit format string, organized module sections, and consistent styling conventions.

## Format
```toml
# ~/.config/starship.toml

# ─── Prompt Format (MUST be first) ────────────────
format = """
$directory$git_branch$git_status$nodejs$python$cmd_duration$line_break$character"""

# ─── Global Settings ──────────────────────────────
command_timeout = 500
scan_timeout = 30

# ─── Core Modules ─────────────────────────────────
[character]
success_symbol = "[❯](bold green)"
error_symbol = "[❯](bold red)"

[directory]
truncation_length = 3
style = "bold cyan"

# ─── Git Modules ──────────────────────────────────
[git_branch]
format = "[$symbol$branch]($style) "

[git_status]
format = '([[$all_status$ahead_behind]]($style) )'

# ─── Language Modules ─────────────────────────────
[nodejs]
format = "[$symbol($version)]($style) "

[python]
format = "[$symbol($version)]($style) "

# ─── Disabled Modules ─────────────────────────────
[aws]
disabled = true

[gcloud]
disabled = true
```

## Requirements
1. **format string at top** — explicit module order, not implicit
2. **Grouped sections** — Core, Git, Language, Cloud, Disabled
3. **Explicit disable** — disabled modules listed, not just absent
4. **Comment headers** between groups

## Good
```toml
# Explicit format, organized sections
format = "$directory$git_branch$character"

[directory]
truncation_length = 3
```

## Bad
```toml
# No format string, random order, no comments
[python]
symbol = "py "
[directory]
truncation_length = 5
[git_branch]
style = "red"
```
