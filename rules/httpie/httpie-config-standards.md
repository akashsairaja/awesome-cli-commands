---
id: httpie-config-standards
stackId: httpie
type: rule
name: HTTPie Configuration and Defaults
description: >-
  Configure HTTPie with a config.json file for default headers, output
  preferences, and SSL settings — keep configuration consistent across team
  members and environments.
difficulty: beginner
globs:
  - '**/*.httpie'
  - '**/httpie/**'
  - '**/.httpie/**'
tags:
  - configuration
  - defaults
  - timeout
  - ssl
  - output-formatting
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
  - question: What default options should I set in HTTPie config.json?
    answer: >-
      Set --timeout (30 seconds prevents hanging), --check-status (fail on HTTP
      errors for scripting), --style (consistent output coloring), and
      --pretty=all (formatted output). These ensure consistent, reliable
      behavior across team members without repeating flags.
  - question: What does --check-status do in HTTPie?
    answer: >-
      By default, HTTPie exits 0 even for 4xx/5xx responses. --check-status
      makes HTTPie exit with code 4 for client errors (4xx) and code 5 for
      server errors (5xx). This is essential for scripting and CI where you need
      non-zero exit codes on HTTP errors.
relatedItems:
  - httpie-session-management
  - httpie-output-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# HTTPie Configuration and Defaults

## Rule
Use HTTPie's config.json to set consistent defaults across your team. Configure default headers, output format, and SSL verification. Share the config template, not the actual credentials.

## Format
```json
{
  "default_options": [
    "--style=monokai",
    "--print=hHbB",
    "--timeout=30"
  ]
}
```

## Config Location
```bash
# Default locations
# Linux/macOS: ~/.config/httpie/config.json
# Windows: %APPDATA%\httpie\config.json

# Check current config
http --debug 2>&1 | grep config
```

## Good Examples
```json
{
  "default_options": [
    "--style=monokai",
    "--pretty=all",
    "--timeout=30",
    "--check-status"
  ]
}
```

```bash
# Use --check-status to fail on HTTP errors
http --check-status GET api.example.com/health
# Exit code 4 for 4xx, 5 for 5xx errors — great for scripting

# Structured output for piping
http --print=b --output=response.json GET api.example.com/data
```

## Bad Examples
```bash
# BAD: Disabling SSL verification permanently
http --verify=no GET https://api.example.com
# Fix the certificate instead

# BAD: No timeout — hangs forever on network issues
http GET slow-api.example.com/data
# Always set --timeout in config or per-request
```

## Enforcement
- Share a config.json template in project documentation
- Set --check-status as default for CI/scripting use
- Always configure timeouts to prevent hanging requests
