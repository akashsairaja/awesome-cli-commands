---
id: lefthook-staged-files-only
stackId: lefthook
type: rule
name: Check Only Staged Files
description: >-
  Require Lefthook pre-commit commands to operate on staged files only — use
  {staged_files} placeholder and glob filters to avoid checking the entire
  codebase on every commit.
difficulty: beginner
globs:
  - '**/lefthook.yml'
  - '**/lefthook-local.yml'
tags:
  - staged-files
  - performance
  - file-filtering
  - pre-commit
  - lefthook
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why should Lefthook check only staged files?
    answer: >-
      Checking only staged files (not the entire codebase) keeps hooks fast. If
      you have 10,000 files but staged 3, only those 3 are checked. This is the
      difference between a 0.5-second hook and a 30-second hook. Fast hooks mean
      developers keep them enabled.
  - question: 'What is the difference between {staged_files} and {push_files}?'
    answer: >-
      {staged_files} contains files in the Git staging area — used in pre-commit
      hooks. {push_files} contains files that differ between your local branch
      and the remote — used in pre-push hooks. Each targets the right files for
      its hook stage.
relatedItems:
  - lefthook-parallel-execution
  - lefthook-hook-placement
  - lefthook-config-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Check Only Staged Files

## Rule
Pre-commit commands MUST use `{staged_files}` to check only staged files. Running tools on the entire codebase in pre-commit hooks is prohibited.

## Format
```yaml
# Good — staged files only
pre-commit:
  commands:
    lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}
```

```yaml
# Bad — checks entire codebase
pre-commit:
  commands:
    lint:
      run: npx eslint src/
```

## File Placeholders
| Placeholder | Hook Stage | Description |
|-------------|-----------|-------------|
| `{staged_files}` | pre-commit | Files in the staging area |
| `{push_files}` | pre-push | Files changed since remote HEAD |
| `{all_files}` | any | All tracked files (avoid in hooks) |
| `{1}` | commit-msg | The commit message file path |

## Combined with Glob Filtering
```yaml
pre-commit:
  commands:
    # Only staged TypeScript files
    ts-lint:
      glob: "*.{ts,tsx}"
      run: npx eslint {staged_files}

    # Only staged Python files
    py-lint:
      glob: "*.py"
      run: ruff check {staged_files}

    # Only staged Terraform files
    tf-scan:
      glob: "*.tf"
      run: checkov -f {staged_files}
```

## Exceptions
- Secret scanning (`gitleaks protect --staged`) inherently operates on staged content
- Commit message validation uses `{1}` (the message file)
- Type checking (`tsc --noEmit`) needs the full project — move to pre-push

## Anti-Patterns
- Using `{all_files}` in pre-commit (checks everything, very slow)
- Hardcoding directory paths instead of `{staged_files}`
- Running `tsc --noEmit` in pre-commit (needs full codebase, too slow)
- Not using glob with `{staged_files}` (passes wrong file types to tools)
