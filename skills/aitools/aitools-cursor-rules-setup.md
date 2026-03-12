---
id: aitools-cursor-rules-setup
stackId: aitools
type: skill
name: Setting Up Cursor Rules & Copilot Instructions
description: >-
  Configure AI coding tool instruction files across platforms — .cursorrules,
  copilot-instructions.md, .windsurfrules, and AGENTS.md for consistent AI
  behavior in your project.
difficulty: beginner
tags:
  - cursorrules
  - copilot-instructions
  - windsurfrules
  - ai-configuration
  - multi-tool
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - At least one AI coding tool installed
  - A project with established coding conventions
faq:
  - question: Which AI coding tool instruction file should I create first?
    answer: >-
      Start with the tool your team uses most. Create thorough instructions for
      that tool, test them, then adapt the same rules for other tools. Most
      rules translate directly — the main difference is file name and location.
  - question: How do I keep multiple AI tool instruction files in sync?
    answer: >-
      Maintain a single source of truth (e.g., CLAUDE.md or a conventions
      document) and derive other tool files from it. Consider creating a script
      that generates tool-specific files from a shared template. Update all
      files whenever conventions change.
  - question: Do AI tool instruction files affect all team members?
    answer: >-
      Yes, when committed to version control. Any developer who clones the repo
      and uses the corresponding AI tool will automatically get the
      project-specific instructions. This is the primary benefit — team-wide AI
      consistency without per-developer setup.
relatedItems:
  - aitools-system-prompt-design
  - aitools-prompt-engineer
  - claudecode-claude-md-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Setting Up Cursor Rules & Copilot Instructions

## Overview
Every major AI coding tool reads project-level configuration files for custom instructions. Setting these up correctly ensures consistent AI behavior across your team, regardless of which tool each developer uses.

## Why This Matters
- **Tool-agnostic standards** — same rules regardless of AI tool choice
- **Team consistency** — every developer's AI follows the same conventions
- **Reduced corrections** — explicit rules prevent common AI mistakes
- **Onboarding** — new developers get AI assistance that matches team patterns

## How It Works

### Step 1: Cursor Rules (.cursorrules)
```markdown
<!-- .cursorrules -->
You are a senior TypeScript engineer working on a Next.js 15 application.

## Stack
- Next.js 15 (App Router, Server Components)
- TypeScript 5.5 (strict mode)
- Tailwind CSS 4
- React Query for server state
- Zustand for client state

## Rules
- Use named exports, never default exports (except pages)
- All components must have TypeScript props interfaces
- Use server components by default, client only when needed
- Handle all errors with try/catch and error boundaries
- No inline styles — Tailwind classes only

## Patterns
- Data fetching: Server Components or React Query (never useEffect)
- Forms: React Hook Form + Zod validation
- API routes: Next.js route handlers with Zod input validation
```

### Step 2: GitHub Copilot Instructions
```markdown
<!-- .github/copilot-instructions.md -->
This is a Next.js 15 TypeScript application.

Generate code following these conventions:
- TypeScript strict mode, no `any` types
- Named exports only (except Next.js pages/layouts)
- Tailwind CSS for styling, no CSS modules or inline styles
- React Query for data fetching, Zustand for client state
- All async functions must have error handling
- Include JSDoc comments for exported functions
```

### Step 3: Windsurf Rules
```markdown
<!-- .windsurfrules -->
Project: Next.js 15 TypeScript application

Coding standards:
- Strict TypeScript, no any types
- Named exports, React functional components
- Tailwind CSS utility classes
- Server Components by default
- Error boundaries for client components
```

### Step 4: OpenAI Codex (AGENTS.md)
```markdown
<!-- AGENTS.md -->
## Project Context
Next.js 15 application with TypeScript strict mode.

## Conventions
- Named exports only
- TypeScript interfaces for all props
- Tailwind CSS for styling
- React Query for server state management
```

## File Summary
| Tool | File | Location |
|------|------|----------|
| Claude Code | CLAUDE.md | Project root |
| Cursor | .cursorrules | Project root |
| Copilot | copilot-instructions.md | .github/ |
| Windsurf | .windsurfrules | Project root |
| Codex | AGENTS.md | Project root |
| Amazon Q | rules/*.md | .amazonq/ |
| Aider | CONVENTIONS.md | Project root |

## Best Practices
- Keep all instruction files in sync — same rules, different formats
- Start with your most-used tool, then adapt for others
- Commit all instruction files to version control
- Update all files when conventions change (create a script if needed)
- Test each tool's behavior after configuration

## Common Mistakes
- Different rules in different tool files (inconsistent AI behavior)
- Forgetting to update all files when conventions change
- Not committing instruction files to version control
- Overly long instruction files (keep under 200 lines per tool)
