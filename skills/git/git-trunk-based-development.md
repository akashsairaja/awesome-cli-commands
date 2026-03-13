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
  - git
  - trunk-based
  - development
  - feature
  - flags
  - ci-cd
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Trunk-Based Development with Feature Flags skill?"
    answer: >-
      Master trunk-based development — the modern Git workflow where
      developers integrate small changes to main daily, using feature flags
      instead of long-lived branches. This skill provides a structured
      workflow for branching strategies, workflow automation, hook scripts,
      and repository maintenance.
  - question: "What tools and setup does Trunk-Based Development with Feature Flags require?"
    answer: >-
      Works with standard Git tooling (Git CLI, git hooks). No special setup
      required beyond a working version control environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
