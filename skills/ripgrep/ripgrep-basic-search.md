---
id: ripgrep-basic-search
stackId: ripgrep
type: skill
name: Essential Ripgrep Search Patterns
description: >-
  Master everyday ripgrep search patterns — literal search, regex, file type
  filtering, context lines, and finding code patterns efficiently in any
  project.
difficulty: beginner
tags:
  - search
  - regex
  - file-types
  - context
  - code-navigation
  - productivity
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - ripgrep installed (rg command)
faq:
  - question: How do I search for a literal string with special characters?
    answer: >-
      Use -F (fixed string) flag: rg -F 'file.test.ts' searches for the literal
      text, not a regex. Without -F, dots match any character. Also use -F for
      strings with $, *, +, and other regex metacharacters.
  - question: Why is ripgrep not finding matches I expect?
    answer: >-
      Most likely causes: 1) File is in .gitignore (use --no-ignore to include).
      2) File is binary (use -a to search binary files). 3) File is in a hidden
      directory (use --hidden). 4) Wrong file type filter. Use rg --debug to see
      which files are searched.
  - question: How do I search hidden files and gitignored files?
    answer: >-
      Use --hidden to include hidden directories (.config, .env). Use
      --no-ignore to include .gitignore entries. Combine both: rg --hidden
      --no-ignore 'pattern'. Or use -u for unrestricted: -u (no .gitignore), -uu
      (also hidden), -uuu (also binary).
relatedItems:
  - ripgrep-regex-patterns
  - ripgrep-replace-refactor
  - ripgrep-code-search
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Essential Ripgrep Search Patterns

## Overview
Ripgrep (rg) is the fastest code search tool. It respects .gitignore, searches in parallel, and uses smart defaults. Learn the essential patterns that cover 90% of daily code search needs.

## Why This Matters
- **Speed** — 10-100x faster than grep on large codebases
- **Smart defaults** — ignores .gitignore patterns, binary files, hidden dirs
- **Regex** — powerful pattern matching for code constructs
- **Integration** — works with editors, CI, and shell pipelines

## How It Works

### Step 1: Basic Search
```bash
# Simple text search
rg "TODO"
rg "console.log"

# Case-insensitive
rg -i "error"

# Whole word (avoid partial matches)
rg -w "user"          # matches "user" not "username"

# Fixed string (no regex interpretation)
rg -F "file.ts"       # treats dots as literal, not regex
rg -F "$variable"     # treats $ as literal

# Search specific directory
rg "pattern" src/
rg "pattern" src/ tests/    # multiple directories
```

### Step 2: File Type Filtering
```bash
# Search only TypeScript files
rg -t ts "useState"

# Search only Python files
rg -t py "import requests"

# Exclude test files
rg -T test "deprecated"

# Multiple types
rg -t ts -t js "fetch"

# Custom glob
rg -g "*.config.*" "port"
rg -g "!*.test.*" "function"    # exclude pattern

# List available types
rg --type-list
```

### Step 3: Context & Output Control
```bash
# Lines around matches
rg -C 3 "panic!"              # 3 lines before and after
rg -B 2 "FIXME"               # 2 lines before
rg -A 5 "function main"       # 5 lines after

# File list only (no content)
rg -l "TODO"                   # files with matches
rg -l "TODO" | wc -l           # count files

# Count matches
rg -c "console.log"            # matches per file
rg -c "console.log" --sort-files

# Suppress filename
rg -N "pattern"                # no line numbers
rg --no-filename "pattern"     # no filenames (just content)

# Max results
rg -m 5 "TODO"                 # first 5 matches per file
rg "TODO" | head -20           # first 20 total matches
```

### Step 4: Common Search Patterns
```bash
# Find function definitions
rg "function w+" --type ts
rg "def w+" --type py
rg "func w+" --type go

# Find imports
rg "^import" --type ts
rg "^from .* import" --type py
rg "require\(" --type js

# Find TODO/FIXME/HACK
rg "(TODO|FIXME|HACK|XXX)"

# Find console.log (for cleanup)
rg "console\.(log|debug|warn)" --type ts

# Find environment variable usage
rg "process\.env\." --type ts
rg "os\.environ" --type py
```

## Best Practices
- Use -w for identifier searches (avoids partial word matches)
- Use -t for type filtering (cleaner than glob patterns)
- Use -F for literal strings containing regex chars (. $ * etc)
- Use -l to get file list for batch operations
- Use --sort-files for reproducible output order

## Common Mistakes
- Searching without -w (too many partial matches)
- Not using -F for literal strings ("file.ts" matches "filexts" without -F)
- Forgetting ripgrep auto-ignores .gitignore patterns (search missed files)
- Not using -t for type filtering (noisy results from wrong file types)
- Using -i when not needed (slower, more false positives)
