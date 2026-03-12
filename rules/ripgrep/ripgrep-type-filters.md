---
id: ripgrep-type-filters
stackId: ripgrep
type: rule
name: Custom Type Definitions
description: >-
  Define custom file types in ripgrep for project-specific search needs — add
  type definitions in .ripgreprc, combine types for cross-language searches, and
  negate types to exclude.
difficulty: beginner
globs:
  - '**/.ripgreprc'
  - '**/.rgignore'
tags:
  - type-definitions
  - custom-types
  - file-filters
  - search-optimization
  - configuration
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
  - question: How do I define custom file types in ripgrep?
    answer: >-
      Use --type-add in .ripgreprc: '--type-add=web:*.tsx,*.jsx,*.css'. Then
      search with '-t web'. You can also add types on the command line: 'rg
      --type-add "proto:*.proto" -t proto "message"'. Custom types persist in
      .ripgreprc for consistent use across sessions.
  - question: How do I exclude a file type from ripgrep results?
    answer: >-
      Use the -T (uppercase) flag to negate a type: 'rg -T test "function"'
      searches all files except test files. You can combine inclusion and
      exclusion: 'rg -t ts -T test "export"' searches TypeScript files but skips
      test files.
relatedItems:
  - ripgrep-config-conventions
  - ripgrep-search-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Custom Type Definitions

## Rule
Define custom ripgrep types for project-specific file patterns that are not covered by built-in types. Add them to .ripgreprc for team-wide consistency.

## Format
```
# .ripgreprc
--type-add=web:*.tsx,*.jsx,*.css,*.html
--type-add=config:*.json,*.yaml,*.yml,*.toml
--type-add=infra:*.tf,*.hcl,*.pkr.hcl
--type-add=test:*test*,*spec*,*_test.go
```

## Good Examples
```bash
# Define custom types in .ripgreprc
--type-add=web:*.tsx,*.jsx,*.css,*.html
--type-add=config:*.json,*.yaml,*.yml,*.toml
--type-add=infra:*.tf,*.hcl
--type-add=ci:*.yml # in .github/

# Use custom types
rg -t web "className"
rg -t config "database"
rg -t infra "aws_instance"

# Combine multiple types
rg -t ts -t js "import"

# Exclude a type
rg -T test "function"  # Skip test files

# List all known types
rg --type-list

# Add type on the fly
rg --type-add 'proto:*.proto' -t proto "message"
```

## Bad Examples
```bash
# BAD: Manual glob instead of type
rg "pattern" -g "*.tsx" -g "*.jsx" -g "*.css" -g "*.html"
# Define a custom type instead

# BAD: No type filter — searches everything
rg "TODO"
# Binary files, lock files, generated code all included
# Use: rg -t ts "TODO" or configure .rgignore
```

## Enforcement
- Document custom types in project .ripgreprc or contributing guide
- Use type filters consistently in scripts and documentation
- Share .ripgreprc in team dotfiles repository
