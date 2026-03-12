---
id: bash-variable-conventions
stackId: bash
type: rule
name: Variable Naming and Declaration Standards
description: >-
  Enforce consistent variable naming in Bash — lowercase snake_case for locals,
  UPPER_SNAKE_CASE for exports, readonly for constants, and local declarations
  inside functions.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
tags:
  - variables
  - naming-conventions
  - readonly
  - local
  - snake-case
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
  - question: Why should I use lowercase for Bash local variables?
    answer: >-
      UPPER_SNAKE_CASE is reserved by convention for exported environment
      variables and shell built-ins (PATH, HOME, USER). Using uppercase for
      local variables risks colliding with these. Lowercase snake_case clearly
      indicates a variable is script-local and avoids accidental overrides of
      system variables.
  - question: Why must I use the local keyword inside Bash functions?
    answer: >-
      Without 'local', variables declared inside functions are global — they
      leak into the calling scope and can overwrite variables with the same
      name. This causes extremely hard-to-debug issues. Always declare function
      variables with 'local' to prevent scope leakage.
relatedItems:
  - bash-strict-mode
  - bash-quoting-rules
  - bash-shellcheck-compliance
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Variable Naming and Declaration Standards

## Rule
Use lowercase snake_case for local variables, UPPER_SNAKE_CASE for exported environment variables, `readonly` for constants, and `local` for all function-scoped variables.

## Format
```bash
# Constants (readonly, UPPER_SNAKE_CASE)
readonly MAX_RETRIES=3
readonly LOG_FILE="/var/log/app.log"

# Local script variables (lowercase snake_case)
file_count=0
current_user="$(whoami)"

# Exported variables (UPPER_SNAKE_CASE)
export DATABASE_URL="postgres://localhost/mydb"

# Function-local variables (local keyword)
my_function() {
  local result=""
  local temp_file
  temp_file="$(mktemp)"
}
```

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

# Constants at the top
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly CONFIG_FILE="${SCRIPT_DIR}/config.yml"
readonly MAX_RETRIES=5

# Function with local variables
process_file() {
  local file_path="${1:?Missing file path}"
  local line_count
  line_count="$(wc -l < "${file_path}")"

  local output_dir="/tmp/processed"
  mkdir -p "${output_dir}"

  echo "Processed ${line_count} lines from ${file_path}"
}

# Main script variables
total_files=0
error_count=0
```

## Bad Examples
```bash
# BAD: No readonly for constants
MAX=5               # Can be accidentally overwritten

# BAD: No local in functions
do_work() {
  result="done"     # Leaks to global scope!
  temp=$(mktemp)    # Global variable — never cleaned up
}

# BAD: Inconsistent naming
myVar="hello"       # camelCase
File_Path="/tmp"    # Mixed case
LOCALVAR="test"     # UPPER for non-exported local
```

## POSIX Compatibility Note
```bash
# If targeting POSIX sh (not bash), local is not available
# Use naming prefixes instead:
_my_func__result=""  # Convention for function scope
```

## Enforcement
- ShellCheck catches many variable issues (SC2155, SC2034)
- Code review checklist: verify local keyword in all functions
- Grep for undeclared function variables in CI
