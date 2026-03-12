---
id: httpie-output-conventions
stackId: httpie
type: rule
name: Output Formatting and Redirection
description: >-
  Use HTTPie's print flags and output options correctly — separate headers from
  body for scripting, use --download for binary files, and pipe JSON output to
  jq for processing.
difficulty: beginner
globs:
  - '**/*.httpie'
  - '**/*.sh'
  - '**/httpie/**'
tags:
  - output
  - formatting
  - piping
  - jq
  - download
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
  - question: How do I pipe HTTPie output to jq correctly?
    answer: >-
      Use '--print=b' (or just '-b') to output only the response body without
      headers or formatting metadata. Without this flag, HTTPie includes colored
      headers that break JSON parsers. Example: http -b GET
      api.example.com/users | jq '.[].name'
  - question: When should I use --download vs --output in HTTPie?
    answer: >-
      --download automatically detects the filename from Content-Disposition or
      URL, shows a progress bar, and handles binary content correctly. --output
      writes the response body to a specific file path. Use --download for files
      from servers, --output when you need a specific local filename.
relatedItems:
  - httpie-session-management
  - httpie-config-standards
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Output Formatting and Redirection

## Rule
Use HTTPie's --print flag to control output sections. Use --body for piping to other tools. Use --download for binary files. Always combine with jq for JSON processing in scripts.

## Print Flag Options
| Flag | Sections | Use Case |
|------|----------|----------|
| `--print=H` | Request headers | Debug request |
| `--print=B` | Request body | Verify payload |
| `--print=h` | Response headers | Check status/headers |
| `--print=b` | Response body | Pipe to jq/processing |
| `--print=hb` | Response headers + body | Full response |
| `--print=HhBb` | Everything | Full debugging |

## Good Examples
```bash
# Extract response body for piping to jq
http --print=b GET api.example.com/users | jq '.[].name'

# Save response to file
http --print=b --output users.json GET api.example.com/users

# Download binary files properly
http --download GET api.example.com/reports/q4.pdf

# Debug mode — see everything
http --print=HhBb POST api.example.com/orders name="Widget"

# Check response headers only
http --print=h HEAD api.example.com/health
```

## Bad Examples
```bash
# BAD: Full output when piping — headers corrupt the data
http GET api.example.com/users | jq .
# Includes colored headers before JSON — jq fails
# Use: http --print=b GET api.example.com/users | jq .

# BAD: Saving binary with default output
http GET api.example.com/file.zip > file.zip
# Use: http --download GET api.example.com/file.zip
```

## Enforcement
- Always use --print=b when piping to other tools
- Use --download for binary content
- Use --check-status in scripts to fail on HTTP errors
