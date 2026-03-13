---
id: git-interactive-rebase
stackId: git
type: skill
name: >-
  Interactive Rebase & History Rewriting
description: >-
  Clean up messy commit history with interactive rebase — squash, reorder,
  edit, and split commits to create a polished, reviewable Git history.
difficulty: beginner
tags:
  - git
  - interactive
  - rebase
  - history
  - rewriting
  - api
  - best-practices
  - code-review
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Interactive Rebase & History Rewriting skill?"
    answer: >-
      Clean up messy commit history with interactive rebase — squash, reorder,
      edit, and split commits to create a polished, reviewable Git history.
      This skill provides a structured workflow for branching strategies,
      workflow automation, hook scripts, and repository maintenance.
  - question: "What tools and setup does Interactive Rebase & History Rewriting require?"
    answer: >-
      Works with standard Git tooling (Git CLI, git hooks). No special setup
      required beyond a working version control environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Interactive Rebase & History Rewriting

## Overview
Interactive rebase (`git rebase -i`) lets you rewrite commit history before sharing it. Squash WIP commits, reorder for logical flow, edit messages, and split oversized commits into focused units.

## When to Use
- Before creating a PR — clean up your local commits
- After code review feedback — reorganize commits logically
- To combine "fix typo" and "WIP" commits into meaningful units

## When NOT to Use
- On commits already pushed to shared branches (main, develop)
- On public/open-source branches others have forked
- If you're not comfortable with conflict resolution

## Basic Usage
```bash
# Rebase the last 5 commits
git rebase -i HEAD~5

# Rebase all commits since branching from main
git rebase -i main
```

## The Interactive Menu
```
pick abc1234 Add user model
pick def5678 WIP: working on auth
pick ghi9012 Fix typo in user model
pick jkl3456 Add authentication middleware
pick mno7890 Fix lint errors
```

## Available Commands
| Command | Short | What It Does |
|---------|-------|-------------|
| `pick` | `p` | Keep commit as-is |
| `reword` | `r` | Keep commit, edit message |
| `edit` | `e` | Pause to amend commit |
| `squash` | `s` | Merge into previous commit, combine messages |
| `fixup` | `f` | Merge into previous, discard this message |
| `drop` | `d` | Remove commit entirely |

## Common Workflows

### Squash WIP Commits
```
pick abc1234 Add user model
fixup ghi9012 Fix typo in user model
pick def5678 Add authentication middleware
fixup mno7890 Fix lint errors
```
Result: 2 clean commits instead of 5 messy ones.

### Reorder Commits for Logical Flow
```
pick abc1234 Add user model
pick def5678 Add authentication middleware
pick ghi9012 Add API routes for users
```

### Split a Large Commit
```bash
# Mark the commit as "edit"
# When rebase pauses:
git reset HEAD~1              # Undo the commit, keep changes
git add src/models/           # Stage first logical group
git commit -m "Add user and post models"
git add src/routes/           # Stage second logical group
git commit -m "Add API routes"
git rebase --continue
```

## Safety Tips
- Always create a backup branch before rebasing: `git branch backup-before-rebase`
- If things go wrong: `git rebase --abort` returns to original state
- Use `git reflog` to recover lost commits after a bad rebase
- Never rebase commits that have been pushed to shared branches

## Best Practices
- Rebase BEFORE pushing, never after others have pulled
- Aim for each commit to be independently buildable and testable
- Use `fixup` (not `squash`) when the intermediate message has no value
- Group related changes together in the final history
