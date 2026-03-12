---
id: bash-posix-portability
stackId: bash
type: rule
name: POSIX Portability Guidelines
description: >-
  Write portable shell scripts by avoiding bashisms when targeting /bin/sh,
  using POSIX-compliant constructs, and clearly declaring the required shell in
  the shebang line.
difficulty: intermediate
globs:
  - '**/*.sh'
  - '**/*.bash'
  - '**/Dockerfile*'
tags:
  - posix
  - portability
  - bashisms
  - shell-compatibility
  - cross-platform
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
  - question: When should I write POSIX sh instead of Bash?
    answer: >-
      Use POSIX sh for Docker entrypoint scripts (Alpine uses ash, not bash),
      init system scripts, embedded systems, and any context where bash may not
      be installed. Use bash for application scripts, CI pipelines, and
      developer tooling where bash is guaranteed available.
  - question: How do I check if my script has bashisms?
    answer: >-
      Use the 'checkbashisms' tool from Debian's devscripts package to detect
      non-POSIX constructs. ShellCheck with '--shell=sh' also flags bashisms.
      Common issues include [[ ]], local, arrays, brace expansion, and echo -e.
relatedItems:
  - bash-strict-mode
  - bash-shellcheck-compliance
  - bash-quoting-rules
version: 1.0.0
lastUpdated: '2026-03-12'
---

# POSIX Portability Guidelines

## Rule
Scripts using `#!/bin/sh` MUST be POSIX-compliant. Scripts requiring Bash features MUST use `#!/usr/bin/env bash`. Never use bashisms in POSIX scripts.

## Common Bashisms to Avoid in POSIX
| Bashism | POSIX Alternative |
|---------|-------------------|
| `[[ ... ]]` | `[ ... ]` |
| `(( ... ))` | `$(( ... ))` or `expr` |
| `${var,,}` (lowercase) | `echo "$var" \| tr '[:upper:]' '[:lower:]'` |
| `${var//old/new}` | `echo "$var" \| sed 's/old/new/g'` |
| `local` keyword | Function-scoped naming convention |
| `source file` | `. file` |
| `echo -e` | `printf` |
| `<<<` here-string | `echo "$var" \| cmd` |
| `declare -a` arrays | Not available in POSIX sh |
| `{1..10}` brace expansion | `seq 1 10` |

## Good Examples
```bash
#!/usr/bin/env bash
# Bash script — uses bash features intentionally
set -euo pipefail

declare -a files=()
for f in "${files[@]}"; do
  [[ -f "${f}" ]] && echo "Found: ${f}"
done
```

```sh
#!/bin/sh
# POSIX script — portable across all shells
set -eu

# No arrays, no [[ ]], no local
count=0
for f in *.txt; do
  [ -f "$f" ] && count=$((count + 1))
done
printf "Found %d files\n" "$count"
```

## Bad Examples
```sh
#!/bin/sh
# BAD: Using bashisms with POSIX shebang

[[ -f "file.txt" ]]    # Bashism — use [ ]
echo -e "line\n"       # Bashism — use printf
local var="value"       # Bashism — not POSIX
source config.sh        # Bashism — use . config.sh
```

## When to Choose Which
- **Use bash** for: Application scripts, CI pipelines, developer tooling
- **Use sh** for: Docker entrypoints, init scripts, Alpine containers, embedded systems

## Enforcement
- Use `checkbashisms` tool from Debian devscripts package
- ShellCheck detects POSIX issues: `shellcheck --shell=sh script.sh`
- CI validation based on shebang line detection
