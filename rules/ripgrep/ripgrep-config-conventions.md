---
id: ripgrep-config-conventions
stackId: ripgrep
type: rule
name: Ripgrep Configuration File Standards
description: >-
  Use .ripgreprc for consistent search defaults — smart-case sensitivity,
  default file type filters, hidden file handling, and glob exclusions for a
  clean search experience.
difficulty: beginner
globs:
  - '**/.ripgreprc'
  - '**/.rgignore'
tags:
  - ripgreprc
  - configuration
  - search-defaults
  - glob-exclusions
  - smart-case
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: How do I set up a global ripgrep configuration?
    answer: >-
      Create a ~/.ripgreprc file with your preferred defaults (one flag per
      line), then set RIPGREP_CONFIG_PATH=$HOME/.ripgreprc in your shell profile
      (.bashrc, .zshrc). Ripgrep reads this file automatically on every
      invocation. Common defaults include --smart-case, --hidden, and --glob
      exclusions for node_modules and build directories.
  - question: What is the difference between .ripgreprc and .rgignore?
    answer: >-
      .ripgreprc sets global ripgrep options (flags like --smart-case,
      --max-columns). .rgignore is a per-directory file that specifies
      files/directories to skip, using .gitignore syntax. Use .rgignore in
      project roots for project-specific exclusions and .ripgreprc for personal
      preferences.
relatedItems:
  - ripgrep-search-patterns
  - ripgrep-type-filters
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Ripgrep Configuration File Standards

## Rule
Every developer workstation and project SHOULD have a .ripgreprc file with sensible defaults. Set RIPGREP_CONFIG_PATH in your shell profile for global configuration.

## Format
```
# ~/.ripgreprc
--smart-case
--hidden
--glob=!.git/
--glob=!node_modules/
--glob=!.next/
--glob=!dist/
--glob=!coverage/
--max-columns=200
--max-columns-preview
```

## Good Examples
```bash
# ~/.ripgreprc — global config
--smart-case
--hidden
--follow
--glob=!.git/
--glob=!node_modules/
--glob=!.next/
--glob=!dist/
--glob=!build/
--glob=!coverage/
--glob=!*.min.js
--glob=!*.min.css
--glob=!package-lock.json
--glob=!yarn.lock
--glob=!pnpm-lock.yaml
--max-columns=200
--max-columns-preview
--colors=match:fg:yellow
--colors=match:style:bold
```

```bash
# Enable global config in shell profile
export RIPGREP_CONFIG_PATH="$HOME/.ripgreprc"
```

```bash
# Project-specific .rgignore (same syntax as .gitignore)
# .rgignore
node_modules/
dist/
coverage/
*.generated.ts
```

## Bad Examples
```bash
# BAD: No config — constantly typing exclusions
rg "pattern" --glob='!node_modules' --glob='!dist' --glob='!.git'
# Same flags every single time

# BAD: No smart-case — always case-sensitive
rg "error"    # Misses "Error", "ERROR"
# With --smart-case: lowercase = insensitive, uppercase = sensitive
```

## Enforcement
- Set RIPGREP_CONFIG_PATH in team shell profile template
- Use .rgignore in project root for project-specific exclusions
- Document recommended config in project contributing guide
