---
id: claudecode-hook-automation
stackId: claudecode
type: skill
name: >-
  Claude Code Hooks & Automation
description: >-
  Configure Claude Code hooks to automate pre-command validation, post-command
  testing, and custom triggers that maintain code quality throughout
  AI-assisted development workflows.
difficulty: intermediate
tags:
  - claudecode
  - claude
  - code
  - hooks
  - automation
  - best-practices
  - type-safety
compatibility:
  - claude-code
faq:
  - question: "When should I use the Claude Code Hooks & Automation skill?"
    answer: >-
      Configure Claude Code hooks to automate pre-command validation,
      post-command testing, and custom triggers that maintain code quality
      throughout AI-assisted development workflows. This skill provides a
      structured workflow for AI-assisted development, code generation,
      refactoring, and debugging.
  - question: "What tools and setup does Claude Code Hooks & Automation require?"
    answer: >-
      Requires npm/yarn/pnpm installed. Works with Claude Code projects.
      Review the configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
