---
id: bash-strict-mode
stackId: bash
type: rule
name: Always Enable Strict Mode
description: >-
  Every Bash script must begin with strict mode flags — set -euo pipefail — to
  catch errors early, prevent undefined variable usage, and propagate pipeline
  failures.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/bashrc'
  - '**/bash_profile'
tags:
  - strict-mode
  - error-handling
  - pipefail
  - set-e
  - bash-safety
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
  - question: Why is set -euo pipefail important in Bash scripts?
    answer: >-
      Without strict mode, Bash silently ignores errors, undefined variables
      expand to empty strings (potentially catastrophic with rm -rf), and
      pipeline failures are hidden. set -euo pipefail catches these issues
      immediately, preventing scripts from continuing in a broken state.
  - question: How do I handle expected command failures with set -e enabled?
    answer: >-
      Use '|| true' to allow a specific command to fail (grep pattern || true),
      use if-blocks for conditional checks (if grep -q pattern file; then ...),
      or use 'set +e' temporarily around a section that may fail, capturing the
      exit code manually.
relatedItems:
  - bash-shellcheck-compliance
  - bash-quoting-rules
  - bash-variable-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Always Enable Strict Mode

## Rule
Every Bash script MUST start with `set -euo pipefail` immediately after the shebang line. No exceptions for production scripts.

## Format
```bash
#!/usr/bin/env bash
set -euo pipefail
```

## What Each Flag Does
| Flag | Effect | Without It |
|------|--------|------------|
| `-e` | Exit on any command failure | Script continues after errors |
| `-u` | Error on undefined variables | Undefined vars silently expand to empty |
| `-o pipefail` | Pipeline fails if ANY command fails | Only last command's exit code matters |

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

readonly LOG_DIR="/var/log/myapp"
readonly BACKUP_DIR="/backups"

main() {
  echo "Starting backup..."
  mkdir -p "${BACKUP_DIR}"
  tar czf "${BACKUP_DIR}/data.tar.gz" /data
  echo "Backup complete"
}

main "$@"
```

## Bad Examples
```bash
#!/bin/bash
# BAD: No strict mode — errors silently ignored

LOG_DIR="/var/log/myapp"
rm -rf $LOGDIR    # Typo: $LOGDIR is undefined, expands to empty
                   # Without -u, this becomes: rm -rf (dangerous!)

cat /nonexistent/file | wc -l
# Without pipefail, exit code is 0 (wc succeeds)
# The cat failure is silently swallowed
```

## Handling Expected Failures
```bash
set -euo pipefail

# Use || true for commands allowed to fail
grep "pattern" file.txt || true

# Use if-blocks for conditional logic
if grep -q "pattern" file.txt; then
  echo "Found"
fi

# Temporarily disable for a section (avoid if possible)
set +e
risky_command
exit_code=$?
set -e
```

## Enforcement
- Add ShellCheck to CI: `shellcheck -e SC2086 script.sh`
- Use a project-wide script template with strict mode pre-filled
- Pre-commit hook to verify `set -euo pipefail` presence in all .sh files
