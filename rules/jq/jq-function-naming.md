---
id: jq-function-naming
stackId: jq
type: rule
name: JQ Function and Library Conventions
description: >-
  Organize reusable jq logic into named functions and library files — use
  snake_case naming, document parameters, and maintain .jq library files for
  complex data transformations.
difficulty: intermediate
globs:
  - '**/*.jq'
  - '**/lib/*.jq'
tags:
  - functions
  - libraries
  - reusability
  - naming-conventions
  - modularity
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
  - question: How do I create reusable jq library files?
    answer: >-
      Create .jq files in a lib/ directory with named functions using 'def
      function_name: expression;' syntax. Import them with 'jq -L lib/' or
      '--library-path ./lib'. Functions can accept parameters: 'def
      paginate(page; size): ...'. This eliminates duplicated logic across
      scripts.
  - question: What naming convention should jq functions use?
    answer: >-
      Use snake_case for all jq function names: format_user, active_only,
      to_date. This is consistent with jq's built-in functions (ascii_downcase,
      ltrimstr, group_by). Use verb prefixes for transformations: format_,
      filter_, extract_, convert_.
relatedItems:
  - jq-filter-conventions
  - jq-error-handling
version: 1.0.0
lastUpdated: '2026-03-12'
---

# JQ Function and Library Conventions

## Rule
Reusable jq logic MUST be extracted into named functions in .jq library files. Use snake_case for function names, document parameters, and keep functions focused on a single transformation.

## Format
```jq
# lib/transforms.jq

# Convert ISO timestamp to date only
def to_date: split("T")[0];

# Filter active items from an array
def active_only: [.[] | select(.active == true)];

# Paginate array: paginate(page; size)
def paginate(page; size):
  .[(page * size):((page + 1) * size)];
```

## Good Examples
```jq
# lib/user_transforms.jq

# Format user for API response
def format_user:
  {
    id: .id,
    display_name: "\(.first_name) \(.last_name)",
    email: .email,
    role: (.role // "user"),
    joined: .created_at | to_date
  };

# Summarize user list
def user_summary:
  {
    total: length,
    active: [.[] | select(.active)] | length,
    by_role: group_by(.role) | map({role: .[0].role, count: length})
  };
```

```bash
# Use library functions
jq -L lib/ 'import "user_transforms" as ut; .users | map(ut::format_user)' data.json

# Or with --library-path
jq --library-path ./lib '.users | map(format_user)' data.json
```

## Bad Examples
```jq
# BAD: No function extraction — logic duplicated everywhere
# In script1.sh
jq '.users[] | {id: .id, name: "\(.first_name) \(.last_name)"}' data.json
# In script2.sh (same logic repeated)
jq '.users[] | {id: .id, name: "\(.first_name) \(.last_name)"}' other.json

# BAD: camelCase function names
def formatUser: ...;    # Should be format_user
def getUserById: ...;   # Should be get_user_by_id
```

## Enforcement
- Store .jq library files in a dedicated lib/ directory
- Use consistent snake_case naming for all jq functions
- Test library functions with sample input/output assertions
