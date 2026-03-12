---
id: vim-keymapping-standards
stackId: vim
type: rule
name: Vim Keymapping Conventions
description: >-
  Standards for Vim/Neovim key mappings — leader key usage, naming conventions,
  no overriding core motions, and organized keymap files with descriptions.
difficulty: beginner
globs:
  - '**/.config/nvim/**/*.lua'
  - '**/keymaps.lua'
  - '**/.vimrc'
tags:
  - keymappings
  - leader-key
  - conventions
  - which-key
  - vim-bindings
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - zed
faq:
  - question: What key should I use as the Vim leader key?
    answer: >-
      Space is the most popular leader key in modern Neovim setups. It's easy to
      reach with either hand, doesn't conflict with built-in motions, and
      provides a large namespace for custom mappings. Set it with
      vim.g.mapleader = ' ' before any plugin setup.
  - question: Why should I never remap core Vim motions?
    answer: >-
      Core motions (hjkl, w, b, e, f, t, etc.) are fundamental to Vim's editing
      language. Remapping them breaks muscle memory, makes help documentation
      misleading, and causes issues with plugins that assume standard bindings.
      Use the leader key for custom mappings instead.
relatedItems:
  - vim-vimrc-structure
  - vim-motion-mentor
  - vim-config-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Vim Keymapping Conventions

## Rule
All custom keymappings MUST use the leader key prefix, include descriptions, and NEVER override built-in Vim motions.

## Format
```lua
-- Neovim Lua format (required)
vim.keymap.set("n", "<leader>ff", "<cmd>Telescope find_files<cr>", { desc = "Find files" })
vim.keymap.set("n", "<leader>fg", "<cmd>Telescope live_grep<cr>", { desc = "Live grep" })
```

## Requirements

### Leader Key
- Set to Space: `vim.g.mapleader = " "`
- All custom mappings use `<leader>` prefix
- Group by function: `<leader>f` = find, `<leader>g` = git, `<leader>l` = LSP

### Descriptions Required
```lua
-- Good: includes desc for which-key and help
vim.keymap.set("n", "<leader>e", "<cmd>NvimTreeToggle<cr>", { desc = "Toggle file explorer" })

-- Bad: no description
vim.keymap.set("n", "<leader>e", "<cmd>NvimTreeToggle<cr>")
```

### Never Override Core Motions
```lua
-- NEVER do these:
vim.keymap.set("n", "j", "gj")   -- Overrides core motion
vim.keymap.set("n", "s", ...)     -- Overrides substitute
vim.keymap.set("n", "H", ...)     -- Overrides high jump
vim.keymap.set("n", "L", ...)     -- Overrides low jump

-- Acceptable exceptions:
vim.keymap.set("n", "j", "v:count == 0 ? 'gj' : 'j'", { expr = true })  -- Smart j
```

### Keymap Organization
```lua
-- Group by namespace
-- <leader>f = Find/Files
-- <leader>g = Git
-- <leader>l = LSP
-- <leader>b = Buffers
-- <leader>w = Windows
-- <leader>t = Terminal/Toggle
```

## Good Examples
```lua
vim.keymap.set("n", "<leader>ff", "<cmd>Telescope find_files<cr>", { desc = "Find files" })
vim.keymap.set("n", "<leader>gs", "<cmd>Telescope git_status<cr>", { desc = "Git status" })
vim.keymap.set("n", "<leader>ld", vim.lsp.buf.definition, { desc = "Go to definition" })
vim.keymap.set("n", "<leader>lr", vim.lsp.buf.references, { desc = "Find references" })
```

## Bad Examples
```lua
vim.keymap.set("n", "ff", ...)         -- No leader prefix
vim.keymap.set("n", "<leader>a", ...)  -- Non-descriptive key
vim.keymap.set("n", "w", ...)          -- Overrides word motion!
```
