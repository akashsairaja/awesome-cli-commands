---
id: bash-shellcheck-compliance
stackId: bash
type: rule
name: ShellCheck Compliance Required
description: >-
  All Bash scripts must pass ShellCheck static analysis with zero warnings —
  catch quoting bugs, deprecated syntax, and portability issues before they
  reach production.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/.shellcheckrc'
tags:
  - shellcheck
  - linting
  - static-analysis
  - code-quality
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
  - question: What is ShellCheck and why should I use it?
    answer: >-
      ShellCheck is a static analysis tool for Bash scripts that catches common
      bugs like unquoted variables, deprecated syntax, and portability issues.
      It prevents real-world failures like word splitting bugs that can cause
      data loss. Every CI pipeline running Bash scripts should include
      ShellCheck.
  - question: How do I suppress a ShellCheck warning for a false positive?
    answer: >-
      Add '# shellcheck disable=SCXXXX' on the line before the flagged code,
      with a comment explaining why it is a false positive. Never suppress
      quoting warnings (SC2086) or use blanket disable directives. Create a
      .shellcheckrc file for project-wide configuration.
relatedItems:
  - bash-strict-mode
  - bash-quoting-rules
  - bash-variable-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# ShellCheck Compliance Required

## Rule
All Bash scripts MUST pass ShellCheck with zero warnings. Use inline directives only for documented false positives, never to suppress legitimate issues.

## Format
```bash
# Run ShellCheck on every script
shellcheck script.sh

# Check all scripts in a project
shellcheck **/*.sh
```

## Critical ShellCheck Rules
| Code | Issue | Fix |
|------|-------|-----|
| SC2086 | Unquoted variable | Always quote: "$var" |
| SC2046 | Unquoted command substitution | Quote: "$(cmd)" |
| SC2006 | Legacy backticks | Use $(command) instead |
| SC2064 | Trap with expanding variables | Use single quotes in trap |
| SC2155 | Declare and assign separately | Split: local var; var=$(cmd) |

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

readonly file_path="${1:?Usage: script.sh <file>}"

# Properly quoted variables
if [[ -f "${file_path}" ]]; then
  line_count=$(wc -l < "${file_path}")
  echo "Lines: ${line_count}"
fi

# Proper array handling
files=("file1.txt" "file2.txt" "file 3.txt")
for f in "${files[@]}"; do
  echo "Processing: ${f}"
done
```

## Bad Examples
```bash
#!/bin/bash
# SC2086: Double quote to prevent word splitting
for f in $(ls *.txt); do    # Breaks on spaces in filenames
  cat $f                     # Unquoted variable
done

# SC2006: Use $(...) instead of backticks
count=\`wc -l file.txt\`

# SC2155: Declare and assign separately
local result=$(some_command)  # Masks exit code
```

## Inline Suppressions (Use Sparingly)
```bash
# Acceptable: documented false positive
# shellcheck disable=SC2029
ssh server "echo ${remote_var}"  # Intentionally expanded remotely

# NOT acceptable: suppressing real issues
# shellcheck disable=SC2086
rm -rf $dir  # NEVER suppress quoting warnings
```

## Enforcement
- Install ShellCheck in CI: `apt-get install shellcheck`
- Pre-commit hook: `shellcheck --severity=warning *.sh`
- IDE integration: VS Code ShellCheck extension for real-time linting
