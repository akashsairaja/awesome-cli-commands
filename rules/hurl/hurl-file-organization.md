---
id: hurl-file-organization
stackId: hurl
type: rule
name: Test File Organization Standards
description: >-
  Define standards for Hurl test file organization — one test flow per file,
  descriptive naming, directory structure by API domain, and separation of
  success and error tests.
difficulty: beginner
globs:
  - '**/*.hurl'
tags:
  - organization
  - naming-conventions
  - file-structure
  - maintainability
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
  - question: How should I organize Hurl test files?
    answer: >-
      Group by API domain (auth/, users/, products/), name descriptively with
      action and outcome (login-success.hurl, create-unauthorized.hurl), and
      keep one logical test flow per file. This enables parallel execution, easy
      debugging, and clear test coverage visibility.
  - question: How many requests should a single .hurl file contain?
    answer: >-
      1-2 for single operations, 4-8 for CRUD flows, up to 12 for complex
      multi-step flows. If a file exceeds 12 requests, split it into smaller
      focused files. Each file should test one logical scenario that can be
      described in a single sentence.
relatedItems:
  - hurl-assertion-requirements
  - hurl-variable-usage
  - hurl-test-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Test File Organization Standards

## Rule
Hurl test files MUST follow consistent naming and organization conventions. One logical test flow per file, grouped by API domain, with separate files for success and error cases.

## Directory Structure
```
tests/api/
├── auth/
│   ├── login-success.hurl
│   ├── login-invalid-credentials.hurl
│   ├── register-success.hurl
│   └── token-refresh.hurl
├── users/
│   ├── crud-flow.hurl
│   ├── list-pagination.hurl
│   ├── get-not-found.hurl
│   └── update-validation.hurl
├── products/
│   ├── crud-flow.hurl
│   ├── search-filter.hurl
│   └── create-unauthorized.hurl
└── health/
    └── health-check.hurl
```

## Naming Convention
- Use kebab-case: `login-success.hurl` not `LoginSuccess.hurl`
- Include the action: `create-user.hurl`, `list-products.hurl`
- Include the expected outcome: `login-invalid-credentials.hurl`
- CRUD flows: `crud-flow.hurl` (create → read → update → delete)

## File Size Guidelines
| File Type | Max Requests | Description |
|-----------|-------------|-------------|
| Single operation | 1-2 | One request + verification |
| CRUD flow | 4-8 | Create → Read → Update → Delete |
| Complex flow | 8-12 | Auth → multiple operations → cleanup |

## Examples

### Good — Descriptive, Focused
```
tests/api/users/crud-flow.hurl        # Full CRUD lifecycle
tests/api/users/get-not-found.hurl    # 404 error case
tests/api/auth/login-success.hurl     # Happy path login
tests/api/auth/login-expired-token.hurl  # Error case
```

### Bad — Vague, Unfocused
```
tests/test1.hurl           # Meaningless name
tests/all-tests.hurl       # Everything in one file
tests/api.hurl             # Too broad
```

## Anti-Patterns
- All tests in a single .hurl file (hard to debug, maintain, parallelize)
- Vague file names (test1.hurl, api.hurl)
- No directory structure (flat list of files)
- Mixing success and error tests in the same file without clear separation
