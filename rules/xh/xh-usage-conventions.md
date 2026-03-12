---
id: xh-usage-conventions
stackId: xh
type: rule
name: XH HTTP Client Usage Standards
description: >-
  Use xh effectively as a modern HTTPie replacement — proper request syntax,
  output formatting, authentication shortcuts, and integration with shell
  pipelines and scripting.
difficulty: beginner
globs:
  - '**/*.sh'
  - '**/Makefile'
  - '**/Taskfile.yml'
tags:
  - http-client
  - api-testing
  - json
  - scripting
  - curl-alternative
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
  - question: What is xh and how does it differ from HTTPie?
    answer: >-
      xh is a Rust reimplementation of HTTPie that is significantly faster, uses
      the same command syntax, and produces identical output. It is a drop-in
      replacement with better performance and no Python dependency. If you know
      HTTPie, you already know xh — the syntax is compatible.
  - question: How does xh determine the HTTP method automatically?
    answer: >-
      xh uses GET by default when no request body is provided. When you include
      data items (key=value, key:=value), xh automatically uses POST. Use
      explicit method names (xh PUT, xh DELETE, xh PATCH) when the automatic
      detection does not match your intent.
relatedItems:
  - xh-auth-patterns
  - xh-scripting-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# XH HTTP Client Usage Standards

## Rule
Use xh's shorthand syntax consistently — implicit methods, header shortcuts, JSON body syntax, and proper output flags for scripting vs interactive use.

## Syntax Conventions
| Syntax | Meaning | Example |
|--------|---------|---------|
| `xh URL` | GET request | `xh api.example.com/users` |
| `xh URL key=value` | POST JSON | `xh api.example.com/users name=Alice` |
| `xh URL key:=value` | Non-string JSON | `xh api.example.com/users age:=30` |
| `xh URL Header:Value` | Custom header | `xh api.example.com Auth:Bearer-token` |
| `xh URL key==value` | Query parameter | `xh api.example.com/search q==term` |

## Good Examples
```bash
# GET request (method implied)
xh api.example.com/users

# POST JSON body (method implied when data provided)
xh api.example.com/users name=Alice email=alice@example.com age:=30 active:=true

# Explicit method when needed
xh PUT api.example.com/users/123 name=Bob

# Auth header shortcut
xh api.example.com/protected -a username:password
xh api.example.com/protected -A bearer -a "eyJhbG..."

# Query parameters
xh api.example.com/search q==react page:=1 limit:=20

# Output body only (for piping to jq)
xh -b api.example.com/users | jq '.[].name'

# Download file
xh -d api.example.com/reports/q4.pdf

# Headers only
xh -h HEAD api.example.com/health

# Verbose output (request + response)
xh -v api.example.com/users
```

## Bad Examples
```bash
# BAD: Using curl syntax with xh
xh -X GET -H "Content-Type: application/json" api.example.com
# xh uses HTTPie syntax, not curl syntax

# BAD: Explicit GET with body
xh GET api.example.com name=Alice
# GET with body is unusual — xh sends POST when data is provided

# BAD: Full output when piping
xh api.example.com/users | jq .
# Includes headers — use: xh -b api.example.com/users | jq .
```

## Scripting Best Practices
```bash
# Check HTTP status in scripts
if xh -q --check-status api.example.com/health; then
  echo "Service is healthy"
else
  echo "Health check failed (exit: $?)"
fi

# Save response body to file
xh -b -o response.json api.example.com/data

# POST from file
xh api.example.com/import < data.json
```

## Enforcement
- Use -b flag when piping output to other tools
- Use --check-status in scripts for proper exit codes
- Use -q (quiet) in scripts to suppress progress output
