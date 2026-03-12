---
id: zsh-scripting-standards
stackId: zsh
type: rule
name: Zsh Function & Script Standards
description: >-
  Coding standards for Zsh functions — local variables, argument validation,
  error handling, quoting rules, and consistent formatting for maintainable
  shell code.
difficulty: intermediate
globs:
  - '**/.zshrc'
  - '**/.zsh/**'
  - '**/*.zsh'
tags:
  - scripting
  - functions
  - coding-standards
  - error-handling
  - quoting
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: Why should I use local variables in Zsh functions?
    answer: >-
      Without 'local', variables defined in functions pollute the global scope.
      This causes subtle bugs where one function overwrites another's variables.
      Always declare with 'local' to keep function variables scoped properly.
  - question: Why must I quote variables in Zsh?
    answer: >-
      Unquoted variables are subject to word splitting and glob expansion. A
      filename with spaces like 'my file.txt' becomes two arguments without
      quotes. Always use "$var" to preserve the value as a single unit. Zsh is
      slightly better than Bash here, but quoting is still best practice.
relatedItems:
  - zsh-zshrc-organization
  - zsh-custom-functions
  - zsh-config-specialist
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Zsh Function & Script Standards

## Rule
All Zsh functions MUST use local variables, validate arguments, quote all variable expansions, and provide usage messages for functions with parameters.

## Format
```bash
funcname() {
  emulate -L zsh
  local usage="Usage: funcname [-v] <required-arg>"
  local verbose=false

  # Parse options
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -v|--verbose) verbose=true; shift ;;
      -h|--help) echo "$usage"; return 0 ;;
      -*) echo "Unknown option: $1" >&2; return 1 ;;
      *) break ;;
    esac
  done

  # Validate
  if [[ $# -eq 0 ]]; then
    echo "$usage" >&2
    return 1
  fi

  # Implementation
  local result
  result="$(some_command "$1")" || return 1
  echo "$result"
}
```

## Requirements

### Always Use Local Variables
```bash
# Good
myfunc() {
  local name="$1"
  local count=0
  local -a items
}

# Bad (pollutes global scope)
myfunc() {
  name="$1"
  count=0
}
```

### Always Quote Variables
```bash
# Good
echo "$filename"
[[ -f "$path" ]] && cat "$path"
for f in "$@"; do echo "$f"; done

# Bad (word splitting, globbing issues)
echo $filename
[[ -f $path ]] && cat $path
for f in $@; do echo $f; done
```

### Error Output to Stderr
```bash
# Good
echo "Error: file not found" >&2
return 1

# Bad
echo "Error: file not found"  # Goes to stdout, breaks piping
```

### Meaningful Exit Codes
```bash
# 0 = success
# 1 = user error (bad arguments)
# 2 = system error (command failed)
return 0   # Success
return 1   # Bad usage
return 2   # External failure
```

## Good
```bash
port() {
  local usage="Usage: port <number> [kill]"
  [[ $# -eq 0 ]] && { echo "$usage" >&2; return 1; }
  local pid
  pid=$(lsof -ti ":$1" 2>/dev/null)
  [[ -z "$pid" ]] && { echo "No process on port $1"; return 0; }
  echo "Port $1: PID $pid"
}
```

## Bad
```bash
port() {
  pid=$(lsof -ti :$1)    # No quotes, no local, no validation
  echo Port $1: PID $pid  # No quotes
}
```
