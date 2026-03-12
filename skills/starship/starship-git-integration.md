---
id: starship-git-integration
stackId: starship
type: skill
name: Starship Git Status & Branch Display
description: >-
  Configure Starship's git modules for rich repository status display — branch
  names, ahead/behind counts, modified/staged indicators, and stash counts with
  custom symbols.
difficulty: beginner
tags:
  - git-status
  - git-branch
  - prompt-git
  - starship-git
  - version-control
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Starship installed
  - Git 2.30+
faq:
  - question: How do I show git status in my Starship prompt?
    answer: >-
      Configure the [git_status] module in starship.toml with format, style, and
      indicator symbols. By default, Starship shows modified (!), staged (+),
      untracked (?), and ahead/behind (⇡⇣) counts. Add count variables like
      '!${count}' to show how many files are affected.
  - question: Why is my Starship prompt slow in large git repositories?
    answer: >-
      Git status scanning is expensive in large repos. Set 'command_timeout =
      1000' globally, add 'ignore_submodules = true' under [git_status], and
      consider disabling git_status for specific repos with a local
      starship.toml. Profile with STARSHIP_LOG=trace.
relatedItems:
  - starship-module-config
  - starship-prompt-designer
  - git-workflow-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Starship Git Status & Branch Display

## Overview
Git status in your prompt is the single most useful piece of contextual information for developers. Starship's git modules show branch name, modification status, ahead/behind counts, and more — all updated in real-time as you work.

## Why This Matters
- **Instant awareness** — see uncommitted changes without running git status
- **Branch safety** — always know which branch you're on
- **Sync status** — see if you need to push/pull
- **Stash reminder** — don't forget stashed changes

## How It Works

### Step 1: Configure git_branch
```toml
[git_branch]
format = "[$symbol$branch(:$remote_branch)]($style) "
symbol = " "  # Nerd Font git branch icon
style = "bold purple"
truncation_length = 30
truncation_symbol = "..."
```

### Step 2: Configure git_status
```toml
[git_status]
format = '([[$all_status$ahead_behind]]($style) )'
style = "bold red"

# Individual indicators
conflicted = "="
ahead = "⇡${count}"
behind = "⇣${count}"
diverged = "⇕⇡${ahead_count}⇣${behind_count}"
untracked = "?${count}"
stashed = "*${count}"
modified = "!${count}"
staged = "+${count}"
renamed = "»${count}"
deleted = "✘${count}"
```

### Step 3: Configure git_commit & git_state
```toml
[git_commit]
format = '[($hash$tag)]($style) '
style = "bold green"
only_detached = true
tag_disabled = false
tag_symbol = " 🏷 "

[git_state]
format = '[($state( $progress_current of $progress_total))]($style) '
cherry_pick = "[🍒 PICKING](bold red)"
rebase = "[REBASING](bold yellow)"
merge = "[MERGING](bold blue)"
```

## Reading the Prompt
```
~/projects/myapp   main [+2 !3 ?1 ⇡1]
│                  │     │  │  │  └─ 1 commit ahead of remote
│                  │     │  │  └──── 1 untracked file
│                  │     │  └─────── 3 modified files
│                  │     └────────── 2 staged files
│                  └──────────────── branch name
└─────────────────────────────────── directory
```

## Performance Optimization
```toml
# For large repos (100k+ files), limit git scanning
[git_status]
windows_starship = '/mnt/c/starship.exe'  # WSL optimization

# Increase timeout for slow network repos
command_timeout = 1000  # ms (global setting)

# Disable expensive status checks if needed
[git_status]
disabled = false
ignore_submodules = true  # Skip submodule status
```

## Best Practices
- **Always show git_branch** — most essential module
- **Use counts** in git_status — `!${count}` not just `!`
- **Set truncation** for long branch names (30 chars max)
- **Show git_state** for rebase/merge/cherry-pick awareness
- **Test in large repos** — ensure prompt stays fast

## Common Mistakes
- Disabling git_status (losing the most useful information)
- Not using count variables (can't tell 1 vs 100 modified files)
- No truncation on branch names (feat/very-long-branch-name-overflows)
- Ignoring git_state (confused during rebase operations)
