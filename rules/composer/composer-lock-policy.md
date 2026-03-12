---
id: composer-lock-policy
stackId: composer
type: rule
name: Composer Lock File Policy
description: >-
  Enforce composer.lock management rules — commit for applications, ignore for
  libraries, use install in CI, and update workflow for controlled dependency
  upgrades.
difficulty: beginner
globs:
  - '**/composer.json'
  - '**/composer.lock'
  - '**/.gitignore'
tags:
  - composer-lock
  - dependency-locking
  - reproducible-installs
  - update-workflow
  - ci-policy
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why must composer.lock be committed for applications?
    answer: >-
      composer.lock records the exact versions of every installed package.
      Without it, 'composer install' resolves versions dynamically, potentially
      installing different versions than what was tested. Committing the lock
      file ensures every developer and server runs identical code.
  - question: Why should libraries NOT commit composer.lock?
    answer: >-
      Libraries are consumed by applications. When an application runs 'composer
      install', it resolves the library's dependencies according to its own
      constraints. A library's lock file is irrelevant to consumers and can
      cause confusion. Libraries should test against a range of dependency
      versions.
relatedItems:
  - composer-json-standards
  - composer-security-standards
  - composer-ci-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Composer Lock File Policy

## Rule
composer.lock MUST be committed for applications and MUST NOT be committed for library packages.

## Requirements
1. **Applications** — always commit composer.lock (Laravel, Symfony, WordPress)
2. **Libraries** — add composer.lock to .gitignore (Packagist packages)
3. **CI/CD** — always use `composer install` (reads lock file)
4. **Updates** — use `composer update package/name` for targeted updates
5. **Review** — review composer.lock diffs in pull requests

## Examples

### Good — Application .gitignore
```gitignore
/vendor/
# Do NOT ignore composer.lock for applications
```

### Good — Library .gitignore
```gitignore
/vendor/
composer.lock
```

### Good — Update Workflow
```bash
# Update a specific package
composer update guzzlehttp/guzzle

# Update all packages (review carefully)
composer update

# Check what would be updated (dry run)
composer update --dry-run

# Review lock file changes
git diff composer.lock
```

### Bad
```bash
# Running update in CI — installs untested versions
composer update --no-dev --prefer-dist  # WRONG

# Correct CI command
composer install --no-dev --prefer-dist  # RIGHT
```

## Enforcement
CI pipelines must use `composer install`. Add a CI check that verifies composer.lock exists for application repositories. Use pre-commit hooks to prevent accidental lock file removal.
