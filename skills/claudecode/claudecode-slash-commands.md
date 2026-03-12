---
id: claudecode-slash-commands
stackId: claudecode
type: skill
name: Custom Slash Commands
description: >-
  Create custom slash commands in Claude Code to trigger reusable workflows, run
  complex operations with a single keystroke, and standardize team interactions
  with the AI agent.
difficulty: beginner
tags:
  - slash-commands
  - custom-commands
  - workflows
  - prompts
  - productivity
compatibility:
  - claude-code
prerequisites:
  - Claude Code CLI installed
faq:
  - question: What are Claude Code slash commands?
    answer: >-
      Slash commands are shortcuts that trigger predefined prompts or workflows
      in Claude Code. Built-in commands include /help, /clear, and /review.
      Custom commands are markdown files in .claude/commands/ that standardize
      team interactions with the AI agent.
  - question: How do I create a custom slash command in Claude Code?
    answer: >-
      Create a markdown file in .claude/commands/ with the prompt text you want
      to execute. The filename becomes the command name. Use $ARGUMENTS to
      accept user-provided parameters. For example,
      .claude/commands/scaffold-component.md becomes the /scaffold-component
      command.
  - question: Can slash commands accept arguments?
    answer: >-
      Yes. Use $ARGUMENTS in your command's markdown file as a placeholder for
      user input. When a user types '/scaffold-component UserProfile', the
      $ARGUMENTS placeholder is replaced with 'UserProfile' in the prompt.
relatedItems:
  - claudecode-claude-md-setup
  - claudecode-skill-builder
  - claudecode-hook-automation
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Custom Slash Commands

## Overview
Claude Code's slash commands are shortcuts that trigger predefined prompts or workflows. Custom slash commands let you standardize how your team interacts with Claude — from code review to scaffolding to deployment checks.

## Why This Matters
- **Consistency** — every team member triggers the same high-quality prompt
- **Speed** — complex instructions reduced to a single command
- **Discoverability** — team workflows documented as commands
- **Quality** — well-crafted prompts produce better results than ad-hoc requests

## How It Works

### Step 1: Built-in Slash Commands
```
/help          — Show available commands
/clear         — Clear conversation history
/compact       — Summarize and compact context
/init          — Initialize CLAUDE.md for a project
/review        — Review code changes
/cost          — Show token usage and costs
/bug           — Report a bug in Claude Code
```

### Step 2: Create Custom Commands
```markdown
<!-- .claude/commands/review-pr.md -->
Review the current git diff against the main branch. Check for:
1. Type safety — no `any` types, proper null handling
2. Error handling — all async operations have try/catch
3. Performance — no N+1 queries, unnecessary re-renders
4. Security — no hardcoded secrets, proper input validation
5. Testing — new code has corresponding tests

Format: List issues as CRITICAL, WARNING, or SUGGESTION.
```

### Step 3: Parameterized Commands
```markdown
<!-- .claude/commands/scaffold-component.md -->
Create a new React component named $ARGUMENTS in the components directory.

Include:
- TypeScript component file with props interface
- Unit test file with React Testing Library
- Barrel export in index.ts
- Storybook story file

Follow the naming conventions in CLAUDE.md.
```

### Step 4: Workflow Commands
```markdown
<!-- .claude/commands/deploy-check.md -->
Run a pre-deployment checklist:
1. Run `npm run typecheck` and report any errors
2. Run `npm run test` and report failures
3. Run `npm run build` and report any issues
4. Check for console.log statements in src/
5. Verify no TODO/FIXME comments in changed files
6. Summarize: READY or NOT READY with reasons
```

## Organizing Commands
```
.claude/commands/
  review-pr.md           # Code review workflow
  scaffold-component.md  # Component generation
  deploy-check.md        # Pre-deploy validation
  explain-code.md        # Code explanation helper
  write-tests.md         # Test generation
  fix-types.md           # TypeScript error fixer
```

## Best Practices
- Name commands descriptively — the name should explain what it does
- Include specific criteria and formatting instructions in the prompt
- Use $ARGUMENTS for user-provided parameters
- Keep prompts focused — one purpose per command
- Test commands before sharing with the team
- Document available commands in CLAUDE.md

## Common Mistakes
- Vague prompts that produce inconsistent results
- Commands that try to do too many things at once
- Not including output format instructions
- Forgetting to commit commands to version control
- Not documenting available commands for the team
