---
id: aitools-context-inclusion-rules
stackId: aitools
type: rule
name: AI Context Inclusion Rules
description: >-
  Define what files and information to include in AI coding tool context —
  priority ordering, exclusion patterns, and token budget allocation for optimal
  code generation results.
difficulty: intermediate
globs:
  - '**/.cursorignore'
  - '**/.copilotignore'
  - '**/.gitignore'
tags:
  - context-management
  - token-budget
  - cursorignore
  - file-selection
  - optimization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: What files should I include when prompting AI coding tools?
    answer: >-
      Prioritize: type definitions first (highest information density), then the
      file being modified and its direct dependencies, then relevant test files,
      then one example of the same pattern. Always exclude node_modules, build
      outputs, and generated files.
  - question: How does .cursorignore improve AI code suggestions?
    answer: >-
      The .cursorignore file tells Cursor which files to exclude from its
      context and indexing. By excluding build artifacts, generated files, and
      irrelevant large files, you reduce noise in the context window, leading to
      more relevant and accurate code suggestions.
relatedItems:
  - aitools-prompt-structure-rules
  - aitools-output-format-rules
  - aitools-context-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# AI Context Inclusion Rules

## Rule
When providing context to AI coding tools, follow the priority hierarchy and exclusion rules to maximize signal-to-noise ratio in the context window.

## Priority Hierarchy (Include in This Order)
1. **Type definitions** — interfaces, schemas, enums (highest priority)
2. **Configuration** — tsconfig.json, .eslintrc, package.json
3. **Related implementation** — the file being modified and its direct dependencies
4. **Test files** — existing tests for the code being modified
5. **Examples** — one well-written implementation of the same pattern
6. **Documentation** — relevant README sections or API docs

## Exclusion Rules

### ALWAYS Exclude
```
node_modules/
dist/
build/
.next/
coverage/
*.min.js
*.min.css
*.map
*.lock
.git/
```

### Configure in .cursorignore / .copilotignore
```gitignore
# Build artifacts
dist/
build/
.next/
out/

# Dependencies
node_modules/
.pnpm-store/

# Generated files
*.generated.ts
*.d.ts.map
coverage/

# Large data files
*.csv
*.sql
data/fixtures/
```

## Token Budget Allocation
| Context Type | Budget % | Example |
|-------------|----------|---------|
| Types/Interfaces | 30% | 600 tokens |
| Current file + deps | 40% | 800 tokens |
| Tests/Examples | 20% | 400 tokens |
| Docs/Config | 10% | 200 tokens |

## Good Context Selection
```
# Task: Add new API endpoint for user preferences
Include:
  types/user.ts          # User and Preference types
  api/users/route.ts     # Existing pattern to follow
  api/users/route.test.ts # Test patterns
  lib/db.ts              # Database helper signatures
```

## Bad Context Selection
```
# Same task, bad selection
Include:
  Everything in src/     # Way too much, most irrelevant
  package.json           # 500 lines of dependencies
  README.md              # Generic project description
  # Missing: type definitions and existing patterns
```

## Anti-Patterns
- "Just include everything" (context pollution, worse results)
- Missing type definitions (AI invents types)
- Including unrelated files (AI gets confused by irrelevant patterns)
- No .cursorignore configured (generated files pollute suggestions)
