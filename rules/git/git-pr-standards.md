---
id: git-pr-standards
stackId: git
type: rule
name: Pull Request Standards
description: >-
  Define clear standards for pull request size, descriptions, review process,
  and merge requirements to maintain code quality and fast review cycles.
difficulty: beginner
globs:
  - '**/.github/**'
  - '**/.gitlab/**'
tags:
  - pull-request
  - code-review
  - standards
  - merge-strategy
  - pr-template
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
  - question: What is the ideal pull request size?
    answer: >-
      The ideal PR is under 200 lines of changes, reviewable in under 30
      minutes. Research from Google shows that review quality drops
      significantly above 400 lines. If a PR exceeds 400 lines, split it into
      smaller, focused PRs that each address one concern.
  - question: Should I use squash merge or regular merge for pull requests?
    answer: >-
      Use squash merge for feature branches — it creates one clean commit per
      feature in main. Use regular merge commits for release branches where you
      want to preserve the full development history. Never use merge commits for
      single-commit PRs.
relatedItems:
  - git-commit-conventions
  - git-branch-naming
  - github-actions-ci
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Pull Request Standards

## Rule
All code changes MUST go through a pull request with proper description, size limits, and review requirements.

## PR Size Limits
| Category | Lines Changed | Review Time |
|----------|--------------|-------------|
| Small (ideal) | < 200 lines | < 30 min |
| Medium | 200-400 lines | 30-60 min |
| Large (split if possible) | 400-800 lines | 1-2 hours |
| Too large (must split) | > 800 lines | Reject |

## PR Description Template
```markdown
## Summary
Brief description of what this PR does and why.

## Changes
- Added X component for Y feature
- Refactored Z service to support new requirements
- Fixed bug where A caused B

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Edge cases covered

## Screenshots (if UI change)
Before | After

## Related
- Closes #123
- Refs #456
```

## Review Requirements
1. **Minimum 1 approval** before merge (2 for critical paths)
2. **All CI checks must pass** (tests, lint, type-check, security)
3. **No unresolved conversations** — all review comments addressed
4. **Branch is up to date** with base branch
5. **Self-review first** — author should review own diff before requesting

## Merge Strategy
- **Squash merge** for feature branches (clean history)
- **Merge commit** for release branches (preserve history)
- **Never** use merge commits for single-commit PRs
- **Delete branch** after merge (auto-delete recommended)

## Review Etiquette
- Review within 4 business hours of request
- Be specific in comments — suggest alternatives, not just "this is wrong"
- Use conventional comment prefixes:
  - `nit:` — nitpick, optional change
  - `suggestion:` — recommended improvement
  - `question:` — clarification needed
  - `blocker:` — must fix before merge

## Anti-Patterns
- PRs with "and" in the title (doing too many things)
- No description or just the branch name as description
- Approving without reading the code
- Leaving PRs open for more than 3 days
- Mixing refactoring with feature changes in one PR
