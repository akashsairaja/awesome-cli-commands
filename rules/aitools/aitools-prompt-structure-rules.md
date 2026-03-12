---
id: aitools-prompt-structure-rules
stackId: aitools
type: rule
name: AI Prompt Structure Standards
description: >-
  Enforce consistent prompt structure across AI coding tools — role definitions,
  constraint formatting, output specifications, and example inclusion for
  reliable AI-assisted development.
difficulty: beginner
globs:
  - '**/CLAUDE.md'
  - '**/.cursorrules'
  - '**/.github/copilot-instructions.md'
  - '**/.windsurfrules'
  - '**/AGENTS.md'
tags:
  - prompt-structure
  - standards
  - ai-instructions
  - formatting
  - constraints
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why do AI coding prompts need a standard structure?
    answer: >-
      Consistent structure ensures AI tools receive complete context: role
      (expertise level), constraints (what to do/avoid), output format (code
      structure), and examples (reference patterns). Without structure, prompts
      are often missing critical sections, leading to inconsistent code
      generation.
  - question: How many constraints should a system prompt include?
    answer: >-
      Focus on 5-10 key constraints that address your most common AI mistakes.
      More than 15 constraints dilutes attention — the AI can't reliably follow
      all of them. Prioritize type safety, error handling, naming conventions,
      and your most violated patterns.
relatedItems:
  - aitools-context-inclusion-rules
  - aitools-output-format-rules
  - aitools-system-prompt-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# AI Prompt Structure Standards

## Rule
All system prompts and instruction files for AI coding tools MUST follow a consistent structure with role, constraints, output format, and examples.

## Required Structure
```markdown
## Role
[One paragraph: who the AI is and what it specializes in]

## Stack
[Bullet list of technologies with versions]

## Rules
[ALWAYS/NEVER constraints with specific patterns]

## Output Format
[How generated code should be structured]

## Examples
[At least one good/bad pair for key patterns]
```

## Constraint Formatting

### Good — Specific and Actionable
```markdown
- ALWAYS use TypeScript interfaces for component props (not type aliases)
- NEVER use `any` — use `unknown` with type narrowing instead
- ALWAYS wrap async operations in try/catch with typed error handling
- NEVER use default exports except for Next.js pages and layouts
```

### Bad — Vague and Unenforceable
```markdown
- Write good TypeScript
- Handle errors properly
- Use best practices
- Follow conventions
```

## Example Requirements
- Include at least one good/bad example pair per major pattern
- Examples should be real code, not pseudocode
- Include file path comment at the top of each example

## Length Limits
| Tool | Max Lines | Max Tokens |
|------|-----------|------------|
| CLAUDE.md | 500 lines | ~4000 tokens |
| .cursorrules | 200 lines | ~2000 tokens |
| copilot-instructions.md | 150 lines | ~1500 tokens |
| .windsurfrules | 150 lines | ~1500 tokens |

## Anti-Patterns
- "Write clean code" (unmeasurable, AI interprets differently each time)
- 50+ constraints (AI can't follow that many — prioritize top 10)
- No examples (AI guesses your patterns)
- Contradicting constraints in different sections
