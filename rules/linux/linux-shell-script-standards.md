---
id: linux-shell-script-standards
stackId: linux
type: rule
name: Shell Script Safety Standards
description: >-
  Write safe shell scripts — set -euo pipefail, proper quoting, shellcheck
  compliance, error handling, and portable POSIX patterns for reliable
  automation scripts.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/bin/**'
tags:
  - shell-scripting
  - bash
  - shellcheck
  - safety
  - error-handling
  - linux
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
  - question: What does set -euo pipefail do in bash scripts?
    answer: >-
      set -e exits the script if any command returns a non-zero exit code (fail
      fast). set -u treats undefined variables as errors (prevents typos). set
      -o pipefail makes pipe commands fail if any command in the pipe fails, not
      just the last one. Together they prevent silent failures that cause data
      loss or corruption.
  - question: Why should I always quote variables in shell scripts?
    answer: >-
      Unquoted variables undergo word splitting and pathname expansion
      (globbing). If DIR is empty, 'rm -rf $DIR/' becomes 'rm -rf /' which
      deletes everything. If USER_INPUT contains spaces, it splits into multiple
      arguments. Always use double quotes: "$DIR" prevents these dangerous
      behaviors.
relatedItems:
  - linux-system-administrator
  - linux-file-permission-rules
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Shell Script Safety Standards

## Rule
All shell scripts MUST start with set -euo pipefail, use proper quoting, and pass shellcheck validation.

## Format
```bash
#!/usr/bin/env bash
set -euo pipefail
```

## Requirements

### 1. Always Set Strict Mode
```bash
#!/usr/bin/env bash
set -euo pipefail

# set -e: Exit immediately if any command fails
# set -u: Error on undefined variables
# set -o pipefail: Pipe fails if any command in pipe fails
```

### 2. Always Quote Variables
```bash
# BAD: Unquoted variables — word splitting and globbing
rm -rf $DIR/$FILE         # If DIR is empty, this becomes rm -rf /
echo $USER_INPUT          # Globbing can expand wildcards

# GOOD: Double-quoted variables
rm -rf "${DIR:?}/${FILE:?}"   # :? errors if empty
echo "${USER_INPUT}"
```

### 3. Use Shellcheck
```bash
# Install and run shellcheck on all scripts
shellcheck myscript.sh

# In CI:
# shellcheck **/*.sh
```

### 4. Proper Error Handling
```bash
#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  echo "Cleaning up temporary files..."
  rm -rf "${TMPDIR:-}"
}
trap cleanup EXIT ERR

TMPDIR=$(mktemp -d)
echo "Working in ${TMPDIR}"
```

### 5. Use Functions for Organization
```bash
#!/usr/bin/env bash
set -euo pipefail

log_info() { echo "[INFO] $*"; }
log_error() { echo "[ERROR] $*" >&2; }
die() { log_error "$*"; exit 1; }

main() {
  local env="${1:-production}"
  log_info "Deploying to ${env}"

  [[ -f "config/${env}.env" ]] || die "Config not found for ${env}"

  deploy "${env}"
  log_info "Deploy complete"
}

deploy() {
  local env="$1"
  # deployment logic
}

main "$@"
```

## Examples

### Good
```bash
#!/usr/bin/env bash
set -euo pipefail

readonly BACKUP_DIR="/opt/backups"
readonly MAX_BACKUPS=7

main() {
  local db_name="${1:?Usage: $0 <database_name>}"
  local timestamp
  timestamp=$(date +%Y%m%d_%H%M%S)
  local backup_file="${BACKUP_DIR}/${db_name}_${timestamp}.sql.gz"

  mkdir -p "${BACKUP_DIR}"
  pg_dump "${db_name}" | gzip > "${backup_file}"

  # Rotate old backups
  find "${BACKUP_DIR}" -name "${db_name}_*.sql.gz" -mtime "+${MAX_BACKUPS}" -delete

  echo "Backup created: ${backup_file}"
}

main "$@"
```

### Bad
```bash
#!/bin/bash
# No strict mode, no quoting, no error handling
cd $BACKUP_DIR
pg_dump $1 > backup.sql
rm old_backup.sql
```

## Enforcement
Add shellcheck to CI pipeline. Require all scripts to pass shellcheck before merge.
