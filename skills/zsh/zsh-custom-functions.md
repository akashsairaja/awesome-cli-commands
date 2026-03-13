---
id: zsh-custom-functions
stackId: zsh
type: skill
name: Custom Zsh Functions for Developer Workflows
description: >-
  Create powerful Zsh shell functions with argument parsing, error handling,
  and interactive features for project management, git workflows, and system
  automation.
difficulty: intermediate
tags:
  - zsh
  - custom
  - functions
  - developer
  - workflows
  - docker
  - refactoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Custom Zsh Functions for Developer Workflows skill?"
    answer: >-
      Create powerful Zsh shell functions with argument parsing, error
      handling, and interactive features for project management, git
      workflows, and system automation. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Custom Zsh Functions for Developer Workflows require?"
    answer: >-
      Requires Docker installed. Works with zsh projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Custom Zsh Functions for Developer Workflows

## Overview
Zsh functions go beyond aliases — they accept arguments, use conditionals, loop over data, and handle errors. They're the building blocks for personal CLI tools that automate your daily development workflow.

## Why This Matters
- **Parameterized shortcuts** — `mkpr "feature title"` creates a PR
- **Error handling** — validate inputs, show usage, exit gracefully
- **Interactive menus** — select from options with Zsh select/fzf
- **Complex workflows** — multiple commands with logic

## Core Functions

### Quick Project Navigation
```bash
# Jump to project by fuzzy name
proj() {
  local dir
  dir=$(find ~/projects -maxdepth 2 -type d -name ".git" 2>/dev/null |     sed 's|/.git||' | fzf --height 40% --reverse)
  [[ -n "$dir" ]] && cd "$dir"
}
```

### Git Branch Creator
```bash
# Create branch with type prefix
gbr() {
  if [[ $# -lt 2 ]]; then
    echo "Usage: gbr <type> <description>"
    echo "Types: feat, fix, chore, refactor, docs, test"
    return 1
  fi
  local type="$1"
  shift
  local desc="${(j:-:)@:l}"  # Join args with hyphens, lowercase
  git checkout -b "${type}/${desc}"
}
# Usage: gbr feat user avatar upload
# Creates: feat/user-avatar-upload
```

### Port Finder & Killer
```bash
# Find and optionally kill process on a port
port() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: port <number> [kill]"
    return 1
  fi
  local pid
  pid=$(lsof -ti ":$1" 2>/dev/null)
  if [[ -z "$pid" ]]; then
    echo "No process on port $1"
    return 0
  fi
  echo "Port $1: PID $pid ($(ps -p $pid -o comm= 2>/dev/null))"
  if [[ "$2" == "kill" ]]; then
    kill -9 "$pid" && echo "Killed PID $pid"
  fi
}
# Usage: port 3000        → shows process
#        port 3000 kill   → kills it
```

### Docker Shell
```bash
# Interactive shell into running container
dsh() {
  local container
  container=$(docker ps --format '{{.Names}}' | fzf --height 40% --reverse)
  [[ -n "$container" ]] && docker exec -it "$container" sh -c     'if command -v bash > /dev/null; then bash; else sh; fi'
}
```

### Extract Any Archive
```bash
# Unified extract command
extract() {
  if [[ ! -f "$1" ]]; then
    echo "File not found: $1"
    return 1
  fi
  case "$1" in
    *.tar.bz2) tar xjf "$1" ;;
    *.tar.gz)  tar xzf "$1" ;;
    *.tar.xz)  tar xJf "$1" ;;
    *.bz2)     bunzip2 "$1" ;;
    *.gz)      gunzip "$1" ;;
    *.tar)     tar xf "$1" ;;
    *.tbz2)    tar xjf "$1" ;;
    *.tgz)     tar xzf "$1" ;;
    *.zip)     unzip "$1" ;;
    *.7z)      7z x "$1" ;;
    *.rar)     unrar x "$1" ;;
    *) echo "Unknown format: $1"; return 1 ;;
  esac
}
```

## Function Writing Patterns
```bash
# Template for well-structured functions
myfunction() {
  emulate -L zsh              # Consistent Zsh behavior
  local usage="Usage: myfunction [-v] <arg>"

  # Argument parsing
  local verbose=false
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -v|--verbose) verbose=true; shift ;;
      -h|--help) echo "$usage"; return 0 ;;
      -*) echo "Unknown option: $1"; return 1 ;;
      *) break ;;
    esac
  done

  # Validation
  if [[ $# -eq 0 ]]; then
    echo "$usage" >&2
    return 1
  fi

  # Implementation
  $verbose && echo "Processing: $1"
  # ... actual work ...
}
```

## Best Practices
- **Use `local` for all variables** — avoid polluting global scope
- **Validate arguments** — check `$#` and provide usage messages
- **Use `emulate -L zsh`** at the top for consistent behavior
- **Return exit codes** — 0 for success, 1 for errors
- **Integrate fzf** for interactive selection from lists
- **Keep under 30 lines** — split complex logic into helper functions

## Common Mistakes
- Missing `local` on variables (leaks to global scope)
- No usage message when arguments are missing
- Using `echo` for errors (use `echo >&2` for stderr)
- Not quoting variables (`"$1"` not `$1`)
