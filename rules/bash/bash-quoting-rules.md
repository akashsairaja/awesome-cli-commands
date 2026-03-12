---
id: bash-quoting-rules
stackId: bash
type: rule
name: Always Quote Variables and Substitutions
description: >-
  Every variable expansion and command substitution in Bash must be
  double-quoted to prevent word splitting, glob expansion, and catastrophic bugs
  with filenames containing spaces.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/*.bash'
tags:
  - quoting
  - word-splitting
  - glob-expansion
  - variables
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
  - question: Why must all Bash variables be double-quoted?
    answer: >-
      Unquoted variables undergo word splitting and glob expansion. A variable
      containing 'my file.txt' becomes two arguments without quotes. Worse, a
      variable containing '*.txt' silently expands to matching filenames. This
      causes data loss, security vulnerabilities, and subtle bugs that are
      extremely hard to diagnose.
  - question: When is it safe to not quote a variable in Bash?
    answer: >-
      Inside [[ ]] test brackets, the right-hand side is safe unquoted for
      pattern matching. Inside (( )) arithmetic, quoting is unnecessary. For
      intentional word splitting, set IFS explicitly and document why. In all
      other contexts, always quote.
relatedItems:
  - bash-strict-mode
  - bash-shellcheck-compliance
  - bash-variable-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Always Quote Variables and Substitutions

## Rule
ALL variable expansions MUST be double-quoted: "${var}", "$(command)", "$@". The only exceptions are inside [[ ]] tests and intentional word splitting with explicit IFS.

## Format
```bash
# Always quote
echo "${variable}"
result="$(some_command)"
command "${array[@]}"
```

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

# Quoted variables
file_path="${1:?Missing argument}"
echo "Processing: ${file_path}"

# Quoted command substitution
current_date="$(date +%Y-%m-%d)"
file_count="$(find . -name '*.log' | wc -l)"

# Quoted array expansion
args=("--verbose" "--output" "/tmp/result.txt")
my_command "${args[@]}"

# Quoted in conditionals
if [[ "${status}" == "ready" ]]; then
  echo "System is ready"
fi

# Quoted in loops
while IFS= read -r line; do
  echo "Line: ${line}"
done < "${input_file}"
```

## Bad Examples
```bash
# BAD: Unquoted variable — breaks on spaces
file=/tmp/my file.txt
cat $file         # Becomes: cat /tmp/my file.txt (two arguments!)

# BAD: Unquoted glob expansion
dir="*.txt"
echo $dir         # Expands to matching filenames!

# BAD: Unquoted $@ in function
my_func() {
  other_func $@   # Breaks arguments with spaces
}

# BAD: Unquoted command substitution
files=$(ls /tmp)
for f in $files; do  # Word splits on spaces in filenames
  rm $f
done
```

## The One Exception
```bash
# Intentional word splitting with controlled IFS
IFS=',' read -ra parts <<< "${csv_line}"
```

## Enforcement
- ShellCheck SC2086 catches all unquoted variable expansions
- Enable ShellCheck in CI and pre-commit hooks
- Use `${var}` brace syntax consistently for clarity
