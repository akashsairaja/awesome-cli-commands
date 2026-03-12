---
id: clitools-find-locate
stackId: clitools
type: skill
name: Finding Files with find and fd
description: >-
  Locate files efficiently with find and fd — name patterns, type filters, size
  and date criteria, exec actions, and building file discovery workflows for
  large directory trees.
difficulty: beginner
tags:
  - find
  - fd
  - file-search
  - directory-traversal
  - glob
  - file-management
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - find (built-in)
  - 'fd (optional, install separately)'
faq:
  - question: What is fd and why is it faster than find?
    answer: >-
      fd is a modern alternative to find written in Rust. It's faster because:
      respects .gitignore (skips node_modules etc.), smart case matching by
      default, parallel directory traversal, simpler syntax. Use fd for
      interactive searches, find for scripts that need universal compatibility.
  - question: How do I find and delete old files safely?
    answer: >-
      First preview: find /tmp -type f -mtime +30 -print. Then delete: find /tmp
      -type f -mtime +30 -delete. Or use -ok for confirmation: find /tmp -type f
      -mtime +30 -ok rm {} \;. Always preview before deleting. Use -delete
      instead of -exec rm for efficiency.
  - question: How do I exclude directories from find?
    answer: >-
      Use -prune: find . -path ./node_modules -prune -o -name '*.ts' -print. The
      -prune stops descending into the directory. For multiple exclusions: find
      . \( -path ./node_modules -o -path ./dist \) -prune -o -name '*.ts'
      -print.
relatedItems:
  - clitools-text-processing
  - clitools-xargs-parallel
  - clitools-pipeline-architect
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Finding Files with find and fd

## Overview
find is the universal file locator on Unix systems. fd is its modern, faster alternative. Both search directory trees by name, type, size, date, permissions, and more — then execute actions on matches.

## Why This Matters
- **Code navigation** — find specific files in large projects
- **Cleanup** — locate and remove temp files, old logs, large files
- **Automation** — find files matching criteria and process them
- **Auditing** — check permissions, ownership, and file ages

## How It Works

### Step 1: find Basics
```bash
# By name (case-sensitive)
find . -name "*.ts"
find /var/log -name "*.log"

# Case-insensitive
find . -iname "readme*"

# By type
find . -type f                    # files only
find . -type d                    # directories only
find . -type l                    # symlinks only

# Exclude directories
find . -path ./node_modules -prune -o -name "*.ts" -print
find . -not -path "*/node_modules/*" -name "*.ts"
```

### Step 2: Advanced Filters
```bash
# By size
find . -size +100M                # larger than 100MB
find . -size -1k                  # smaller than 1KB
find /tmp -size +10M -size -1G    # between 10MB and 1GB

# By date
find . -mtime -7                  # modified in last 7 days
find . -mtime +30                 # modified more than 30 days ago
find . -newer reference.txt       # newer than reference file

# By permissions
find . -perm 777                  # exact permissions
find . -perm -u+x                # user executable
find /home -not -user root        # not owned by root

# Combine with AND/OR
find . -name "*.log" -size +10M
find . -name "*.jpg" -o -name "*.png"   # OR
find . \( -name "*.ts" -o -name "*.tsx" \) -newer src/index.ts
```

### Step 3: Execute Actions
```bash
# Execute command on each match
find . -name "*.tmp" -exec rm {} \;

# Execute with confirmation
find . -name "*.bak" -ok rm {} \;

# Batch execution (faster)
find . -name "*.log" -exec gzip {} +

# Print with custom format
find . -name "*.ts" -printf "%p %s bytes\n"

# Pipe to xargs for parallel execution
find . -name "*.jpg" -print0 | xargs -0 -P4 jpegoptim
```

### Step 4: fd — Modern Alternative
```bash
# Simple search (smart case, respects .gitignore)
fd "*.ts"
fd readme

# By type
fd -t f pattern          # files
fd -t d pattern          # directories

# By extension
fd -e ts -e tsx

# Exclude patterns
fd -E node_modules -E dist "*.ts"

# Execute
fd -e log -x gzip {}
fd -e tmp -X rm          # batch execution

# With size filter
fd -S +1m -e log
```

## Best Practices
- Use fd for interactive use (faster, simpler, respects .gitignore)
- Use find for scripts (available everywhere, more options)
- Always use -print0 with xargs -0 for safe filename handling
- Use -exec ... + (batch) over -exec ... \; (per-file) when possible
- Prune large directories early for performance

## Common Mistakes
- Not pruning node_modules/vendor (slow search)
- Using -exec \; when + works (spawns process per file)
- Missing -print0 with filenames containing spaces
- Forgetting to escape parentheses: \( ... \)
- Not using -maxdepth to limit search depth
