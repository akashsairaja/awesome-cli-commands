---
id: vim-plugin-selection
stackId: vim
type: rule
name: Neovim Plugin Selection Criteria
description: >-
  Guidelines for evaluating and selecting Neovim plugins — activity criteria,
  performance standards, dependency limits, and when to prefer built-in features
  over plugins.
difficulty: intermediate
globs:
  - '**/.config/nvim/lua/plugins/**'
  - '**/lazy-lock.json'
tags:
  - plugins
  - neovim-ecosystem
  - evaluation
  - performance
  - lazy-loading
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How many Neovim plugins should I install?
    answer: >-
      Aim for under 30 active plugins. Each should serve a clear purpose and add
      less than 5ms to startup time. Quality over quantity — a well-configured
      set of 15-20 plugins outperforms 50+ poorly configured ones. Profile with
      :Lazy profile to identify slow plugins.
  - question: Should I use Vimscript or Lua plugins for Neovim?
    answer: >-
      Always prefer Lua-native plugins for Neovim. They're faster (no
      Vimscript-to-Lua bridge), integrate better with Neovim's Lua API, and are
      actively maintained. Most popular Vimscript plugins (vim-fugitive,
      vim-surround) now have Lua alternatives.
relatedItems:
  - vim-lazy-nvim-setup
  - vim-vimrc-structure
  - vim-config-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Neovim Plugin Selection Criteria

## Rule
Every plugin added to the configuration MUST meet activity, performance, and necessity criteria. Prefer built-in Neovim features over plugins when available.

## Evaluation Checklist

### Must-Have Criteria
| Criteria | Minimum |
|----------|---------|
| Last commit | Within 6 months |
| GitHub stars | 500+ (or well-known author) |
| Neovim support | Native Lua (not Vimscript wrapper) |
| Lazy-loadable | Supports event/cmd/ft/keys triggers |
| No conflicts | Doesn't override core Vim behavior |

### Prefer Built-in Over Plugin
```lua
-- Bad: plugin for what Neovim does natively
{ "tpope/vim-commentary" }  -- Neovim has gc/gcc built-in (0.10+)
{ "jiangmiao/auto-pairs" }  -- Use mini.pairs or built-in

-- Good: plugins that extend beyond built-in
{ "nvim-telescope/telescope.nvim" }  -- Far beyond :find
{ "nvim-treesitter/nvim-treesitter" }  -- Syntax beyond regex
```

### Performance Budget
```lua
-- Each plugin should add < 5ms to startup
-- Total plugin count: aim for < 30 active plugins
-- Profile with :Lazy profile

-- Good: lazy-loaded, minimal impact
return {
  "windwp/nvim-autopairs",
  event = "InsertEnter",  -- Only loads when editing
}

-- Bad: eagerly loaded, unnecessary at startup
return {
  "some-plugin",
  lazy = false,  -- Loads immediately
}
```

### Dependency Limits
- Maximum 2 levels of dependency depth
- Avoid plugins that pull in > 3 dependencies
- Shared dependencies (plenary.nvim) are acceptable

## Good Plugin Stack Example
```lua
-- Core (always loaded)
"folke/lazy.nvim"              -- Plugin manager
"nvim-treesitter/nvim-treesitter"  -- Syntax

-- On-demand (lazy-loaded)
"nvim-telescope/telescope.nvim"    -- cmd/keys trigger
"neovim/nvim-lspconfig"            -- event trigger
"hrsh7th/nvim-cmp"                 -- InsertEnter trigger
"lewis6991/gitsigns.nvim"          -- BufReadPre trigger
```

## Anti-Patterns
- Installing "awesome Neovim" lists wholesale without evaluation
- Using Vimscript plugins when Lua alternatives exist
- Keeping unused plugins (run :Lazy clean regularly)
- Not reading plugin source code before installing
- Installing a plugin for a one-line Lua solution
