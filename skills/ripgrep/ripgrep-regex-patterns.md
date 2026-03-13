---
id: ripgrep-regex-patterns
stackId: ripgrep
type: skill
name: Regex Patterns for Code Search
description: >-
  Write effective regex patterns for ripgrep — character classes, quantifiers,
  anchors, groups, lookaround with PCRE2, and crafting patterns that find
  specific code constructs.
difficulty: intermediate
tags:
  - ripgrep
  - regex
  - patterns
  - code
  - search
  - machine-learning
  - refactoring
  - code-review
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Regex Patterns for Code Search skill?"
    answer: >-
      Write effective regex patterns for ripgrep — character classes,
      quantifiers, anchors, groups, lookaround with PCRE2, and crafting
      patterns that find specific code constructs. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does Regex Patterns for Code Search require?"
    answer: >-
      Works with standard ripgrep tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working ripgrep environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Regex Patterns for Code Search

## Overview
Ripgrep's regex engine handles most code search patterns efficiently. Learn to craft patterns that find function definitions, imports, variable declarations, and code constructs across any language.

## Why This Matters
- **Precision** — find exactly the code construct you need
- **Refactoring** — locate all patterns before making changes
- **Code review** — find anti-patterns and potential issues
- **Analysis** — extract structured information from code

## How It Works

### Step 1: Anchors & Boundaries
```bash
# Line start/end
rg "^import" --type ts              # imports at line start
rg ";s*$" --type ts                # lines ending with semicolons

# Word boundaries
rg -w "user"                        # whole word "user"
rg "\bclass\b" --type py           # word boundary explicit

# Start of definition
rg "^(export )?(const|let|var) " --type ts
rg "^(pub )?(fn|struct|enum) " --type rust
```

### Step 2: Character Classes & Quantifiers
```bash
# Digit and word characters
rg "v\d+\.\d+\.\d+" --type json     # version numbers v1.2.3
rg "\w+Error" --type ts                # anything ending in Error

# Optional and alternation
rg "(async )?function \w+" --type js  # optional async
rg "(GET|POST|PUT|DELETE) /" --type py # HTTP methods

# Repetition
rg "console\.(log|warn|error)\(" --type ts
rg "\b[A-Z][A-Z_]{2,}\b"              # UPPER_CASE constants
```

### Step 3: Groups & Extraction
```bash
# Capture groups with -o (output match only)
rg -o "from ['"]([^'"]+)" --type ts    # extract import paths
rg -o "https?://[^\s\"'>]+" --type html # extract URLs

# Named patterns
rg -o "version["']:\s*["']([^"']+)" --type json

# Count pattern occurrences
rg -o "\bimport\b" --type ts | wc -l    # total imports
rg -c "console\.log" --type ts          # per-file count
```

### Step 4: PCRE2 Advanced Patterns
```bash
# Lookahead — match if followed by
rg -P "function \w+(?=.*async)" --type ts

# Lookbehind — match if preceded by
rg -P "(?<=import )\{[^}]+\}" --type ts

# Negative lookahead
rg -P "class \w+(?!.*extends)" --type ts  # classes without extends

# Non-capturing groups
rg -P "(?:https?|ftp)://\S+"

# Backreferences
rg -P "(\w+)\s*=\s*\1"                   # assignment to same value
```

### Step 5: Language-Specific Patterns
```bash
# TypeScript/JavaScript
rg "interface \w+" --type ts             # interface declarations
rg "type \w+ =" --type ts                # type aliases
rg "useEffect\(" --type tsx              # React hooks

# Python
rg "class \w+.*:" --type py              # class definitions
rg "@\w+" --type py                      # decorators
rg "raise \w+Error" --type py            # exception raising

# Go
rg "func \(\w+ \*?\w+\)" --type go     # method receivers
rg "go func\(" --type go                 # goroutine launches

# Rust
rg "impl\b.*\bfor\b" --type rust        # trait implementations
rg "unwrap\(\)" --type rust              # potential panics
```

## Best Practices
- Start simple, add complexity only when needed
- Use -o to extract just the matching portion
- Use -P (PCRE2) only when lookaround is needed (slower)
- Test patterns on a small directory first
- Combine -o with sort | uniq -c for frequency analysis

## Common Mistakes
- Overly complex regex when -w or -F would suffice
- Using PCRE2 (-P) when standard regex works (performance hit)
- Not escaping dots in filenames and URLs
- Greedy matching when non-greedy is needed (.*? vs .*)
- Not anchoring patterns (too many false positives)
