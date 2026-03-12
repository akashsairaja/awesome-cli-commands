---
id: clitools-exit-codes
stackId: clitools
type: rule
name: Standard Exit Code Conventions
description: >-
  CLI tools must use proper exit codes — 0 for success, 1 for general errors, 2
  for usage errors — to enable reliable scripting, pipelines, and automation.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/bin/*'
  - '**/cli.*'
tags:
  - exit-codes
  - error-handling
  - cli-standards
  - scripting
  - pipelines
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
  - question: Why are correct exit codes important for CLI tools?
    answer: >-
      Exit codes are the primary way scripts and CI/CD pipelines detect success
      or failure. If a tool exits 0 on error, every downstream step proceeds as
      if nothing went wrong. Correct exit codes enable reliable automation,
      conditional chaining (&&, ||), and proper error propagation in complex
      pipelines.
  - question: What is the difference between exit code 1 and exit code 2?
    answer: >-
      Exit code 1 indicates a general runtime error (file not found, network
      failure, processing error). Exit code 2 indicates a usage error — the user
      invoked the tool incorrectly with bad arguments, missing flags, or invalid
      options. This distinction helps callers decide whether to retry or fix the
      invocation.
relatedItems:
  - clitools-signal-handling
  - clitools-help-text
  - bash-strict-mode
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Standard Exit Code Conventions

## Rule
Every CLI tool MUST exit with meaningful exit codes. Exit 0 on success, 1 on general failure, 2 on usage errors. Never exit 0 when an error occurred.

## Standard Exit Codes
| Code | Meaning | When to Use |
|------|---------|-------------|
| 0 | Success | Command completed successfully |
| 1 | General error | Runtime failures, exceptions |
| 2 | Usage error | Invalid arguments, missing flags |
| 126 | Cannot execute | Permission denied |
| 127 | Command not found | Dependency missing |
| 128+N | Signal N | Killed by signal (e.g., 130 = Ctrl+C) |

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

main() {
  if [[ $# -lt 1 ]]; then
    echo "Usage: $(basename "$0") <filename>" >&2
    exit 2  # Usage error
  fi

  local file="${1}"
  if [[ ! -f "${file}" ]]; then
    echo "Error: File not found: ${file}" >&2
    exit 1  # General error
  fi

  process_file "${file}"
  exit 0  # Explicit success
}

main "$@"
```

## Bad Examples
```bash
# BAD: Exit 0 on error — breaks pipelines
if ! process_file "${file}"; then
  echo "Error processing file"
  exit 0  # Callers think this succeeded!
fi

# BAD: No exit code — relies on last command
echo "Done"
# If prior command failed silently, exit code is unpredictable

# BAD: Using random exit codes
exit 42  # What does 42 mean? Undocumented
```

## Using Exit Codes in Pipelines
```bash
# Callers depend on correct exit codes
if my-tool --validate config.yml; then
  echo "Config is valid"
else
  echo "Config validation failed (exit: $?)"
  exit 1
fi

# Conditional chaining
my-tool build && my-tool deploy || echo "Pipeline failed"
```

## Enforcement
- Test exit codes in CI: `my-tool --bad-flag; test $? -eq 2`
- Document exit codes in --help output
- Never silence errors with `|| true` in production scripts
