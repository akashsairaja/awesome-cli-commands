---
id: jq-error-handling
stackId: jq
type: rule
name: JQ Error Handling Patterns
description: >-
  Handle errors gracefully in jq filters — use try-catch for unreliable data,
  validate input structure before processing, and provide meaningful error
  messages for missing fields.
difficulty: intermediate
globs:
  - '**/*.jq'
  - '**/*.sh'
tags:
  - error-handling
  - validation
  - try-catch
  - null-safety
  - robustness
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
  - question: How do I handle missing fields in jq without crashing?
    answer: >-
      Use the alternative operator (//) for defaults: '.timeout // 30'. Use
      try-catch for operations that might fail: 'try .date | fromdateiso8601'.
      Use the optional operator (?) for safe traversal: '.config?.db?.host'. For
      required fields, use '// error("field is required")' to fail with a clear
      message.
  - question: How does try-catch work in jq?
    answer: >-
      The 'try EXPR' form silently ignores errors and produces no output. The
      'try EXPR catch HANDLER' form catches errors and runs the handler with the
      error message as input. Use it for unreliable data: 'try (.timestamp |
      fromdateiso8601) catch "invalid date"'. This prevents one bad record from
      crashing the entire pipeline.
relatedItems:
  - jq-filter-conventions
  - jq-function-naming
version: 1.0.0
lastUpdated: '2026-03-12'
---

# JQ Error Handling Patterns

## Rule
All jq filters processing external data MUST handle missing fields, unexpected types, and malformed input. Use try-catch, the alternative operator (//), and input validation.

## Good Examples
```bash
# Validate required fields exist
jq '
  if (.name | type) != "string" then
    error("name must be a string")
  elif (.age | type) != "number" then
    error("age must be a number")
  else
    {name: .name, age: .age}
  end
' input.json

# Safe nested access with defaults
jq '{
  host: (.database.host // "localhost"),
  port: (.database.port // 5432),
  name: (.database.name // error("database.name is required"))
}' config.json

# Try-catch for unreliable data
jq '[.events[] | try {
  date: (.timestamp | fromdateiso8601 | strftime("%Y-%m-%d")),
  type: .event_type
}]' events.json

# Handle both array and object input
jq '
  if type == "array" then .[]
  elif type == "object" then .
  else error("expected array or object, got " + type)
  end
  | .name
' input.json
```

## Bad Examples
```bash
# BAD: No error handling — crashes on missing fields
jq '.data.users[0].address.city' response.json
# Fails if any intermediate field is null

# BAD: Silent null propagation hides bugs
jq '.users[] | .profile.avatar_url' data.json
# Returns null for users without profile — is that correct?

# BAD: No type checking on API responses
jq '.results | length' api_response.json
# Crashes if .results is null or not an array
```

## Enforcement
- Test jq filters with edge cases: empty arrays, null fields, wrong types
- Use `// error("message")` for required fields instead of silent null
- Wrap external API response processing in try-catch blocks
