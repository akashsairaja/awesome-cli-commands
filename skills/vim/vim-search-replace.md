---
id: vim-search-replace
stackId: vim
type: skill
name: Advanced Search & Replace in Vim
description: >-
  Master Vim's search and substitution commands — regex patterns, global
  commands, multi-file search, and interactive replace workflows for large-scale
  codebase edits.
difficulty: intermediate
tags:
  - search-replace
  - regex
  - substitution
  - global-command
  - refactoring
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
prerequisites:
  - Vim or Neovim
  - Basic regex knowledge helpful
faq:
  - question: How do I search and replace across an entire file in Vim?
    answer: >-
      Use :%s/old/new/g to replace all occurrences in the file. Add the c flag
      (:%s/old/new/gc) for interactive confirmation on each match. The % means
      'entire file', s is substitute, and g means 'all matches per line'.
  - question: How do I do multi-file search and replace in Vim?
    answer: >-
      Use :args **/*.ts to load files, then :argdo %s/old/new/ge | update to
      replace in all. Alternatively, use :grep with ripgrep to populate the
      quickfix list, then :cfdo %s/old/new/ge | update for targeted multi-file
      replacement.
relatedItems:
  - vim-macro-recording
  - vim-text-objects
  - vim-motion-mentor
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Advanced Search & Replace in Vim

## Overview
Vim's search and substitution system is one of the most powerful text manipulation tools available. From simple find-and-replace to complex regex transformations across entire projects, mastering `:s` and `:g` commands unlocks unmatched editing speed.

## Why This Matters
- **Codebase-wide refactoring** without leaving the editor
- **Pattern matching** with regex for complex transformations
- **Selective replacement** with confirmation mode
- **Batch operations** with the global command

## Core Commands

### Basic Search
```vim
/pattern        " Search forward
?pattern        " Search backward
n               " Next match
N               " Previous match
*               " Search word under cursor (forward)
#               " Search word under cursor (backward)
```

### Substitution Basics
```vim
:s/old/new/           " Replace first on current line
:s/old/new/g          " Replace all on current line
:%s/old/new/g         " Replace all in entire file
:%s/old/new/gc        " Replace all with confirmation
:10,50s/old/new/g     " Replace in line range
:'<,'>s/old/new/g     " Replace in visual selection
```

### Regex Patterns
```vim
" Capture groups
:%s/\(\w\+\)_\(\w\+\)/\2_\1/g    " Swap word_word

" Very magic mode (less escaping)
:%s/\v(\w+)_(\w+)/\2_\1/g          " Same, cleaner syntax

" Case conversion
:%s/\vuserName/user_name/g           " Literal replace
:%s/\v(\w)/\u\1/g                   " Capitalize first letter
:%s/\v<(\w)/\u\1/g                  " Capitalize word starts

" Lookahead/lookbehind
:%s/\v(TODO)@<=:/: FIXME:/g          " Replace : after TODO
```

### The Global Command (:g)
```vim
:g/pattern/command         " Run command on matching lines
:g/TODO/d                  " Delete all lines containing TODO
:g/^$/d                    " Delete all blank lines
:g/console\.log/d          " Remove all console.log lines
:g/^import/m 0             " Move all imports to top of file
:g!/pattern/d              " Delete lines NOT matching pattern
:g/error/t$                " Copy all error lines to end of file
```

### Multi-File Search & Replace
```vim
" Using argument list
:args **/*.ts
:argdo %s/oldFunc/newFunc/ge | update

" Using quickfix list (with ripgrep)
:grep! oldFunc **/*.ts
:cfdo %s/oldFunc/newFunc/ge | update

" Using Telescope + quickfix
" <leader>fg → search → <C-q> to send to quickfix → :cfdo
```

## Best Practices
- **Use \v (very magic)** for cleaner regex — fewer backslashes
- **Add c flag** for confirmation on destructive replacements
- **Use e flag** to suppress "pattern not found" errors in batch operations
- **Preview with :s without flags** to see what matches on current line
- **Combine :g with :s** for targeted substitutions
- **Use :cfdo for project-wide** changes with ripgrep integration

## Common Mistakes
- Forgetting the `g` flag (only replaces first match per line)
- Not escaping special regex characters in non-very-magic mode
- Running :%s on the wrong buffer without checking first
- Not using `c` flag for safety on unfamiliar patterns
- Using :%s when :g would be cleaner for line-level operations
