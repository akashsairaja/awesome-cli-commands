---
id: aitools-system-prompt-design
stackId: aitools
type: skill
name: Designing System Prompts for Coding Agents
description: >-
  Learn to write system prompts that transform generic AI models into
  specialized coding agents — with role definitions, constraints, output
  formats, and behavioral guardrails.
difficulty: intermediate
tags:
  - system-prompts
  - prompt-engineering
  - coding-agents
  - constraints
  - few-shot
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Experience with at least one AI coding tool
  - Understanding of your project's coding conventions
faq:
  - question: What is a system prompt for AI coding tools?
    answer: >-
      A system prompt is the foundational instruction set given to an AI model
      before user interactions. For coding tools, it defines the AI's role
      (e.g., senior TypeScript engineer), coding constraints (no any types,
      always handle errors), output format, and behavioral guardrails that
      ensure consistent, high-quality code generation.
  - question: How long should a system prompt be?
    answer: >-
      Keep system prompts under 2000 tokens (roughly 1500 words). Include role
      definition, 5-10 key constraints, output format specification, and 1-2
      examples. Longer prompts waste context window space and can cause the
      model to lose focus on critical rules.
  - question: Where do system prompts go in different AI tools?
    answer: >-
      Claude Code: CLAUDE.md at project root. Cursor: .cursorrules file. GitHub
      Copilot: .github/copilot-instructions.md. Windsurf: .windsurfrules. Amazon
      Q: .amazonq/rules/. Aider: CONVENTIONS.md. Each tool reads its specific
      file as the system prompt.
relatedItems:
  - aitools-rag-patterns
  - aitools-tool-use-patterns
  - aitools-context-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Designing System Prompts for Coding Agents

## Overview
System prompts define how an AI coding assistant behaves. A well-designed system prompt transforms a generic model into a specialized agent that follows your conventions, avoids anti-patterns, and produces consistent output.

## Why This Matters
- **Consistency** — every interaction follows the same coding standards
- **Quality** — explicit constraints prevent common AI mistakes
- **Efficiency** — structured output eliminates back-and-forth corrections
- **Safety** — behavioral guardrails prevent harmful code generation

## How It Works

### Step 1: Define the Role
```markdown
You are a senior TypeScript engineer specializing in Next.js App Router
applications. You write production-quality code with comprehensive error
handling, type safety, and accessibility.
```

### Step 2: Set Constraints
```markdown
## Rules
- ALWAYS use TypeScript strict mode — no `any` types
- ALWAYS handle errors with try/catch and proper error boundaries
- NEVER use default exports (except Next.js pages/layouts)
- NEVER use useEffect for data fetching — use React Query or Server Components
- ALWAYS include JSDoc comments for public functions
- Output ONLY code — no explanations unless asked
```

### Step 3: Specify Output Format
```markdown
## Output Format
When generating components, use this structure:
1. Imports (React, external, internal — grouped with blank lines)
2. Type definitions (Props interface)
3. Component implementation (named export)
4. Helper functions (below component)

Include file path as first-line comment: // src/components/Button.tsx
```

### Step 4: Add Few-Shot Examples
```markdown
## Example

### Input: "Create a loading button component"

### Output:
// src/components/LoadingButton.tsx
import React from 'react';

interface LoadingButtonProps {
  label: string;
  isLoading: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function LoadingButton({ label, isLoading, onClick, disabled }: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className="btn-primary"
    >
      {isLoading ? <Spinner size="sm" /> : label}
    </button>
  );
}
```

## Best Practices
- Keep system prompts under 2000 tokens for optimal context usage
- Include both positive rules (ALWAYS) and negative rules (NEVER)
- Test with 10+ varied inputs before deploying
- Version control your system prompts like code
- Update prompts when project conventions change

## Common Mistakes
- No output format specification (inconsistent results every time)
- Only positive rules without NEVER constraints (AI fills gaps with bad patterns)
- Too long (> 3000 tokens) — critical rules get lost in the noise
- No examples (AI guesses your patterns instead of following them)
- Testing with only happy-path inputs
