---
id: vim-text-objects
stackId: vim
type: skill
name: Vim Text Objects Mastery
description: >-
  Master Vim text objects for precise, semantic text selection and manipulation
  — inner/around words, quotes, brackets, paragraphs, tags, and custom
  Treesitter objects.
difficulty: beginner
tags:
  - text-objects
  - vim-editing
  - operators
  - treesitter
  - selection
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Vim or Neovim
  - Understanding of Vim modes
faq:
  - question: What are Vim text objects?
    answer: >-
      Text objects are Vim's way of selecting semantic units of text. They come
      in 'inner' (i) and 'around' (a) variants: iw selects the word, aw selects
      the word plus surrounding space, ci" changes text inside quotes, da{
      deletes a brace block including braces. They work with any operator (d, c,
      y, v).
  - question: What is the difference between inner and around text objects?
    answer: >-
      Inner (i) selects just the content between delimiters — ci" changes text
      between quotes but keeps the quotes. Around (a) includes the delimiters —
      da" deletes the entire quoted string including quotes. Use inner for
      changing content, around for deleting entire structures.
  - question: How do Treesitter text objects improve Vim editing?
    answer: >-
      Treesitter text objects add language-aware selections like 'inner
      function' (if), 'a class' (ac), and 'inner parameter' (ia). Instead of
      bracket-based selection, they understand code structure — daf deletes an
      entire function regardless of its syntax.
relatedItems:
  - vim-motion-mentor
  - vim-macro-recording
  - vim-config-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Vim Text Objects Mastery

## Overview
Text objects are Vim's most powerful editing concept. They let you operate on semantic units of text — words, sentences, quoted strings, code blocks — without manually positioning your cursor. Combined with operators (d, c, y, v), they form the "verb + noun" editing language.

## Why This Matters
- **Precision** — select exactly the text you want, regardless of cursor position
- **Speed** — `ci"` is faster than navigating to quotes manually
- **Repeatability** — text object operations work perfectly with `.` (dot repeat)
- **Composability** — any operator works with any text object

## Built-in Text Objects

### Word Objects
```vim
ciw     " Change inner word (replace the word under cursor)
daw     " Delete a word (includes surrounding space)
yiW     " Yank inner WORD (space-delimited, includes special chars)
```

### Quote & Bracket Objects
```vim
ci"     " Change inner double quotes → changes text between ""
da'     " Delete a single-quoted string including quotes
ci(     " Change inner parentheses → changes text between ()
da{     " Delete a brace block including the braces
ci[     " Change inner brackets
dit     " Delete inner HTML/XML tag content
dat     " Delete entire HTML/XML tag including tags
ci`     " Change inner backtick string
```

### Block & Paragraph Objects
```vim
cip     " Change inner paragraph
dap     " Delete a paragraph (includes trailing blank line)
cis     " Change inner sentence
```

## The Inner vs Around Pattern
| Prefix | Meaning | Includes Delimiters? |
|--------|---------|---------------------|
| `i` | inner | No — just the content |
| `a` | around (a/an) | Yes — includes delimiters/whitespace |

```vim
" Given: "hello world"
ci"     " Changes: hello world (keeps quotes)
da"     " Deletes: "hello world" (removes quotes too)
```

## Practical Workflow Examples

### Changing Function Arguments
```vim
" Cursor anywhere inside parentheses
ci(newArg1, newArg2<Esc>
```

### Replacing a Quoted String
```vim
" Cursor anywhere inside the quotes
ci"new value<Esc>
```

### Deleting an HTML Tag
```vim
" Cursor anywhere inside the tag
dat     " Removes entire <div>...</div>
dit     " Removes only the tag content
```

### Yanking a Code Block
```vim
" Cursor anywhere inside braces
yi{     " Yank the block content
ya{     " Yank including the braces
```

## Treesitter Text Objects (Neovim)
```lua
-- With nvim-treesitter-textobjects plugin
require("nvim-treesitter.configs").setup({
  textobjects = {
    select = {
      enable = true,
      keymaps = {
        ["af"] = "@function.outer",
        ["if"] = "@function.inner",
        ["ac"] = "@class.outer",
        ["ic"] = "@class.inner",
        ["aa"] = "@parameter.outer",
        ["ia"] = "@parameter.inner",
      },
    },
  },
})
-- Now: daf = delete a function, cic = change inner class
```

## Best Practices
- **Prefer text objects over visual selection** — `ciw` over `bvec`
- **Use `i` (inner) for changing** — keeps delimiters intact
- **Use `a` (around) for deleting** — removes delimiters too
- **Learn in pairs**: always learn both `i` and `a` variants
- **Install Treesitter text objects** for language-aware selections

## Common Mistakes
- Using visual mode + manual selection instead of text objects
- Forgetting that cursor can be anywhere inside the text object
- Confusing `i` (inner) with `a` (around) when deleting vs changing
- Not installing Treesitter text objects for code-aware editing
