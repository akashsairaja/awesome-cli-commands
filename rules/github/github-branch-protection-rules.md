---
id: github-branch-protection-rules
stackId: github
type: rule
name: Branch Protection Configuration
description: >-
  Define mandatory branch protection rules for main and release branches —
  required reviews, status checks, signed commits, and merge strategy
  enforcement.
difficulty: beginner
globs:
  - '**/.github/**'
tags:
  - branch-protection
  - repository-settings
  - security
  - governance
  - compliance
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
  - question: What branch protection rules should every GitHub repository have?
    answer: >-
      At minimum: require pull request reviews (1 approval), require status
      checks to pass, dismiss stale reviews when new commits are pushed, and
      enforce for administrators. For compliance-sensitive repos, also require
      signed commits and CODEOWNERS approval.
  - question: Should I enforce branch protection on administrators?
    answer: >-
      Yes. The 'Include administrators' setting ensures even repo admins must
      follow the rules. Without it, admins can bypass reviews and merge without
      CI passing, which undermines the entire protection strategy and creates
      compliance gaps.
relatedItems:
  - github-pr-reviewer
  - github-codeowners-setup
  - git-branch-naming
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Branch Protection Configuration

## Rule
The `main` branch and all `release/*` branches MUST have branch protection rules configured. No direct pushes allowed.

## Required Settings

### For main branch
| Setting | Value | Reason |
|---------|-------|--------|
| Require pull request reviews | 1 minimum | Code quality gate |
| Require code owner reviews | Enabled | Domain experts review |
| Dismiss stale reviews | Enabled | Re-review after changes |
| Require status checks | Enabled | CI must pass |
| Require branches up to date | Enabled | Clean merge |
| Require signed commits | Optional | Compliance requirement |
| Require linear history | Recommended | Clean git log |
| Include administrators | Enabled | No exceptions |
| Allow force pushes | Never | Prevent history rewriting |
| Allow deletions | Never | Prevent branch deletion |

### For release/* branches
| Setting | Value |
|---------|-------|
| Require pull request reviews | 2 minimum |
| Require code owner reviews | Enabled |
| Require status checks | Enabled |
| Allow force pushes | Never |

## Configuration via GitHub CLI
```bash
# Enable branch protection on main
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["ci"]}' \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field enforce_admins=true \
  --field restrictions=null
```

## Examples

### Good
- PR with passing CI, 1+ approval, up-to-date branch merged via squash
- Hotfix PR with expedited review but still requiring CI pass

### Bad
- Direct push to main bypassing review
- PR merged with failing CI checks
- Admin merging without required approvals
- Force push to main to "fix" history

## Enforcement
Configure via GitHub repository Settings > Branches > Branch protection rules.
Use GitHub CLI or Terraform for infrastructure-as-code management of rules.
Audit with OSSF Scorecard's Branch-Protection check.
