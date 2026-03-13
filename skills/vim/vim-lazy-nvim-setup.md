---
id: vim-lazy-nvim-setup
stackId: vim
type: skill
name: Neovim Plugin Management with lazy.nvim
description: >-
  Set up lazy.nvim for Neovim plugin management — bootstrap installation,
  plugin specs, lazy-loading strategies, and modular configuration structure.
difficulty: intermediate
tags:
  - vim
  - neovim
  - plugin
  - management
  - lazynvim
  - performance
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Neovim Plugin Management with lazy.nvim skill?"
    answer: >-
      Set up lazy.nvim for Neovim plugin management — bootstrap installation,
      plugin specs, lazy-loading strategies, and modular configuration
      structure. This skill provides a structured workflow for development
      tasks.
  - question: "What tools and setup does Neovim Plugin Management with lazy.nvim require?"
    answer: >-
      Works with standard vim tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Neovim Plugin Management with lazy.nvim

## Overview
lazy.nvim is the modern standard for Neovim plugin management. It supports automatic lazy-loading, lockfiles, a visual UI, profiling, and modular plugin specs. This skill covers bootstrapping, configuration structure, and lazy-loading strategies.

## Why This Matters
- **Startup performance** — lazy-load plugins to keep startup under 50ms
- **Reproducible builds** — lockfile ensures identical plugin versions across machines
- **Modular config** — each plugin gets its own spec file for maintainability
- **Automatic management** — install, update, clean unused plugins from one UI

## How It Works

### Step 1: Bootstrap lazy.nvim
```lua
-- ~/.config/nvim/init.lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git", "clone", "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

-- Set leader key before lazy (important!)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

require("lazy").setup("plugins")
```

### Step 2: Create Modular Plugin Specs
```lua
-- ~/.config/nvim/lua/plugins/telescope.lua
return {
  "nvim-telescope/telescope.nvim",
  branch = "0.1.x",
  dependencies = { "nvim-lua/plenary.nvim" },
  cmd = "Telescope",  -- Lazy-load on command
  keys = {
    { "<leader>ff", "<cmd>Telescope find_files<cr>", desc = "Find files" },
    { "<leader>fg", "<cmd>Telescope live_grep<cr>", desc = "Live grep" },
    { "<leader>fb", "<cmd>Telescope buffers<cr>", desc = "Buffers" },
  },
  opts = {
    defaults = {
      file_ignore_patterns = { "node_modules", ".git/" },
    },
  },
}
```

### Step 3: Configure LSP with Mason
```lua
-- ~/.config/nvim/lua/plugins/lsp.lua
return {
  {
    "neovim/nvim-lspconfig",
    event = { "BufReadPre", "BufNewFile" },
    dependencies = {
      "williamboman/mason.nvim",
      "williamboman/mason-lspconfig.nvim",
    },
    config = function()
      require("mason").setup()
      require("mason-lspconfig").setup({
        ensure_installed = { "lua_ls", "ts_ls", "pyright" },
      })
      local lspconfig = require("lspconfig")
      lspconfig.lua_ls.setup({})
      lspconfig.ts_ls.setup({})
      lspconfig.pyright.setup({})
    end,
  },
}
```

### Step 4: Set Up Completion
```lua
-- ~/.config/nvim/lua/plugins/completion.lua
return {
  "hrsh7th/nvim-cmp",
  event = "InsertEnter",  -- Only load when entering insert mode
  dependencies = {
    "hrsh7th/cmp-nvim-lsp",
    "hrsh7th/cmp-buffer",
    "hrsh7th/cmp-path",
    "L3MON4D3/LuaSnip",
    "saadparwaiz1/cmp_luasnip",
  },
  config = function()
    local cmp = require("cmp")
    local luasnip = require("luasnip")
    cmp.setup({
      snippet = {
        expand = function(args)
          luasnip.lsp_expand(args.body)
        end,
      },
      mapping = cmp.mapping.preset.insert({
        ["<C-Space>"] = cmp.mapping.complete(),
        ["<CR>"] = cmp.mapping.confirm({ select = true }),
        ["<C-n>"] = cmp.mapping.select_next_item(),
        ["<C-p>"] = cmp.mapping.select_prev_item(),
      }),
      sources = cmp.config.sources({
        { name = "nvim_lsp" },
        { name = "luasnip" },
        { name = "buffer" },
        { name = "path" },
      }),
    })
  end,
}
```

## Best Practices
- **One plugin per file** in `lua/plugins/` — lazy.nvim auto-loads them all
- **Use lazy-load triggers**: `event`, `cmd`, `keys`, `ft` to defer loading
- **Pin plugin versions** with the lockfile (`lazy-lock.json`) — commit it to Git
- **Profile regularly**: `:Lazy profile` to find slow plugins
- **Use `opts` over `config`** when the plugin supports `setup(opts)` — less boilerplate

## Common Mistakes
- Loading all plugins eagerly (defeats the purpose of lazy.nvim)
- Not setting `mapleader` before `lazy.setup()` (key mappings break)
- Putting all plugin specs in one giant file instead of modular files
- Forgetting to commit `lazy-lock.json` (reproducibility lost)
- Using deprecated `packer.use()` syntax in lazy.nvim specs
