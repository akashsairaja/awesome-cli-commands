---
id: ripgrep-replace-refactor
stackId: ripgrep
type: skill
name: >-
  Search & Replace with Ripgrep
description: >-
  Use ripgrep for codebase-wide search and replace — previewing changes,
  piping to sed for replacement, using capture groups, and safely refactoring
  across large projects.
difficulty: intermediate
tags:
  - ripgrep
  - search
  - replace
  - migration
  - api
  - best-practices
  - refactoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Search & Replace with Ripgrep skill?"
    answer: >-
      Use ripgrep for codebase-wide search and replace — previewing changes,
      piping to sed for replacement, using capture groups, and safely
      refactoring across large projects. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Search & Replace with Ripgrep require?"
    answer: >-
      Works with standard ripgrep tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Search & Replace with Ripgrep

## Overview
Ripgrep excels at finding patterns, and paired with sed or other tools, enables safe codebase-wide refactoring. Preview changes before applying, use capture groups for smart replacements, and verify results.

## Why This Matters
- **Refactoring** — rename functions, variables, and APIs across files
- **Migration** — update import paths, API endpoints, and config keys
- **Cleanup** — remove debug statements, fix typos, update patterns
- **Safety** — preview all changes before committing

## How It Works

### Step 1: Preview Matches
```bash
# Find all matches first
rg "oldFunction" --type ts

# See context around matches
rg -C 2 "oldFunction" --type ts

# Count affected files
rg -l "oldFunction" --type ts | wc -l

# Preview replacement with --passthru
rg "oldFunction" -r "newFunction" --passthru --type ts
```

### Step 2: Simple Replacement with sed
```bash
# Replace in all matching files
rg -l "oldFunction" --type ts | xargs sed -i 's/oldFunction/newFunction/g'

# macOS (BSD sed requires backup extension)
rg -l "oldFunction" --type ts | xargs sed -i '' 's/oldFunction/newFunction/g'

# Safe replacement (create backups)
rg -l "oldFunction" --type ts | xargs sed -i.bak 's/oldFunction/newFunction/g'

# Multiple replacements
rg -l "oldAPI" --type ts | xargs sed -i \
  -e 's/oldAPI/newAPI/g' \
  -e 's/v1\/endpoint/v2\/endpoint/g'
```

### Step 3: Regex Replacement with Capture Groups
```bash
# Preview regex replacement (ripgrep -r flag)
rg "console\.(log|warn)\((.*)\)" -r "logger.$1($2)" --type ts

# Apply with sed (capture groups)
rg -l "console\.log" --type ts | xargs sed -i 's/console\.log(\(.*\))/logger.info\1/g'

# Rename CSS class prefix
rg -l "btn-primary" --type css | xargs sed -i 's/btn-primary/button-primary/g'

# Update import paths
rg -l "from '@/old-path/" --type ts | xargs sed -i "s|from '@/old-path/|from '@/new-path/|g"
```

### Step 4: Safe Refactoring Workflow
```bash
# 1. Create a branch
git checkout -b refactor/rename-api

# 2. Preview changes
rg "OldAPIClient" --type ts -C 1

# 3. Apply replacement
rg -l "OldAPIClient" --type ts | xargs sed -i 's/OldAPIClient/NewAPIClient/g'

# 4. Verify no missed references
rg "OldAPIClient" --type ts    # should return nothing

# 5. Check for broken references
rg "NewAPIClient" --type ts    # verify replacements look correct

# 6. Run tests
npm test

# 7. Review diff
git diff

# 8. Commit
git add -A && git commit -m "refactor: rename OldAPIClient to NewAPIClient"
```

## Best Practices
- Always preview with rg before applying sed
- Use -l to get file list (pipe to xargs sed for replacement)
- Create a git branch before bulk replacements
- Verify with rg after replacement (no remaining old references)
- Run tests after refactoring
- Use -w for whole-word replacement (avoid partial matches)

## Common Mistakes
- Replacing without previewing (unintended changes)
- Not using -w (replacing partial words: "user" -> "new_user" in "username")
- Forgetting to escape regex in sed (dots, slashes)
- Not verifying after replacement (broken references missed)
- Not running tests (replacement broke functionality)
- Using BSD sed syntax on Linux or vice versa
