---
id: vim-vimrc-structure
stackId: vim
type: rule
name: Vimrc / init.lua Structure Standards
description: >-
  Enforce modular, well-organized Neovim configuration files with logical
  section grouping, lazy-loading, and consistent coding patterns in Lua.
difficulty: intermediate
globs:
  - '**/.config/nvim/**/*.lua'
  - '**/init.lua'
  - '**/init.vim'
  - '**/.vimrc'
tags:
  - vimrc
  - init-lua
  - configuration
  - modular
  - neovim-structure
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
  - question: How should I structure my Neovim configuration?
    answer: >-
      Use a modular Lua structure: init.lua for bootstrapping only (< 30 lines),
      lua/config/ for options, keymaps, and autocmds in separate files, and
      lua/plugins/ with one file per plugin spec. This keeps each file focused
      and maintainable.
  - question: Should I commit lazy-lock.json to Git?
    answer: >-
      Yes. The lazy-lock.json file pins exact plugin versions, ensuring your
      configuration is reproducible across machines. Without it, plugin updates
      could break your setup. Commit it alongside your config files.
relatedItems:
  - vim-keymapping-standards
  - vim-lazy-nvim-setup
  - vim-config-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Vimrc / init.lua Structure Standards

## Rule
All Neovim configurations MUST follow a modular Lua structure with logical separation of concerns. No monolithic init.lua files exceeding 200 lines.

## Format
```
~/.config/nvim/
├── init.lua              # Bootstrap only (< 30 lines)
├── lua/
│   ├── config/
│   │   ├── options.lua   # vim.opt settings
│   │   ├── keymaps.lua   # Key mappings
│   │   └── autocmds.lua  # Autocommands
│   └── plugins/
│       ├── telescope.lua # One file per plugin
│       ├── lsp.lua
│       ├── completion.lua
│       └── treesitter.lua
└── lazy-lock.json        # Committed to Git
```

## Requirements

### init.lua (Bootstrap Only)
```lua
-- Good: minimal bootstrap
vim.g.mapleader = " "
require("config.options")
require("config.keymaps")
require("config.autocmds")
-- Bootstrap lazy.nvim and load plugins/
```

### Plugin Specs (One Per File)
```lua
-- Good: lua/plugins/telescope.lua
return {
  "nvim-telescope/telescope.nvim",
  cmd = "Telescope",
  keys = { { "<leader>ff", "<cmd>Telescope find_files<cr>" } },
  opts = { ... },
}
```

### Bad
```lua
-- Bad: 500-line init.lua with everything mixed together
vim.opt.number = true
-- ... 200 lines of options ...
require("telescope").setup({ ... })
-- ... 200 lines of plugin configs ...
vim.keymap.set("n", "<leader>ff", ...)
-- ... 100 lines of keymaps ...
```

## Enforcement
- init.lua must be under 30 lines
- Each plugin file must contain exactly one `return` statement
- Options, keymaps, and autocmds live in separate files under config/
- lazy-lock.json must be committed to version control
