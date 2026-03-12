---
id: hurl-variable-usage
stackId: hurl
type: rule
name: Variable Usage for Environment Portability
description: >-
  Require Hurl variables for all environment-specific values — base URLs,
  credentials, and dynamic data must use {{variable}} syntax for portability
  across dev, staging, and CI.
difficulty: beginner
globs:
  - '**/*.hurl'
tags:
  - variables
  - portability
  - environments
  - configuration
  - hurl
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
  - question: Why should Hurl tests use variables instead of hardcoded URLs?
    answer: >-
      Variables make tests portable — the same .hurl file runs against
      localhost, staging, and production by changing --variable values.
      Hardcoded URLs lock tests to one environment and expose credentials in
      version control.
  - question: How do I pass variables to Hurl?
    answer: >-
      Use --variable key=value on the command line or --variables-file for a
      file with key=value pairs. In CI, reference environment secrets:
      --variable base_url=$API_URL. In the .hurl file, use {{key}} syntax.
relatedItems:
  - hurl-assertion-requirements
  - hurl-file-organization
  - hurl-captures-chains
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Variable Usage for Environment Portability

## Rule
All environment-specific values in .hurl files MUST use {{variable}} syntax. Hardcoded URLs, tokens, and credentials are prohibited.

## Required Variables
```hurl
# Good — portable across environments
GET {{base_url}}/api/users
Authorization: Bearer {{auth_token}}

# Bad — hardcoded, only works locally
GET http://localhost:3000/api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## Standard Variable Names
| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | http://localhost:3000 |
| `auth_token` | Authentication token | (captured or injected) |
| `admin_email` | Admin test credentials | admin@test.com |
| `admin_password` | Admin test password | testpassword |
| `api_version` | API version prefix | v2 |

## CLI Usage
```bash
# Development
hurl --test --variable base_url=http://localhost:3000 tests/*.hurl

# Staging
hurl --test --variable base_url=https://staging.api.example.com tests/*.hurl

# CI (with secrets)
hurl --test \
  --variable base_url=$API_URL \
  --variable admin_password=$ADMIN_PASSWORD \
  tests/*.hurl
```

## Variables File
```bash
# Create variables file (not committed)
cat > .hurl-vars << 'EOF'
base_url=http://localhost:3000
admin_email=admin@test.com
admin_password=password123
EOF

# Use with --variables-file
hurl --test --variables-file .hurl-vars tests/*.hurl
```

## Anti-Patterns
- Hardcoded http://localhost:3000 in .hurl files
- Real API tokens in committed test files
- Different base URLs across .hurl files in the same project
- Not documenting required variables for new team members
