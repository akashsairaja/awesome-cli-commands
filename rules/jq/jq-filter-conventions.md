---
id: jq-filter-conventions
stackId: jq
type: rule
name: JQ Filter Writing Conventions
description: >-
  Write clean, maintainable jq filters — use proper chaining with pipes, avoid
  unnecessary identity operations, handle null values explicitly, and format
  complex filters for readability.
difficulty: beginner
globs:
  - '**/*.jq'
  - '**/*.sh'
tags:
  - jq-filters
  - json-processing
  - pipe-chains
  - null-handling
  - readability
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
  - question: How should I handle null values in jq filters?
    answer: >-
      Use the alternative operator (//) to provide defaults: '.timeout // 30'.
      Use 'select(. != null)' to filter out nulls from arrays. Use the try-catch
      pattern 'try .path.to.value catch "default"' for deeply nested access. Use
      '?' (optional object indexing) for safe traversal:
      '.config?.database?.host'.
  - question: How do I make complex jq filters readable?
    answer: >-
      Break filters across multiple lines with clear pipe separation. Put each
      pipe stage on its own line, indented under the previous. Store reusable
      filters in .jq library files and import them with --library-path. Use
      comments in .jq files (lines starting with #).
relatedItems:
  - jq-function-naming
  - jq-error-handling
version: 1.0.0
lastUpdated: '2026-03-12'
---

# JQ Filter Writing Conventions

## Rule
Write jq filters that are readable and maintainable. Use pipe chains, handle null values with the alternative operator, and break complex filters across multiple lines.

## Format
```bash
# Simple inline
jq '.users[] | .name'

# Complex multi-line
jq '
  .users[]
  | select(.active == true)
  | {name: .name, email: .email}
'
```

## Good Examples
```bash
# Clean pipe chains
jq '.data.users[] | select(.role == "admin") | .email' users.json

# Null handling with alternative operator
jq '.config.timeout // 30' config.json

# Object construction
jq '.[] | {
  id: .id,
  fullName: "\(.firstName) \(.lastName)",
  active: (.status == "active")
}' users.json

# Multi-line complex filter
jq '
  [.events[]
   | select(.timestamp > "2024-01-01")
   | {
       date: .timestamp[:10],
       type: .eventType,
       user: .actor.login
     }
  ]
  | group_by(.date)
  | map({date: .[0].date, count: length})
' events.json
```

## Bad Examples
```bash
# BAD: No null handling — crashes on missing fields
jq '.config.database.host' config.json
# If .config or .database is null, returns null silently
# Use: jq '.config.database.host // error("missing database host")'

# BAD: Overly complex one-liner
jq '[.[]|select(.active)|{n:.name,e:.email}]|sort_by(.n)|.[:10]' f.json
# Break this into a readable multi-line filter

# BAD: Unnecessary identity and redundant operations
jq '. | .users | . | .[] | . | .name' data.json
# Simplify: jq '.users[].name' data.json
```

## Enforcement
- Use multi-line format for filters longer than 80 characters
- Test filters with sample data before embedding in scripts
- Store complex filters in .jq files for reuse
