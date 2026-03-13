---
id: bash-posix-portability
stackId: bash
type: skill
name: POSIX-Compatible Shell Scripting
description: >-
  Write portable shell scripts that work across Linux, macOS, and BSD — POSIX
  sh compatibility, avoiding Bash-specific features, and handling platform
  differences.
difficulty: intermediate
tags:
  - bash
  - posix-compatible
  - shell
  - scripting
  - ci-cd
  - docker
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the POSIX-Compatible Shell Scripting skill?"
    answer: >-
      Write portable shell scripts that work across Linux, macOS, and BSD —
      POSIX sh compatibility, avoiding Bash-specific features, and handling
      platform differences. It includes practical examples for shell scripting
      development.
  - question: "What tools and setup does POSIX-Compatible Shell Scripting require?"
    answer: >-
      Requires Docker installed. Works with Bash projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# POSIX-Compatible Shell Scripting

## Overview
POSIX sh is the portable shell standard that works on any Unix-like system. When you need scripts to run on Linux, macOS, BSD, Docker alpine, and embedded systems, POSIX compliance ensures portability.

## Why This Matters
- **Portability** — runs on any Unix system, not just Linux
- **Docker** — alpine images use ash/busybox, not bash
- **CI/CD** — some runners have minimal shell environments
- **macOS** — default shell is zsh, and bash is outdated (3.2)

## Bash vs POSIX Differences
| Feature | Bash | POSIX sh |
|---------|------|----------|
| Test syntax | `[[ $x == y ]]` | `[ "$x" = "y" ]` |
| Arrays | `arr=(a b c)` | Not available |
| Process substitution | `<(command)` | Not available |
| Here strings | `<<< "string"` | Not available |
| String replacement | `${var//old/new}` | Use `sed` or `tr` |
| Regex matching | `[[ $x =~ regex ]]` | Use `grep` or `expr` |
| Arithmetic | `(( x++ ))` | `x=$((x + 1))` |
| Local variables | `local var` | `local var` (supported in practice) |

## POSIX-Compatible Patterns
```sh
#!/bin/sh
# Use /bin/sh for POSIX scripts, NOT /bin/bash

# Test syntax — single brackets, = not ==
if [ "$ENV" = "production" ]; then
    echo "Production mode"
fi

# Arithmetic — use $(( )) not (( ))
count=$((count + 1))

# String operations — use external commands
# Instead of ${var//old/new}
clean=$(echo "$input" | sed 's/old/new/g')

# Instead of ${var,,} (lowercase)
lower=$(echo "$input" | tr '[:upper:]' '[:lower:]')

# Command existence check — works everywhere
if command -v docker >/dev/null 2>&1; then
    echo "Docker is installed"
fi

# Read file line by line — POSIX compatible
while IFS= read -r line; do
    printf '%s\n' "$line"
done < input.txt
```

## Platform-Specific Workarounds
```sh
# Date command differs between GNU (Linux) and BSD (macOS)
if date --version >/dev/null 2>&1; then
    # GNU date
    timestamp=$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')
else
    # BSD date (macOS)
    timestamp=$(date -v-1H '+%Y-%m-%d %H:%M:%S')
fi

# sed -i behaves differently
if sed --version >/dev/null 2>&1; then
    sed -i 's/old/new/' file.txt        # GNU
else
    sed -i '' 's/old/new/' file.txt      # BSD (macOS)
fi

# readlink -f not available on macOS
realpath_portable() {
    if command -v realpath >/dev/null 2>&1; then
        realpath "$1"
    elif command -v greadlink >/dev/null 2>&1; then
        greadlink -f "$1"
    else
        cd "$(dirname "$1")" && echo "$(pwd)/$(basename "$1")"
    fi
}
```

## Best Practices
- Use `#!/bin/sh` for portable scripts, `#!/usr/bin/env bash` for Bash-specific
- Test on both Linux and macOS before declaring portability
- Use `printf` instead of `echo` (echo behavior varies across platforms)
- Avoid arrays — use positional parameters or newline-separated strings
- Use `command -v` to check for available commands
- For complex portability needs, consider Python or Go instead

## Common Mistakes
- Using #!/bin/sh with Bash-specific features (works on Linux, breaks on alpine)
- Assuming GNU coreutils on macOS (macOS uses BSD versions)
- Using echo with flags (`echo -e`) — not portable
- Relying on /bin/bash existing (not present in alpine Docker images)
