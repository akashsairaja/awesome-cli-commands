---
id: claudecode-claude-md-setup
stackId: claudecode
type: skill
name: Writing an Effective CLAUDE.md
description: >-
  Master the art of writing CLAUDE.md files that give Claude Code the context it
  needs — project structure, conventions, anti-patterns, and workflow rules for
  consistent AI-assisted development.
difficulty: beginner
tags:
  - claude-md
  - configuration
  - project-setup
  - conventions
  - ai-context
compatibility:
  - claude-code
prerequisites:
  - Claude Code CLI installed
faq:
  - question: What is CLAUDE.md and why do I need it?
    answer: >-
      CLAUDE.md is a configuration file at your project root that tells Claude
      Code how to work with your codebase. It includes project structure, coding
      conventions, anti-patterns, and common commands. Without it, Claude Code
      has no project-specific context and may generate code that doesn't follow
      your standards.
  - question: Where should I put my CLAUDE.md file?
    answer: >-
      Put project-specific CLAUDE.md at the repository root. For personal
      preferences that apply to all projects (commit style, editor preferences),
      use ~/.claude/CLAUDE.md. Project-level rules take precedence over global
      rules when there's a conflict.
  - question: How long should CLAUDE.md be?
    answer: >-
      Keep it under 500 lines. Focus on rules, patterns, and anti-patterns — not
      documentation. Use bullet points and code examples for scanability. Link
      to external docs (README, wiki) for detailed explanations rather than
      including everything inline.
relatedItems:
  - claudecode-mcp-integration
  - claudecode-hook-automation
  - claudecode-project-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Writing an Effective CLAUDE.md

## Overview
CLAUDE.md is the configuration file that tells Claude Code how to work with your project. A well-written CLAUDE.md dramatically improves code quality, reduces mistakes, and ensures Claude follows your team's conventions. It lives at the root of your repository.

## Why This Matters
- **Context is everything** — Claude Code reads CLAUDE.md before every interaction
- **Reduces corrections** — explicit rules prevent common mistakes
- **Team consistency** — everyone gets the same AI behavior
- **Onboarding** — new team members benefit from documented conventions

## How It Works

### Step 1: Project Overview
```markdown
# Project: MyApp

## Overview
E-commerce platform built with Next.js 15, TypeScript, Tailwind CSS 4, and Supabase.
Monorepo with apps/web (frontend) and apps/api (backend).

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript 5.5 (strict mode)
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS 4 with CSS variables
```

### Step 2: Directory Structure
```markdown
## Directory Structure
\`\`\`
apps/web/
  app/           # Next.js App Router pages
  components/    # React components (PascalCase directories)
  lib/           # Utilities, services, types
  store/         # Zustand stores
apps/api/
  routes/        # Express route handlers
  middleware/    # Auth, validation, logging
  models/        # Database models
\`\`\`
```

### Step 3: Coding Conventions
```markdown
## Conventions
- Components: PascalCase directories with index.tsx barrel exports
- Hooks: camelCase with "use" prefix in lib/hooks/
- Types: defined in lib/types/, never use `any`
- Styling: Tailwind classes only, NO inline styles, NO CSS modules
- Imports: use @/ alias, group by: react > next > external > internal
- State: Zustand for client state, React Query for server state
```

### Step 4: Anti-Patterns (Critical)
```markdown
## NEVER Do
- NEVER use `any` type — use `unknown` and narrow
- NEVER use default exports (except pages and layouts)
- NEVER hardcode colors — use CSS variables via var(--)
- NEVER commit .env files with real credentials
- NEVER use useEffect for data fetching — use React Query
- NEVER add console.log to committed code
```

### Step 5: Common Commands
```markdown
## Commands
- `npm run dev` — start development server
- `npm run build` — production build
- `npm run test` — run Jest tests
- `npm run lint` — ESLint check
- `npm run typecheck` — TypeScript validation
```

## Best Practices
- Keep CLAUDE.md under 500 lines — link to external docs for details
- Use bullet points and code blocks for scanability
- Update CLAUDE.md when conventions change
- Use global ~/.claude/CLAUDE.md for personal preferences (editor style, commit format)
- Test your CLAUDE.md by asking Claude to generate code and checking compliance

## Common Mistakes
- Writing an essay instead of scannable rules (Claude loses context)
- Forgetting to include anti-patterns (Claude will make those mistakes)
- Not updating CLAUDE.md when the project evolves
- Contradicting rules between global and project CLAUDE.md
- Including entire file contents instead of patterns and examples
