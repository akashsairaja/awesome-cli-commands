---
id: git-commit-conventions
stackId: git
type: rule
name: Commit Message Conventions
description: >-
  Enforce conventional commit message format across your codebase — imperative
  mood, type prefixes, scope annotations, and body formatting standards for AI
  coding agents.
difficulty: beginner
globs:
  - '**/.git/**'
  - '**/.husky/**'
  - '**/.commitlintrc*'
tags:
  - commit-messages
  - conventional-commits
  - formatting
  - standards
  - commitlint
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
  - question: Why should AI coding agents follow commit message conventions?
    answer: >-
      Consistent commit messages enable automated changelog generation, semantic
      versioning, and clear project history. When AI agents follow these
      conventions, their commits are indistinguishable from well-disciplined
      human developers and integrate seamlessly with CI/CD tooling.
  - question: 'What is the difference between feat, fix, and chore commit types?'
    answer: >-
      feat is for new user-facing features (bumps minor version). fix is for bug
      fixes (bumps patch version). chore is for maintenance tasks like
      dependency updates, build configuration, or tooling changes that don't
      affect the application code users interact with.
relatedItems:
  - git-branch-naming
  - git-pr-standards
  - git-hook-automation
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Commit Message Conventions

## Rule
All commit messages MUST follow the Conventional Commits specification.

## Format
```
<type>(<scope>): <subject>

[body]

[footer]
```

## Requirements

### Subject Line
- Use imperative mood: "Add feature" NOT "Added feature" or "Adds feature"
- Maximum 72 characters
- No period at the end
- Capitalize first letter after type prefix

### Type (Required)
- `feat`: New feature (MINOR version bump)
- `fix`: Bug fix (PATCH version bump)
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructure (no behavior change)
- `perf`: Performance improvement
- `test`: Test additions or corrections
- `chore`: Build process, dependency updates
- `ci`: CI/CD configuration changes
- `revert`: Reverting a previous commit

### Scope (Optional)
- Module or component name in parentheses
- Examples: `feat(auth)`, `fix(api)`, `docs(readme)`

### Body (Optional)
- Explain WHY the change was made, not WHAT changed
- Wrap at 72 characters per line
- Separate from subject with a blank line

### Footer (Optional)
- Reference issues: `Refs: #123`
- Close issues: `Closes: #456`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-authored-by: Name <email>`

## Examples

### Good
```
feat(auth): add Google OAuth2 login flow

Implement OAuth2 authorization code flow with PKCE for
Google sign-in. Uses the existing session management
infrastructure.

Closes: #234
```

```
fix(api): handle null response from payment gateway

The Stripe webhook handler crashed when receiving a
payment_intent.succeeded event with no metadata field.
Added null check and default values.

Refs: #567
```

### Bad
```
fixed stuff
update code
WIP
misc changes
Final fix (hopefully)
```

## Enforcement
Configure commitlint with husky or lefthook to validate
every commit message automatically. Reject non-compliant
commits at the pre-commit hook level.
