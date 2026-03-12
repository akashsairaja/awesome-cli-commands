---
id: clitools-signal-handling
stackId: clitools
type: rule
name: Proper Signal Handling and Cleanup
description: >-
  CLI tools must handle SIGINT, SIGTERM, and other signals gracefully — clean up
  temporary files, release locks, and exit with appropriate status codes on
  interruption.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/bin/*'
  - '**/cli.*'
tags:
  - signals
  - cleanup
  - trap
  - temporary-files
  - graceful-shutdown
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
  - question: Why must CLI tools handle signals like SIGINT and SIGTERM?
    answer: >-
      Without signal handlers, interrupting a tool (Ctrl+C) or terminating it
      (kill) leaves temporary files, held locks, open connections, and
      background processes behind. This causes disk space leaks, deadlocks on
      subsequent runs, and resource exhaustion. Proper signal handling ensures
      clean shutdown in all exit paths.
  - question: 'What is the difference between trapping EXIT, INT, and TERM?'
    answer: >-
      EXIT fires on any exit (normal, error, or signal). INT fires on Ctrl+C
      (SIGINT). TERM fires on 'kill' (SIGTERM). Trapping EXIT alone covers most
      cases since it fires after signal handlers too. Trap INT separately only
      when you need custom behavior on Ctrl+C (like printing a message).
relatedItems:
  - clitools-exit-codes
  - clitools-help-text
  - bash-strict-mode
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Proper Signal Handling and Cleanup

## Rule
Every CLI tool that creates temporary resources MUST install signal handlers to clean up on SIGINT (Ctrl+C), SIGTERM (kill), and EXIT. Never leave orphaned temp files or held locks.

## Format
```bash
#!/usr/bin/env bash
set -euo pipefail

TEMP_DIR=""

cleanup() {
  local exit_code=$?
  if [[ -n "${TEMP_DIR}" && -d "${TEMP_DIR}" ]]; then
    rm -rf "${TEMP_DIR}"
  fi
  exit "${exit_code}"
}
trap cleanup EXIT INT TERM

main() {
  TEMP_DIR="$(mktemp -d)"
  # Work with temp files safely...
}

main "$@"
```

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

LOCK_FILE=""
PID_FILE=""

cleanup() {
  local exit_code=$?
  # Remove lock file
  [[ -f "${LOCK_FILE}" ]] && rm -f "${LOCK_FILE}"
  # Remove PID file
  [[ -f "${PID_FILE}" ]] && rm -f "${PID_FILE}"
  # Kill background processes
  jobs -p | xargs -r kill 2>/dev/null || true
  exit "${exit_code}"
}
trap cleanup EXIT

on_sigint() {
  echo "" >&2
  echo "Interrupted by user" >&2
  exit 130  # 128 + SIGINT(2)
}
trap on_sigint INT

main() {
  LOCK_FILE="/tmp/mytool.lock"
  if [[ -f "${LOCK_FILE}" ]]; then
    echo "Error: Another instance is running" >&2
    exit 1
  fi
  echo $$ > "${LOCK_FILE}"
  # Long-running operation...
}

main "$@"
```

## Bad Examples
```bash
# BAD: No cleanup — Ctrl+C leaves temp files
TMPFILE=$(mktemp)
process_data > "${TMPFILE}"
mv "${TMPFILE}" output.txt
# If interrupted between mktemp and mv, temp file is orphaned

# BAD: Trap with expanding variables
trap "rm -f $TMPFILE" EXIT  # $TMPFILE expanded NOW, not at trap time
# Should use single quotes: trap 'rm -f "${TMPFILE}"' EXIT
```

## Enforcement
- Code review checklist: verify trap handlers for temp file usage
- ShellCheck SC2064 catches variable expansion in trap strings
- Test interruption: run tool and send SIGINT, verify cleanup occurred
