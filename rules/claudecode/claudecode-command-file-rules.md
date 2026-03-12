---
id: claudecode-command-file-rules
stackId: claudecode
type: rule
name: Custom Command File Rules
description: >-
  Standards for creating custom slash commands in .claude/commands/ — naming
  conventions, prompt structure, parameter handling, and documentation
  requirements for team consistency.
difficulty: beginner
globs:
  - '**/.claude/commands/**'
tags:
  - commands
  - slash-commands
  - naming
  - conventions
  - prompts
compatibility:
  - claude-code
faq:
  - question: How should I name custom Claude Code commands?
    answer: >-
      Use kebab-case with a verb-noun pattern: review-pr.md,
      scaffold-component.md, fix-types.md. The filename becomes the slash
      command name, so it should be descriptive enough that team members
      understand what it does without reading the file.
  - question: Why must commands include output format instructions?
    answer: >-
      Without format instructions, Claude produces different output structures
      each time, making results hard to parse and act on. Specifying format
      (bullet lists, severity levels, file:line references) ensures consistent,
      actionable output across every invocation.
relatedItems:
  - claudecode-claude-md-standards
  - claudecode-skill-file-conventions
  - claudecode-slash-commands
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Custom Command File Rules

## Rule
All custom slash commands MUST be markdown files in `.claude/commands/` with clear prompt text, output format instructions, and parameter documentation.

## File Naming
```
.claude/commands/
  review-pr.md           # verb-noun, kebab-case
  scaffold-component.md  # descriptive action
  deploy-check.md        # clear purpose
```

### Good Names
```
review-pr.md
scaffold-component.md
fix-types.md
write-tests.md
explain-code.md
```

### Bad Names
```
r.md              # Too short, unclear
mycommand.md      # Not descriptive
doStuff.md        # camelCase, vague
helper.md         # What does it help with?
```

## Prompt Structure

### Good — Specific and Structured
```markdown
Review the current git diff against main. For each file changed, check:

1. **Type Safety**: No \`any\` types, proper null handling, exhaustive switches
2. **Error Handling**: All async operations wrapped in try/catch
3. **Performance**: No N+1 queries, no unnecessary re-renders
4. **Security**: No hardcoded secrets, proper input validation

Format output as:
- CRITICAL: [description] (file:line)
- WARNING: [description] (file:line)
- SUGGESTION: [description] (file:line)

End with a summary: X critical, Y warnings, Z suggestions.
```

### Bad — Vague and Unstructured
```markdown
Review the code and tell me if it's good.
```

## Parameter Usage
- Use `$ARGUMENTS` for user input: "Create a component named $ARGUMENTS"
- Document expected parameter format in a comment at the top
- Provide default behavior when no arguments given

## Output Format
Every command MUST specify the expected output format:
- Use structured formats (bullet lists, tables, sections)
- Include severity levels for review commands
- Specify file paths and line numbers where applicable

## Anti-Patterns
- Commands without output format instructions (inconsistent results)
- Overly long prompts (> 50 lines) — split into multiple commands
- Commands that duplicate built-in functionality (/review, /help)
- Missing parameter documentation
