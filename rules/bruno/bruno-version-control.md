---
id: bruno-version-control
stackId: bruno
type: rule
name: Collections Under Version Control
description: >-
  Require all Bruno API collections to be committed to version control alongside
  application code — ensuring tests evolve with the API and enabling CI/CD
  integration.
difficulty: beginner
globs:
  - '**/bruno.json'
  - '**/*.bru'
  - '**/api-tests/**'
tags:
  - version-control
  - git
  - collection-management
  - co-location
  - bruno
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
  - question: Why should Bruno collections be in version control?
    answer: >-
      Version-controlled collections evolve with the API — endpoint changes and
      test updates happen in the same PR. This prevents collection drift,
      enables code review of API tests, and ensures CI always runs current
      tests. Bruno's file-based format produces clean Git diffs.
  - question: What Bruno files should I exclude from Git?
    answer: >-
      Exclude environment files containing real secrets (production tokens, API
      keys). Commit dev and CI environment files with placeholder or test
      credentials. Provide .env.example templates for team members to create
      their own local environment files.
relatedItems:
  - bruno-assertion-requirements
  - bruno-environment-security
  - bruno-collection-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Collections Under Version Control

## Rule
All Bruno collections MUST be committed to the same Git repository as the API they test. Collections must evolve alongside API code in the same pull requests.

## Directory Structure
```
project/
├── src/               # API source code
├── tests/              # Unit/integration tests
├── api-tests/          # Bruno collection (committed)
│   ├── bruno.json
│   ├── environments/
│   │   ├── dev.bru
│   │   ├── ci.bru
│   │   └── .gitignore  # Exclude production.bru with real secrets
│   ├── Auth/
│   ├── Users/
│   └── Products/
├── .gitignore
└── package.json
```

## What to Commit
```gitignore
# .gitignore
# Commit these
# api-tests/**/*.bru
# api-tests/bruno.json
# api-tests/environments/dev.bru
# api-tests/environments/ci.bru

# Ignore these
api-tests/environments/production.bru
api-tests/environments/local.bru
```

## PR Requirements
- API endpoint changes MUST include corresponding Bruno test updates
- New endpoints MUST have at least success + error test cases
- Removed endpoints MUST have their Bruno tests deleted
- Collection structure changes require team review

## Anti-Patterns
- Bruno collections stored only on individual developer machines
- Collections in a separate repository from the API code
- No .gitignore for environment files with secrets
- API changes merged without updating corresponding tests
- Collections exported as JSON and stored in shared drives
