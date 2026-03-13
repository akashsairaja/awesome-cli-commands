---
id: vim-macro-recording
stackId: vim
type: skill
name: >-
  Vim Macro Recording & Replay
description: >-
  Master Vim macro recording for batch text transformations — record, replay,
  edit, and chain macros to automate repetitive editing tasks across files.
difficulty: intermediate
tags:
  - vim
  - macro
  - recording
  - replay
  - testing
  - debugging
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Vim Macro Recording & Replay skill?"
    answer: >-
      Master Vim macro recording for batch text transformations — record,
      replay, edit, and chain macros to automate repetitive editing tasks
      across files. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Vim Macro Recording & Replay require?"
    answer: >-
      Works with standard vim tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working vim environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Vim Macro Recording & Replay

## Overview
Vim macros record a sequence of keystrokes and replay them with a single command. They're the fastest way to apply repetitive edits across lines, paragraphs, or entire files — far faster than find-and-replace for complex transformations.

## Why This Matters
- **Eliminate repetitive editing** — record once, replay thousands of times
- **Handle complex transformations** — macros capture any Vim operation
- **No regex needed** — use normal editing commands in the macro
- **Composable** — chain macros with counts and ranges

## How It Works

### Step 1: Record a Macro
```vim
qq          " Start recording into register q
0           " Go to beginning of line
f"          " Find first quote
ci"         " Change inner quotes
new text    " Type replacement
<Esc>       " Return to normal mode
j           " Move to next line
q           " Stop recording
```

### Step 2: Replay the Macro
```vim
@q          " Play macro from register q once
5@q         " Play macro 5 times
@@          " Repeat last played macro
100@q       " Play 100 times (stops on error)
```

### Step 3: Apply Across Ranges
```vim
" Apply macro q to lines 10-50
:10,50 normal @q

" Apply to all lines matching a pattern
:g/TODO/normal @q

" Apply to entire file
:%normal @q
```

### Step 4: Edit a Recorded Macro
```vim
" Paste the macro into a buffer
"qp         " Paste contents of register q

" Edit the keystrokes as text
" (modify the pasted text)

" Yank back into the register
0"qy$       " Yank line back into register q
```

## Practical Examples

### Convert CSS to Tailwind Classes
```vim
" Before: margin-top: 8px;
" After:  mt-2
qq0df:ldt;I<Esc>A<Esc>jq
```

### Add Console.log for Debugging
```vim
" Record: wrap current word in console.log()
qqyiwoconsole.log('<Esc>pa:', <Esc>pa);<Esc>jq
```

### Transform JSON Keys
```vim
" Before: "userName": "value"
" After:  "user_name": "value"
qq0f"l/[A-Z]<CR>i_<Esc>l~jq
```

## Best Practices
- **Start macros at a consistent position** — use `0` or `^` at the start
- **End with motion to next target** — `j` for line-by-line, `n` for search-based
- **Use text objects** in macros for resilience (`ciw` vs fixed-length changes)
- **Test on one line first** before running on a range
- **Macros stop on error** — use this as a natural termination condition

## Common Mistakes
- Forgetting to end recording with `q`
- Not positioning cursor consistently at macro start
- Using absolute positions instead of motions (column 15 vs `f"`)
- Recording mouse clicks (macros are keyboard-only)
- Not testing the macro before applying to a large range
