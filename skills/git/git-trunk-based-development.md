---
id: git-trunk-based-development
stackId: git
type: skill
name: Trunk-Based Development with Feature Flags
description: >-
  Master trunk-based development — the modern Git workflow where developers
  integrate small changes to main daily, using feature flags instead of
  long-lived branches.
difficulty: intermediate
tags:
  - trunk-based-development
  - feature-flags
  - branching-strategy
  - continuous-delivery
  - ci-cd
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Git 2.30+
  - 'CI/CD pipeline (GitHub Actions, GitLab CI, etc.)'
  - Feature flag system (optional but recommended)
faq:
  - question: What is trunk-based development in Git?
    answer: >-
      Trunk-based development is a Git workflow where developers integrate
      small, incremental changes directly to the main branch (trunk) at least
      once per day. Instead of long-lived feature branches, developers use
      short-lived branches (1-2 days max) and feature flags to hide incomplete
      work.
  - question: How is trunk-based development different from Git Flow?
    answer: >-
      Git Flow uses multiple long-lived branches (develop, release, hotfix) and
      features branches that can live for weeks. Trunk-based development uses
      only main plus short-lived feature branches (1-2 days). TBD is simpler,
      reduces merge conflicts, and enables continuous delivery.
  - question: Can trunk-based development work for large teams?
    answer: >-
      Yes — Google, Meta, and Microsoft use trunk-based development with
      thousands of engineers. The keys are: automated CI that runs fast (<10
      min), feature flags for incomplete work, small focused PRs, and strong
      code review culture.
  - question: >-
      What are feature flags and why are they needed for trunk-based
      development?
    answer: >-
      Feature flags are conditional switches in code that enable or disable
      features at runtime. In trunk-based development, they let you merge
      incomplete code to main safely — the flag keeps it hidden from users until
      the feature is complete and tested.
relatedItems:
  - git-commit-conventions
  - git-interactive-rebase
  - github-pr-workflow
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Trunk-Based Development with Feature Flags

## Overview
Trunk-based development (TBD) is the Git workflow standard for high-performing engineering teams. Instead of maintaining long-lived feature branches, developers commit directly to main (or merge short-lived branches within 1-2 days) and use feature flags to hide incomplete work.

## Why This Matters
- **Reduces merge conflicts** — daily integration means small diffs
- **Enables continuous delivery** — main is always deployable
- **Faster feedback loops** — CI runs on every push to main
- **Eliminates integration hell** — no more week-long merge sprints

## How It Works

### Step 1: Create Short-Lived Feature Branches
```bash
# Branch from main, name descriptively
git checkout -b feat/user-avatar main

# Work in small increments — aim to merge within 1-2 days
git add -p  # Stage changes interactively
git commit -m "Add avatar upload component skeleton"
```

### Step 2: Use Feature Flags for Incomplete Work
```typescript
// Instead of hiding work in a branch, hide it behind a flag
if (featureFlags.isEnabled('user-avatar-upload')) {
  return <AvatarUploader />;
}
return <AvatarPlaceholder />;
```

### Step 3: Integrate Daily
```bash
# Keep your branch fresh
git fetch origin main
git rebase origin/main

# Push and create PR (should be small, reviewable)
git push -u origin feat/user-avatar
```

### Step 4: Squash Merge to Main
```bash
# On GitHub/GitLab, use "Squash and merge" for clean history
# One commit per feature in main branch
```

## Best Practices
- **Commit frequency**: At least once per day to main
- **Branch lifetime**: Maximum 2 days before merging
- **PR size**: Under 400 lines of changes (ideally under 200)
- **CI requirement**: All tests must pass before merge
- **Feature flags**: Use LaunchDarkly, Unleash, or simple env-based flags

## Common Mistakes
- Keeping feature branches alive for weeks (defeats the purpose)
- Not rebasing before merge (creates unnecessary merge commits)
- Skipping CI checks to merge faster
- Using feature flags without a cleanup process (flag debt)

## When NOT to Use Trunk-Based Development
- Open source projects with external contributors (use fork-based workflow)
- Projects requiring formal release branches (e.g., mobile apps with app store review)
- Teams with no CI/CD pipeline (fix that first)
