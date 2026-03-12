---
id: clitools-help-text
stackId: clitools
type: rule
name: Help Text and Usage Message Standards
description: >-
  Every CLI tool must provide --help and --version flags with clear usage
  messages, argument descriptions, examples, and proper stderr/stdout usage for
  help output.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/bin/*'
  - '**/cli.*'
tags:
  - help-text
  - usage
  - documentation
  - cli-ux
  - arguments
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
  - question: Where should CLI help text be printed — stdout or stderr?
    answer: >-
      Print help text to stdout when the user explicitly requests it (--help
      flag), so it can be piped to less or grep. Print usage errors to stderr
      when the user provides invalid arguments, so error messages are visible
      even when stdout is redirected to a file or pipe.
  - question: What should every CLI --help message include?
    answer: >-
      Every help message should include: a usage synopsis line showing argument
      patterns, a one-sentence description, a list of all arguments and options
      with descriptions, at least two practical examples, and exit code
      documentation. Examples are the most important — many users only read the
      examples section.
relatedItems:
  - clitools-exit-codes
  - clitools-signal-handling
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Help Text and Usage Message Standards

## Rule
Every CLI tool MUST support --help and --version flags. Usage messages MUST include synopsis, description, options, examples, and exit codes. Print help to stdout, errors to stderr.

## Format
```
Usage: tool-name [OPTIONS] <required-arg> [optional-arg]

Description of what the tool does in one or two sentences.

Arguments:
  <required-arg>     Description of required argument
  [optional-arg]     Description of optional argument

Options:
  -v, --verbose      Enable verbose output
  -o, --output FILE  Output file path (default: stdout)
  -h, --help         Show this help message
  --version          Show version number

Examples:
  tool-name input.txt
  tool-name --verbose -o result.txt input.txt

Exit Codes:
  0  Success
  1  General error
  2  Invalid usage
```

## Good Examples
```bash
#!/usr/bin/env bash
set -euo pipefail

readonly VERSION="1.2.0"

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] <input-file>

Process data files and generate reports.

Arguments:
  <input-file>       Path to input CSV file

Options:
  -f, --format FMT   Output format: json, csv, table (default: table)
  -o, --output FILE  Write output to file (default: stdout)
  -q, --quiet        Suppress progress messages
  -h, --help         Show this help message
  --version          Show version number

Examples:
  $(basename "$0") data.csv
  $(basename "$0") --format json -o report.json data.csv
  $(basename "$0") --quiet data.csv | jq .

Exit Codes:
  0  Success
  1  Processing error
  2  Invalid arguments
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "${1}" in
    -h|--help) usage; exit 0 ;;
    --version) echo "${VERSION}"; exit 0 ;;
    *) break ;;
  esac
  shift
done
```

## Bad Examples
```bash
# BAD: No --help flag
# BAD: Cryptic error with no usage hint
echo "Error" && exit 1

# BAD: Help printed to stderr
echo "Usage: tool <file>" >&2  # Should be stdout for --help

# BAD: No examples
echo "Usage: tool [OPTIONS] FILE"
# Users have no idea what a valid invocation looks like
```

## Enforcement
- CI test: `tool --help` exits 0 and output contains "Usage:"
- CI test: `tool --version` exits 0 and output matches semver
- Require examples section in all help text
