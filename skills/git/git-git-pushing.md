---
id: git-git-pushing
stackId: git
type: skill
name: Git Pushing
description: >-
  Stage, commit, and push git changes with conventional commit messages.
difficulty: intermediate
tags:
  - git
  - pushing
compatibility:
  - claude-code
faq:
  - question: "When should I use the Git Pushing skill?"
    answer: >-
      Stage, commit, and push git changes with conventional commit messages.
      This skill provides a structured workflow for branching strategies,
      workflow automation, hook scripts, and repository maintenance.
  - question: "What tools and setup does Git Pushing require?"
    answer: >-
      Works with standard Git tooling (Git CLI, git hooks). No special setup
      required beyond a working version control environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Git Push Workflow

Stage all changes, create a conventional commit, and push to the remote branch.

## When to Use

Automatically activate when the user:

- Explicitly asks to push changes ("push this", "commit and push")
- Mentions saving work to remote ("save to github", "push to remote")
- Completes a feature and wants to share it
- Says phrases like "let's push this up" or "commit these changes"

## Workflow

**ALWAYS use the script** - do NOT use manual git commands:

```bash
bash skills/git-pushing/scripts/smart_commit.sh
```

With custom message:

```bash
bash skills/git-pushing/scripts/smart_commit.sh "feat: add feature"
```

Script handles: staging, conventional commit message, Claude footer, push with -u flag.
