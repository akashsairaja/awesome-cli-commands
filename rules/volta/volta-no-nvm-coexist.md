---
id: volta-no-nvm-coexist
stackId: volta
type: rule
name: No nvm/Volta Coexistence Rule
description: >-
  Enforce that nvm, fnm, n, and Volta are never installed simultaneously — only
  one Node.js version manager allowed to prevent PATH conflicts and version
  confusion.
difficulty: beginner
globs:
  - '**/.zshrc'
  - '**/.bashrc'
  - '**/.nvmrc'
  - '**/.node-version'
tags:
  - nvm
  - version-manager-conflict
  - path-resolution
  - cleanup
  - migration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Can I run nvm and Volta at the same time?
    answer: >-
      No. Both modify PATH to intercept 'node' and 'npm' commands. Which one
      wins depends on PATH order, leading to unpredictable behavior. Remove nvm
      completely (delete ~/.nvm and shell config lines) before using Volta.
  - question: How do I check if another version manager is conflicting?
    answer: >-
      Run 'which node' — it should show ~/.volta/bin/node if Volta is your
      manager. If it shows ~/.nvm/ or another path, you have a conflict. Check
      .zshrc/.bashrc for nvm/fnm initialization lines and remove them.
relatedItems:
  - volta-pin-policy
  - volta-migration-specialist
  - volta-toolchain-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# No nvm/Volta Coexistence Rule

## Rule
Only ONE Node.js version manager may be installed at a time. If using Volta, completely remove nvm, fnm, n, or nodenv. Running multiple version managers causes PATH conflicts and unpredictable behavior.

## Removal Checklist

### Remove nvm
```bash
# Remove nvm directory
rm -rf ~/.nvm

# Remove from shell config (.zshrc, .bashrc)
# Delete these lines:
# export NVM_DIR="$HOME/.nvm"
# [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
```

### Remove fnm
```bash
rm -rf ~/.fnm
# Remove 'eval "$(fnm env)"' from shell config
```

### Remove n
```bash
npm uninstall -g n
rm -rf /usr/local/n
```

### Verify Clean State
```bash
# Should only show Volta's shim
which node    # → ~/.volta/bin/node
which npm     # → ~/.volta/bin/npm

# Should return nothing
command -v nvm   # → (empty)
command -v fnm   # → (empty)
```

## Good
```bash
# Only Volta installed
which node  # ~/.volta/bin/node
volta list  # Shows managed versions
```

## Bad
```bash
# Both installed — CONFLICT
which node  # Could be nvm OR Volta depending on PATH order
nvm use 18  # Overrides Volta's pin!
```
