---
id: bash-error-handling-strict
stackId: bash
type: skill
name: Bash Strict Mode & Error Handling
description: >-
  Write robust Bash scripts with strict mode (set -euo pipefail), trap handlers
  for cleanup, proper error messages, and exit code conventions for production
  automation.
difficulty: beginner
tags:
  - strict-mode
  - error-handling
  - trap
  - pipefail
  - exit-codes
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - bash
  - shell
prerequisites:
  - Bash 4.0+
faq:
  - question: What does set -euo pipefail do in Bash?
    answer: >-
      set -e exits on command failure. set -u errors on unset variables. set -o
      pipefail makes pipeline failure propagate (without it, 'bad_cmd |
      good_cmd' returns success). Together they transform Bash from
      silently-continuing-on-errors to fail-fast behavior, essential for
      reliable scripts.
  - question: How do I clean up temporary files if a Bash script fails?
    answer: >-
      Use 'trap cleanup EXIT' — the cleanup function runs when the script exits
      for ANY reason: success, error, or signal (Ctrl+C). In cleanup, remove
      temp files, kill background processes, and restore state. Always use
      mktemp for temporary files and store the path for cleanup.
  - question: Why should I quote all variables in Bash?
    answer: >-
      Unquoted variables undergo word splitting and glob expansion. If
      VAR='hello world', then $VAR becomes two arguments, while "$VAR" stays
      one. If DIR is empty, 'rm -rf $DIR/*' expands to 'rm -rf /*' which deletes
      everything. Always use "$var" unless you specifically want splitting.
relatedItems:
  - bash-argument-parsing
  - bash-posix-portability
  - bash-shellcheck-compliance
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Bash Strict Mode & Error Handling

## Overview
Bash scripts silently continue after failures by default. Strict mode changes this behavior, making scripts fail fast on errors, undefined variables, and pipeline failures.

## Why This Matters
- **Fail fast** — catch errors immediately instead of cascading silently
- **No silent failures** — unset variables cause errors, not empty strings
- **Pipeline safety** — catch failures in any command of a pipeline
- **Production reliability** — scripts behave predictably in CI/CD

## Step 1: Enable Strict Mode
```bash
#!/usr/bin/env bash
set -euo pipefail

# What each flag does:
# -e  Exit immediately when a command fails
# -u  Treat unset variables as errors
# -o pipefail  Pipeline returns failure if ANY command fails
```

## Step 2: Trap for Cleanup
```bash
#!/usr/bin/env bash
set -euo pipefail

TEMP_DIR=""

cleanup() {
  local exit_code=$?
  if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
    echo "Cleaned up temp directory"
  fi
  exit "$exit_code"
}
trap cleanup EXIT  # Runs on ANY exit (success, error, signal)

TEMP_DIR=$(mktemp -d)
echo "Working in $TEMP_DIR"
# ... do work ...
# cleanup runs automatically when script ends
```

## Step 3: Error Reporting
```bash
#!/usr/bin/env bash
set -euo pipefail

# Log with timestamp and severity
log() {
  local level="$1"
  shift
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" >&2
}

info()  { log "INFO" "$@"; }
warn()  { log "WARN" "$@"; }
error() { log "ERROR" "$@"; }

die() {
  error "$@"
  exit 1
}

# Usage
info "Starting deployment"
command -v docker >/dev/null 2>&1 || die "Docker is not installed"
info "Docker found"
```

## Step 4: Exit Code Conventions
```bash
# Standard exit codes
# 0  Success
# 1  General error
# 2  Usage error (wrong arguments)
# 126  Command not executable
# 127  Command not found
# 130  Interrupted (Ctrl+C)

main() {
  if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <environment>" >&2
    exit 2
  fi

  local env="$1"
  case "$env" in
    prod|staging|dev) deploy "$env" ;;
    *) die "Unknown environment: $env" ;;
  esac
}

main "$@"
```

## Step 5: Safe Variable Defaults
```bash
# With -u enabled, unset variables cause errors
# Use defaults for optional variables
PORT="${PORT:-8080}"
LOG_LEVEL="${LOG_LEVEL:-info}"
VERBOSE="${VERBOSE:-false}"

# Required variables — check explicitly
: "${DATABASE_URL:?ERROR: DATABASE_URL is required}"
: "${API_KEY:?ERROR: API_KEY is required}"
```

## Best Practices
- Always start with `set -euo pipefail`
- Use `trap cleanup EXIT` for guaranteed cleanup
- Use `${VAR:-default}` for optional variables
- Use `${VAR:?error message}` for required variables
- Use `die()` function for fatal errors with messages
- Log to stderr (`>&2`), output data to stdout

## Common Mistakes
- Not using strict mode (scripts continue after failures)
- Not quoting variables (`$var` instead of `"$var"`)
- Using `rm -rf $DIR` with unset DIR (deletes /)
- Not cleaning up temp files on error
- Ignoring exit codes from critical commands
