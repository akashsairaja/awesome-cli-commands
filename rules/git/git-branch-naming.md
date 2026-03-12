---
id: git-branch-naming
stackId: git
type: rule
name: Branch Naming Conventions
description: >-
  Standardize Git branch naming patterns with type prefixes, kebab-case
  formatting, and issue references for consistent, scannable repository
  navigation.
difficulty: beginner
globs:
  - '**/.git/**'
tags:
  - branch-naming
  - conventions
  - kebab-case
  - standards
  - organization
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
  - question: Why do branch naming conventions matter?
    answer: >-
      Consistent branch names improve repository navigation, enable automation
      (CI/CD triggers based on branch type), and make it easy to understand what
      work is happening at a glance. They also help with branch cleanup and
      release management.
  - question: Should I include issue numbers in branch names?
    answer: >-
      Yes, when your project uses an issue tracker. Including the issue number
      (e.g., feat/123-user-auth) creates a direct link between the branch and
      the requirement, making it easy to trace work back to its origin.
relatedItems:
  - git-commit-conventions
  - git-pr-standards
  - git-trunk-based-development
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Branch Naming Conventions

## Rule
All branches MUST follow the pattern: `<type>/<description>` using kebab-case.

## Format
```
<type>/<short-description>
<type>/<issue-number>-<short-description>
```

## Branch Types
| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/user-avatar-upload` |
| `fix/` | Bug fix | `fix/login-redirect-loop` |
| `docs/` | Documentation | `docs/api-authentication-guide` |
| `refactor/` | Code restructure | `refactor/extract-pricing-service` |
| `test/` | Test additions | `test/payment-edge-cases` |
| `chore/` | Maintenance | `chore/upgrade-react-19` |
| `hotfix/` | Urgent production fix | `hotfix/null-pointer-checkout` |
| `release/` | Release preparation | `release/2.4.0` |

## With Issue Numbers
```
feat/123-user-avatar-upload
fix/456-login-redirect-loop
```

## Rules
1. **Always use kebab-case** (lowercase, hyphens): `feat/my-feature`
2. **Never use spaces or uppercase**: ~~`feat/My Feature`~~
3. **Keep it short**: 3-5 words maximum in description
4. **Be descriptive**: `feat/user-auth` not `feat/stuff`
5. **Include issue number** when applicable: `fix/789-null-check`
6. **Delete after merge**: Clean up branches to avoid clutter
7. **One concern per branch**: Don't mix features with fixes

## Protected Branch Rules
```
main (or master)     — production code, never push directly
develop              — integration branch (if using Git Flow)
release/*            — release preparation branches
```

## Anti-Patterns
```bash
# Bad branch names (never do these)
git checkout -b "my branch"      # Spaces
git checkout -b fix               # Too vague
git checkout -b FEAT/MyFeature    # Wrong case
git checkout -b wip               # Meaningless
git checkout -b johns-stuff       # Personal, not descriptive
git checkout -b test123           # No type prefix
```
