---
id: claudecode-hook-automation
stackId: claudecode
type: skill
name: Claude Code Hooks & Automation
description: >-
  Configure Claude Code hooks to automate pre-command validation, post-command
  testing, and custom triggers that maintain code quality throughout AI-assisted
  development workflows.
difficulty: intermediate
tags:
  - hooks
  - automation
  - pre-command
  - post-command
  - validation
  - testing
compatibility:
  - claude-code
prerequisites:
  - Claude Code CLI installed
  - Project with test/lint tooling configured
faq:
  - question: What are Claude Code hooks?
    answer: >-
      Claude Code hooks are custom scripts that run automatically before or
      after Claude executes commands. They enable automated quality checks like
      linting, type-checking, and testing after every code change — ensuring
      AI-generated code meets your project's standards.
  - question: How do I prevent Claude Code from introducing lint errors?
    answer: >-
      Configure a postCommand hook that runs your linter with auto-fix after
      every file change. Set onFailure to 'warn' for auto-fixable issues and
      'error' for critical violations. This catches problems immediately rather
      than discovering them later.
  - question: Can hooks run tests automatically after Claude modifies code?
    answer: >-
      Yes. Configure a postCommand hook with a condition of 'fileChanged' and a
      glob pattern matching your source files. Use 'jest --findRelatedTests' or
      similar to run only the tests affected by the changed files, keeping
      execution fast.
relatedItems:
  - claudecode-claude-md-setup
  - claudecode-mcp-integration
  - claudecode-skill-builder
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Claude Code Hooks & Automation

## Overview
Claude Code hooks let you run custom scripts before or after Claude executes commands. Use them to validate changes, run tests, enforce conventions, and automate quality checks — ensuring every AI-generated change meets your standards.

## Why This Matters
- **Automated quality gates** — tests run after every code change
- **Convention enforcement** — lint checks catch style violations immediately
- **Safety nets** — prevent destructive operations without confirmation
- **Audit trail** — log all Claude Code operations for review

## How It Works

### Step 1: Configure Hooks in settings.json
```json
{
  "hooks": {
    "preCommand": [
      {
        "command": "echo 'Starting operation...'",
        "description": "Log operation start"
      }
    ],
    "postCommand": [
      {
        "command": "npm run lint -- --fix",
        "description": "Auto-fix lint issues after changes",
        "onFailure": "warn"
      },
      {
        "command": "npm run typecheck",
        "description": "Verify TypeScript types after changes",
        "onFailure": "error"
      }
    ]
  }
}
```

### Step 2: Hook Types and Triggers
```
preCommand   — Runs BEFORE Claude executes a tool
postCommand  — Runs AFTER Claude executes a tool
onError      — Runs when Claude encounters an error
onFileChange — Runs when Claude modifies a file
```

### Step 3: Conditional Hooks
```json
{
  "hooks": {
    "postCommand": [
      {
        "command": "npm test -- --related",
        "description": "Run related tests after file changes",
        "condition": "fileChanged",
        "glob": "src/**/*.ts"
      }
    ]
  }
}
```

### Step 4: Custom Validation Scripts
```bash
#!/bin/bash
# .claude/hooks/validate-changes.sh
# Run after Claude modifies files

# Check for console.log statements
if grep -r "console.log" src/ --include="*.ts" --include="*.tsx"; then
  echo "ERROR: console.log found in source files"
  exit 1
fi

# Check for any type usage
if grep -r ": any" src/ --include="*.ts" --include="*.tsx"; then
  echo "WARNING: 'any' type detected — consider using specific types"
fi

echo "Validation passed"
```

## Hook Recipes

### Auto-Format on Change
```json
{
  "postCommand": [{
    "command": "npx prettier --write .",
    "condition": "fileChanged",
    "glob": "**/*.{ts,tsx,json}"
  }]
}
```

### Run Tests for Changed Files
```json
{
  "postCommand": [{
    "command": "npx jest --findRelatedTests $(git diff --name-only)",
    "condition": "fileChanged",
    "glob": "src/**/*.ts"
  }]
}
```

## Best Practices
- Keep hooks fast (< 5 seconds) to avoid slowing down the workflow
- Use "warn" for non-critical checks, "error" only for blockers
- Store custom hook scripts in .claude/hooks/ and commit to version control
- Test hooks locally before relying on them for team workflows
- Use glob patterns to run hooks only on relevant file changes

## Common Mistakes
- Making hooks too slow (full test suite on every change)
- Using "error" for everything (blocks Claude's workflow unnecessarily)
- Not testing hook scripts independently before configuring them
- Forgetting to make hook scripts executable (chmod +x)
