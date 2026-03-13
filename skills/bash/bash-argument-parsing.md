---
id: bash-argument-parsing
stackId: bash
type: skill
name: >-
  Bash Argument Parsing & CLI Design
description: >-
  Build user-friendly Bash CLI scripts — argument parsing with getopts, long
  options, help messages, input validation, and following Unix CLI
  conventions.
difficulty: intermediate
tags:
  - bash
  - argument
  - parsing
  - cli
  - design
  - deployment
  - automation
  - docker
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Bash Argument Parsing & CLI Design skill?"
    answer: >-
      Build user-friendly Bash CLI scripts — argument parsing with getopts,
      long options, help messages, input validation, and following Unix CLI
      conventions. This skill provides a structured workflow for automation
      scripts, argument parsing, error handling, and system administration.
  - question: "What tools and setup does Bash Argument Parsing & CLI Design require?"
    answer: >-
      Requires Docker, pip/poetry installed. Works with Bash projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Bash Argument Parsing & CLI Design

## Overview
Well-designed CLI scripts accept flags, options, and arguments following Unix conventions. Proper argument parsing makes scripts reusable, self-documenting, and user-friendly.

## Why This Matters
- **Reusability** — scripts with options are flexible for different use cases
- **Self-documenting** — --help tells users what the script does
- **Unix conventions** — users expect -v for verbose, -h for help
- **Automation** — parseable arguments enable script composition

## Step 1: Usage Function
```bash
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_NAME=$(basename "$0")

usage() {
  cat <<EOF
Usage: $SCRIPT_NAME [OPTIONS] <environment>

Deploy the application to the specified environment.

Arguments:
  environment    Target environment (dev, staging, prod)

Options:
  -t, --tag TAG     Docker image tag to deploy (default: latest)
  -d, --dry-run     Show what would be done without executing
  -v, --verbose     Enable verbose output
  -h, --help        Show this help message

Examples:
  $SCRIPT_NAME dev
  $SCRIPT_NAME staging --tag v2.1.0
  $SCRIPT_NAME prod --tag v2.1.0 --dry-run
EOF
}
```

## Step 2: Parse Arguments
```bash
TAG="latest"
DRY_RUN=false
VERBOSE=false
ENVIRONMENT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--tag)
      TAG="$2"
      shift 2
      ;;
    -d|--dry-run)
      DRY_RUN=true
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    -*)
      echo "Error: Unknown option $1" >&2
      usage >&2
      exit 2
      ;;
    *)
      ENVIRONMENT="$1"
      shift
      ;;
  esac
done
```

## Step 3: Validate Arguments
```bash
# Validate required arguments
if [[ -z "$ENVIRONMENT" ]]; then
  echo "Error: environment argument is required" >&2
  usage >&2
  exit 2
fi

# Validate allowed values
case "$ENVIRONMENT" in
  dev|staging|prod) ;;
  *)
    echo "Error: invalid environment '$ENVIRONMENT' (must be dev, staging, or prod)" >&2
    exit 2
    ;;
esac

# Validate tag format
if [[ ! "$TAG" =~ ^v?[0-9]+.[0-9]+.[0-9]+$|^latest$ ]]; then
  echo "Error: invalid tag format '$TAG' (expected semver or 'latest')" >&2
  exit 2
fi
```

## Step 4: Use Parsed Arguments
```bash
main() {
  if [[ "$VERBOSE" == true ]]; then
    echo "Environment: $ENVIRONMENT"
    echo "Tag: $TAG"
    echo "Dry run: $DRY_RUN"
  fi

  if [[ "$DRY_RUN" == true ]]; then
    echo "[DRY RUN] Would deploy $TAG to $ENVIRONMENT"
    return 0
  fi

  echo "Deploying $TAG to $ENVIRONMENT..."
  # ... deployment logic ...
}

main
```

## Best Practices
- Always provide `-h/--help` with usage examples
- Use long options (`--verbose`) for clarity, short (`-v`) for convenience
- Validate all inputs before executing
- Use exit code 2 for usage errors (Unix convention)
- Print errors to stderr (`>&2`), data to stdout
- Include examples in the help message
- Support `--` to end option parsing (pass remaining as positional args)

## Common Mistakes
- No help message (users have to read the script)
- Not validating argument values (garbage in, garbage out)
- Using positional-only arguments for everything (hard to remember order)
- Not handling unknown flags (silently ignored)
