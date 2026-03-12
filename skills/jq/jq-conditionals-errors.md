---
id: jq-conditionals-errors
stackId: jq
type: skill
name: Conditionals & Error Handling in jq
description: >-
  Handle edge cases in jq — if/then/else logic, try-catch, alternative operator,
  type checking, and building robust jq filters that handle missing data and
  unexpected formats.
difficulty: advanced
tags:
  - conditionals
  - error-handling
  - try-catch
  - type-checking
  - defaults
  - validation
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - jq 1.6+
faq:
  - question: How do I handle null values in jq?
    answer: >-
      Use the alternative operator //: .name // "unknown" returns "unknown" if
      .name is null or missing. For arithmetic: (.count // 0) + 1 prevents null
      propagation. Use select(. != null) to filter nulls from arrays.
  - question: How do I skip errors in jq processing?
    answer: >-
      Use try: [.[] | try tonumber] silently skips items that can't be
      converted. Use try-catch for fallbacks: [.[] | try tonumber catch 0]
      replaces failures with 0. Use ? for optional access: .data[]?.name won't
      error if data is null.
  - question: How do I validate JSON structure with jq?
    answer: >-
      Check types: if (.id | type) == "number" then "valid" else "invalid" end.
      Check required fields: jq -e '.id and .name and .email' (exits non-zero if
      any is null/false). Combine with has(): if has("id") and has("name") then
      ... end.
relatedItems:
  - jq-api-processing
  - jq-array-operations
  - jq-advanced-functions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Conditionals & Error Handling in jq

## Overview
Real-world JSON is messy — missing fields, null values, mixed types, and unexpected structures. jq provides conditionals, alternative operators, and try-catch to handle these gracefully.

## Why This Matters
- **Robustness** — handle API responses with missing or null fields
- **Validation** — check data types before processing
- **Default values** — provide fallbacks for optional fields
- **Error recovery** — continue processing when individual items fail

## How It Works

### Step 1: If/Then/Else
```bash
# Basic conditional
echo '{"age":25}' | jq 'if .age >= 18 then "adult" else "minor" end'

# Without else (null if false)
echo '{"score":95}' | jq 'if .score >= 90 then "excellent" else . end'

# Multi-condition
echo '{"score":75}' | jq '
  if .score >= 90 then "A"
  elif .score >= 80 then "B"
  elif .score >= 70 then "C"
  else "F"
  end
'

# Conditional in map
echo '[{"name":"A","active":true},{"name":"B","active":false}]' | jq '
  map(. + {label: (if .active then "Active" else "Inactive" end)})
'
```

### Step 2: Alternative Operator (//)
```bash
# Default for null
echo '{"name":null}' | jq '.name // "unknown"'

# Default for missing field
echo '{}' | jq '.name // "unknown"'

# Chain defaults
echo '{}' | jq '.preferred_name // .name // .username // "anonymous"'

# In array processing
echo '[{"name":"A","email":"a@b.com"},{"name":"B"}]' | jq '
  .[] | {name, email: (.email // "no email")}
'
```

### Step 3: Try-Catch
```bash
# Skip errors
echo '["1","two","3"]' | jq '[.[] | try tonumber]'
# [1,3]  — "two" is silently skipped

# Catch with fallback
echo '["1","two","3"]' | jq '[.[] | (try tonumber catch 0)]'
# [1,0,3]

# Try on potentially missing paths
echo '{"a":{"b":1}}' | jq 'try .a.b.c.d catch "path not found"'

# Safe array access
echo '[]' | jq 'try .[0].name catch "empty array"'
```

### Step 4: Type Checking
```bash
# Check type
echo '"hello"' | jq 'type'            # "string"
echo '42' | jq 'type'                  # "number"

# Type-safe processing
echo '[1,"two",3,null,"five"]' | jq '
  [.[] | select(type == "number")]
'

# Type-based transformation
echo '{"value":"42"}' | jq '
  .value | if type == "string" then tonumber else . end
'

# Validate structure
echo '{"id":1,"name":"A"}' | jq '
  if (.id | type) == "number" and (.name | type) == "string"
  then "valid"
  else "invalid: expected {id: number, name: string}"
  end
'
```

## Best Practices
- Use // for simple defaults (cleaner than if/then/else)
- Use try for processing mixed-quality data
- Check types before operations that assume specific types
- Use ? suffix for optional object access: .data[]?.name
- Combine try + catch for error messages with recovery

## Common Mistakes
- Not handling null in arithmetic (null + 1 = null, not 1)
- Missing // default on optional fields (unexpected null output)
- Using == null vs (. == null or . == "") — different semantics
- Not using try in map over inconsistent data (one bad item kills all)
- Complex if/else chains instead of using // alternatives
