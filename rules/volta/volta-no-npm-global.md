---
id: volta-no-npm-global
stackId: volta
type: rule
name: Volta Global Tool Installation Rule
description: >-
  Enforce using volta install instead of npm install -g for all global CLI tools
  — ensures project-aware version resolution and clean tool management.
difficulty: beginner
globs:
  - '**/package.json'
  - '**/.zshrc'
  - '**/.bashrc'
tags:
  - volta-install
  - global-tools
  - npm-global
  - best-practices
  - tool-management
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: Why can't I use npm install -g with Volta?
    answer: >-
      You can, but you shouldn't. npm globals bypass Volta's shim system and
      always use the system Node version, ignoring per-project pins. Volta
      globals are project-aware — they use the project's pinned Node version.
      Use 'volta install' for consistency.
  - question: How do I migrate my npm global tools to Volta?
    answer: >-
      List npm globals with 'npm list -g --depth=0'. Uninstall each with 'npm
      uninstall -g <tool>'. Reinstall with 'volta install <tool>'. Verify with
      'volta list all'. The tools work the same but now respect per-project Node
      versions.
relatedItems:
  - volta-pin-policy
  - volta-global-tools
  - volta-toolchain-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Volta Global Tool Installation Rule

## Rule
All global CLI tools MUST be installed with `volta install`, NEVER with `npm install -g` or `yarn global add`. This ensures tools are project-aware and cleanly managed.

## Why
Volta-installed globals use the project's pinned Node version when run inside a project. npm globals always use the system Node, causing version mismatches and subtle bugs.

## Good
```bash
volta install typescript
volta install prettier
volta install eslint
volta install tsx
```

## Bad
```bash
npm install -g typescript     # Uses system Node always
yarn global add prettier      # Not managed by Volta
sudo npm install -g eslint    # Never use sudo!
```

## Migration from npm globals
```bash
# List npm globals
npm list -g --depth=0

# Reinstall through Volta
npm uninstall -g typescript prettier eslint
volta install typescript prettier eslint

# Verify
volta list all
```

## Exception
```bash
# Only exception: tools that manage Volta itself
# npm/yarn are managed by Volta directly via volta pin
```
