---
id: starship-symbol-conventions
stackId: starship
type: rule
name: Starship Symbol & Style Conventions
description: >-
  Standards for Starship module symbols and colors — Nerd Font icon
  requirements, consistent color schemes, accessibility considerations, and
  fallback symbol definitions.
difficulty: beginner
globs:
  - '**/starship.toml'
tags:
  - symbols
  - nerd-fonts
  - color-scheme
  - accessibility
  - styling
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
  - question: Do I need Nerd Fonts for Starship icons?
    answer: >-
      Nerd Fonts are recommended but not required. Without them, icon symbols
      show as missing characters. Use plain-text fallbacks (git:, node:, py:)
      for compatibility. Popular Nerd Fonts: FiraCode Nerd Font, JetBrainsMono
      Nerd Font, Hack Nerd Font.
  - question: How should I choose colors for Starship modules?
    answer: >-
      Use consistent colors by category: cyan for navigation, purple for git,
      blue for languages, yellow for warnings/cloud, green for success, red for
      errors. Same category = same color keeps the prompt scannable and reduces
      cognitive load.
relatedItems:
  - starship-toml-structure
  - starship-presets
  - starship-prompt-designer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Starship Symbol & Style Conventions

## Rule
All Starship module symbols MUST use Nerd Font icons with plain-text fallbacks. Colors MUST be consistent across module categories and accessible on both light and dark terminals.

## Symbol Standards
```toml
# Use Nerd Font icons with semantic meaning
[git_branch]
symbol = " "     # Git branch icon

[nodejs]
symbol = " "     # Node.js icon

[python]
symbol = " "     # Python icon

[rust]
symbol = "🦀 "    # Rust crab (universal emoji fallback)

[docker_context]
symbol = " "     # Docker icon

[directory]
read_only = " "  # Lock icon for read-only dirs
```

## Color Scheme by Category
| Category | Style | Rationale |
|----------|-------|-----------|
| Directory | bold cyan | Navigation - cool color |
| Git branch | bold purple | VCS - distinct from files |
| Git status (clean) | bold green | Positive state |
| Git status (dirty) | bold red | Attention needed |
| Language | bold blue | Tooling - informational |
| Cloud/Infra | bold yellow | Caution - env awareness |
| Error/Duration | bold yellow | Warning - attention |
| Success | bold green | Positive state |

## Fallback Symbols (No Nerd Font)
```toml
# Plain text alternatives
[git_branch]
symbol = "git:"

[nodejs]
symbol = "node:"

[python]
symbol = "py:"

[character]
success_symbol = "[>](bold green)"
error_symbol = "[x](bold red)"
```

## Good
```toml
# Consistent colors, Nerd Font icons
[nodejs]
symbol = " "
style = "bold blue"

[python]
symbol = " "
style = "bold blue"  # Same category = same color
```

## Bad
```toml
# Random colors, no icons
[nodejs]
style = "bold magenta"

[python]
style = "bold cyan"  # Different color for same category
```
