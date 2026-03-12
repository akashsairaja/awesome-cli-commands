---
id: ripgrep-search-patterns
stackId: ripgrep
type: rule
name: Effective Search Patterns
description: >-
  Use ripgrep's features effectively — type filters for language-specific
  searches, word boundaries for precise matching, multiline patterns, and
  context output for readable results.
difficulty: intermediate
globs:
  - '**/.ripgreprc'
  - '**/.rgignore'
  - '**/*.sh'
tags:
  - search-patterns
  - type-filters
  - word-boundary
  - regex
  - productivity
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
  - question: How do ripgrep type filters work?
    answer: >-
      Type filters (-t) are built-in file type definitions: -t py searches
      Python files (.py, .pyi), -t ts searches TypeScript (.ts, .tsx), -t js for
      JavaScript. Run 'rg --type-list' to see all supported types. This is
      faster and more reliable than manual glob patterns because ripgrep uses
      optimized file type detection.
  - question: How do I do a multiline search with ripgrep?
    answer: >-
      Use the -U flag for multiline mode, which allows patterns to match across
      line boundaries. For example, 'rg -U "try.*\n.*catch"' finds try/catch
      blocks. Combine with --multiline-dotall (-UU) if you need dot (.) to match
      newlines as well.
relatedItems:
  - ripgrep-config-conventions
  - ripgrep-type-filters
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Effective Search Patterns

## Rule
Use ripgrep's built-in features for precise searches — type filters instead of glob patterns, word boundary markers for exact matches, and context flags for readable output.

## Common Patterns
| Need | Pattern | Example |
|------|---------|---------|
| Exact word | `-w` | `rg -w "Error"` |
| Case sensitive | `-s` | `rg -s "TODO"` |
| File type | `-t` | `rg -t py "import"` |
| Invert match | `-v` | `rg -v "debug"` |
| Count only | `-c` | `rg -c "TODO"` |
| Files only | `-l` | `rg -l "pattern"` |
| Context | `-C N` | `rg -C 3 "error"` |
| Multiline | `-U` | `rg -U "try.*\n.*catch"` |

## Good Examples
```bash
# Search only in Python files
rg -t py "def test_"

# Search with context (3 lines before and after)
rg -C 3 "FIXME"

# Word boundary — matches "Error" but not "ErrorHandler"
rg -w "Error"

# Find files containing pattern (list only)
rg -l "TODO" --type ts

# Count matches per file
rg -c "console.log" --type ts | sort -t: -k2 -rn

# Multiline search — function definitions
rg -U "export function \w+\(" --type ts

# Replace (preview) — dry run
rg "oldName" --replace "newName" --type ts

# Search in specific directory
rg "pattern" src/services/
```

## Bad Examples
```bash
# BAD: Grepping without type filter — includes node_modules
grep -r "pattern" .

# BAD: Complex glob instead of type filter
rg "pattern" --glob="*.py" --glob="*.pyi"
# Use: rg -t py "pattern"

# BAD: No word boundary — too many false positives
rg "log"  # Matches "login", "blog", "catalog", "dialog"...
# Use: rg -w "log" for exact word
```

## Enforcement
- Use type filters (-t) instead of glob patterns for languages
- Use word boundaries (-w) for precise identifier searches
- Configure default exclusions in .ripgreprc
