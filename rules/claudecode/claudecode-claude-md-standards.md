---
id: claudecode-claude-md-standards
stackId: claudecode
type: rule
name: CLAUDE.md Structure Standards
description: >-
  Enforce consistent CLAUDE.md file structure with required sections, length
  limits, and formatting rules so Claude Code receives optimal project context
  in every interaction.
difficulty: beginner
globs:
  - '**/CLAUDE.md'
  - '**/.claude/**'
tags:
  - claude-md
  - standards
  - configuration
  - documentation
  - project-setup
compatibility:
  - claude-code
faq:
  - question: What sections are required in CLAUDE.md?
    answer: >-
      Every CLAUDE.md must include: Project Overview (tech stack and
      architecture), Directory Structure (folder layout with descriptions),
      Conventions (naming, imports, state management patterns), and
      Anti-Patterns (explicit 'never do' rules). Commands section is recommended
      but optional.
  - question: Why is there a 500-line limit on CLAUDE.md?
    answer: >-
      Claude Code reads CLAUDE.md into its context window before every
      interaction. Extremely long files waste context tokens and dilute
      important rules. Keep it concise with bullet points and code examples —
      link to external documentation for detailed explanations.
relatedItems:
  - claudecode-skill-file-conventions
  - claudecode-mcp-config-rules
  - claudecode-claude-md-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# CLAUDE.md Structure Standards

## Rule
Every project using Claude Code MUST have a CLAUDE.md at the repository root following this structure. Maximum 500 lines.

## Required Sections

### 1. Project Overview (Required)
```markdown
# Project Name

## Overview
One paragraph describing what the project does, its tech stack, and key architecture decisions.

## Tech Stack
- Framework: [name + version]
- Language: [name + version]
- Database: [name]
- Styling: [approach]
```

### 2. Directory Structure (Required)
```markdown
## Directory Structure
\`\`\`
src/
  components/   # React components
  lib/          # Utilities and services
  types/        # TypeScript type definitions
\`\`\`
```

### 3. Conventions (Required)
```markdown
## Conventions
- Naming: PascalCase components, camelCase functions
- Imports: use @/ alias, group by category
- State: Zustand for client, React Query for server
```

### 4. Anti-Patterns (Required)
```markdown
## NEVER Do
- NEVER use \`any\` type
- NEVER use default exports (except pages)
- NEVER hardcode secrets
```

### 5. Commands (Recommended)
```markdown
## Commands
- \`npm run dev\` — development server
- \`npm run build\` — production build
- \`npm run test\` — run tests
```

## Good Example
A complete, scannable CLAUDE.md with bullet points, code blocks, and clear sections under 300 lines.

## Bad Example
- A 2000-line CLAUDE.md with full file contents pasted in
- A CLAUDE.md with only "This is a Next.js project"
- A CLAUDE.md that contradicts itself between sections
- No CLAUDE.md at all

## Enforcement
Review CLAUDE.md in code review. Ensure it stays under 500 lines and includes all required sections. Update when conventions change.
