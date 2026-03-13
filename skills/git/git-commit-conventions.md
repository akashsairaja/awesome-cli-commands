---
id: git-commit-conventions
stackId: git
type: skill
name: >-
  Conventional Commits & Semantic Versioning
description: >-
  Implement conventional commit messages that enable automated changelog
  generation, semantic versioning, and clear project history.
difficulty: intermediate
tags:
  - git
  - conventional
  - commits
  - semantic
  - versioning
  - performance
  - deployment
  - api
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
faq:
  - question: "When should I use the Conventional Commits & Semantic Versioning skill?"
    answer: >-
      Implement conventional commit messages that enable automated changelog
      generation, semantic versioning, and clear project history. It includes
      practical examples for version control development.
  - question: "What tools and setup does Conventional Commits & Semantic Versioning require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with Git projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Conventional Commits & Semantic Versioning

## Overview
Conventional Commits is a specification for writing standardized commit messages that are both human-readable and machine-parseable. When combined with semantic versioning, it enables automated changelogs, release notes, and version bumping.

## The Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

## Commit Types
| Type | When to Use | Version Bump |
|------|-------------|-------------|
| `feat` | New feature | MINOR (1.x.0) |
| `fix` | Bug fix | PATCH (1.0.x) |
| `docs` | Documentation only | None |
| `style` | Formatting, no code change | None |
| `refactor` | Code restructure, no behavior change | None |
| `perf` | Performance improvement | PATCH |
| `test` | Adding or fixing tests | None |
| `chore` | Build process, dependencies | None |
| `ci` | CI configuration changes | None |
| `revert` | Reverting a previous commit | Depends |

## Breaking Changes
```bash
# Add ! after type for breaking changes (bumps MAJOR version)
feat!: remove deprecated login endpoint

# Or use BREAKING CHANGE footer
feat(auth): migrate to OAuth2

BREAKING CHANGE: The /api/login endpoint has been removed.
Use /api/oauth/authorize instead.
```

## Real Examples
```bash
# Good commits
git commit -m "feat(auth): add Google OAuth2 login flow"
git commit -m "fix(api): handle null response from payment gateway"
git commit -m "docs(readme): add deployment instructions for AWS"
git commit -m "perf(db): add composite index on users(email, created_at)"
git commit -m "refactor(cart): extract pricing logic into PricingService"

# Bad commits (avoid these)
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "update"
git commit -m "Fixed the bug that John found"
```

## Tooling Setup
```bash
# Install commitlint + husky for enforcement
npm install -D @commitlint/cli @commitlint/config-conventional husky

# Configure commitlint
echo '{ "extends": ["@commitlint/config-conventional"] }' > .commitlintrc.json

# Set up husky hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
```

## Best Practices
- Keep subject line under 72 characters
- Use imperative mood: "Add feature" not "Added feature"
- One logical change per commit
- Reference issue numbers in footer: `Refs: #123`
- Use body to explain WHY, not WHAT (the diff shows what changed)

## Common Mistakes
- Mixing unrelated changes in one commit
- Using past tense ("Fixed", "Added") instead of imperative ("Fix", "Add")
- Commit messages that describe the file changed, not the behavior
- Forgetting to add scope for large projects
