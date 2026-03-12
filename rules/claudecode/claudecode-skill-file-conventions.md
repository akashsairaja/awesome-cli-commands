---
id: claudecode-skill-file-conventions
stackId: claudecode
type: rule
name: Skill File Conventions
description: >-
  Standardize Claude Code skill files in .claude/skills/ with consistent
  structure, naming, parameter documentation, and expected output sections for
  reliable team-wide usage.
difficulty: intermediate
globs:
  - '**/.claude/skills/**'
tags:
  - skills
  - conventions
  - file-structure
  - templates
  - standards
compatibility:
  - claude-code
faq:
  - question: How should Claude Code skill files be structured?
    answer: >-
      Every skill file needs five sections: Description (one sentence),
      Parameters (with types and defaults), Preconditions (checks before
      execution), Steps (numbered with details), and Expected Output (files
      created/modified). Use kebab-case filenames and store in .claude/skills/.
  - question: Why do skills need an Expected Output section?
    answer: >-
      The Expected Output section lets users verify the skill executed
      correctly. Without it, there's no way to confirm whether Claude completed
      all steps or missed something. It also serves as documentation for what
      the skill produces.
relatedItems:
  - claudecode-claude-md-standards
  - claudecode-mcp-config-rules
  - claudecode-skill-builder
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Skill File Conventions

## Rule
All Claude Code skill files in `.claude/skills/` MUST follow the standard template with required sections. Use kebab-case filenames.

## Format
```
.claude/skills/
  scaffold-component.md
  generate-api-route.md
  run-migration.md
  write-tests.md
```

## Required Sections
```markdown
# Skill Name

## Description
One sentence explaining what this skill does.

## Parameters
- `name` (required): Description with expected format
- `path` (optional, default: src/): Target directory

## Preconditions
- [ ] Required tool/dependency is installed
- [ ] Target directory exists

## Steps
1. Step one with explanation
2. Step two with code example
3. Final step with verification

## Expected Output
- List of files created or modified
- Expected state after skill execution
```

## Naming Rules
1. **Filenames**: kebab-case, descriptive verb-noun: `scaffold-component.md`
2. **Skill names**: Title case, action-oriented: "Scaffold React Component"
3. **Parameters**: camelCase with type and default noted

## Good Example
```markdown
# Scaffold React Component

## Description
Creates a new React component with TypeScript, tests, and barrel export.

## Parameters
- `name` (required): Component name in PascalCase (e.g., UserProfile)
- `path` (optional, default: src/components): Target directory

## Preconditions
- [ ] Target directory exists
- [ ] No existing component with the same name

## Steps
1. Create component directory at {path}/{name}/
2. Generate {name}.tsx with typed props interface
3. Generate {name}.test.tsx with React Testing Library
4. Update or create index.ts barrel export

## Expected Output
- `{path}/{name}/{name}.tsx` — component file
- `{path}/{name}/{name}.test.tsx` — test file
- `{path}/{name}/index.ts` — barrel export
```

## Bad Example
- A skill file with just "Make a component" and no parameters
- Missing Expected Output section (user can't verify success)
- Hardcoded paths that only work on one developer's machine
- No precondition checks (skill fails silently)

## Enforcement
Review skill files during code review. Skills without all required sections should be rejected.
