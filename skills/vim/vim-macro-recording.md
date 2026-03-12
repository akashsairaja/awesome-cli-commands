---
id: vim-macro-recording
stackId: vim
type: skill
name: Vim Macro Recording & Replay
description: >-
  Master Vim macro recording for batch text transformations — record, replay,
  edit, and chain macros to automate repetitive editing tasks across files.
difficulty: intermediate
tags:
  - vim-macros
  - recording
  - batch-editing
  - text-transformation
  - registers
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Vim or Neovim
  - Understanding of basic Vim motions and operators
faq:
  - question: How do I record and replay a macro in Vim?
    answer: >-
      Press qq to start recording into register q, perform your edits, then
      press q again to stop. Replay with @q (once), 5@q (5 times), or :%normal
      @q (entire file). Macros capture every keystroke including motions,
      operators, and mode switches.
  - question: How do I edit a Vim macro after recording it?
    answer: >-
      Paste the macro contents with "qp (paste register q), edit the text as
      needed, then yank it back with 0"qy$. You can also set it directly with
      :let @q = 'keystrokes'. This is useful for fixing small mistakes without
      re-recording.
  - question: Can Vim macros work across multiple files?
    answer: >-
      Yes. Use :argdo normal @q to apply a macro across all argument files,
      :bufdo normal @q for all open buffers, or :cdo normal @q for all quickfix
      list entries. Combine with :wa to save all files afterward.
relatedItems:
  - vim-motion-mentor
  - vim-registers-guide
  - vim-text-objects
version: 1.0.0
lastUpdated: '2026-03-11'
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
