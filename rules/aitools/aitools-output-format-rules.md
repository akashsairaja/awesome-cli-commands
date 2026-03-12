---
id: aitools-output-format-rules
stackId: aitools
type: rule
name: AI Output Format Standards
description: >-
  Standardize how AI coding tools format their output — file path headers, code
  block language tags, import ordering, and response structure for predictable,
  copy-paste-ready results.
difficulty: beginner
globs:
  - '**/CLAUDE.md'
  - '**/.cursorrules'
  - '**/.github/copilot-instructions.md'
tags:
  - output-format
  - code-formatting
  - imports
  - file-paths
  - standards
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: Why should AI output include file path headers?
    answer: >-
      File path headers tell the developer exactly where generated code belongs
      in the project structure. Without them, developers waste time figuring out
      file locations, and the code may end up in the wrong directory or with the
      wrong filename.
  - question: How do I enforce import ordering in AI-generated code?
    answer: >-
      Include the import ordering rules in your system prompt with a clear
      example. Group imports as: framework imports, external libraries, internal
      imports with @ alias, and type imports. Most AI tools follow the pattern
      consistently once it's demonstrated with an example.
relatedItems:
  - aitools-prompt-structure-rules
  - aitools-context-inclusion-rules
  - aitools-system-prompt-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# AI Output Format Standards

## Rule
All AI-generated code MUST include file path headers, proper language tags, and follow the project's import ordering conventions. Output should be copy-paste ready.

## File Path Headers
```typescript
// src/components/UserProfile/UserProfile.tsx
import React from 'react';
// ... rest of code
```

### Good
```typescript
// src/components/UserProfile.tsx
export function UserProfile() { ... }
```

### Bad
```typescript
// No file path — where does this go?
export function UserProfile() { ... }
```

## Code Block Language Tags
Always specify the language for syntax highlighting:

### Good
```typescript
const user: User = { name: "Alice" };
```

### Bad
```
const user: User = { name: "Alice" };
```

## Import Ordering
```typescript
// 1. React/framework imports
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External library imports
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

// 3. Internal imports (with @/ alias)
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types';
```

## Response Structure
When generating new files, use this order:
1. File path comment
2. Imports (grouped as above)
3. Type definitions
4. Constants
5. Main export (component, function, class)
6. Helper functions
7. Default export (only if required by framework)

## Multi-File Output
When generating multiple files, separate with clear headers:
```markdown
### src/components/UserProfile.tsx
[code]

### src/components/UserProfile.test.tsx
[code]

### src/components/index.ts (updated)
[code showing only the added export line]
```

## Anti-Patterns
- Code without file path (user doesn't know where to put it)
- Missing language tag on code blocks
- Imports in random order
- Mixing multiple files without clear separation
- Including explanatory text inside code blocks
