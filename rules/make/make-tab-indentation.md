---
id: make-tab-indentation
stackId: make
type: rule
name: Makefile Tab Indentation Rule
description: >-
  Enforce tab-only indentation for Makefile recipe lines — the single most
  common Makefile syntax error and how to configure editors to prevent it.
difficulty: beginner
globs:
  - '**/Makefile'
  - '**/makefile'
  - '**/*.mk'
tags:
  - tabs
  - indentation
  - syntax
  - editor-config
  - common-errors
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: Why does my Makefile give 'missing separator' error?
    answer: >-
      You're using spaces instead of tabs for recipe indentation. Makefiles
      require literal tab characters before command lines. Configure your editor
      to use tabs in Makefiles (add [makefile] settings in VS Code or
      .editorconfig). Check with 'cat -A Makefile'.
  - question: How do I configure VS Code to use tabs in Makefiles?
    answer: >-
      Add to .vscode/settings.json: '"[makefile]": { "editor.insertSpaces":
      false, "editor.tabSize": 4 }'. Or use .editorconfig with
      '[Makefile]\nindent_style = tab'. This prevents the most common Makefile
      syntax error.
relatedItems:
  - make-phony-targets
  - make-target-organization
  - make-build-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Makefile Tab Indentation Rule

## Rule
All Makefile recipe lines (commands under targets) MUST use tab characters for indentation. Spaces cause a syntax error. Configure editors to use tabs in Makefiles.

## Why
GNU Make requires literal tab characters before recipe lines. This is a syntactic requirement from 1976 that cannot be changed. Spaces produce the cryptic error: `*** missing separator. Stop.`

## Format
```makefile
# CORRECT: tab-indented recipe
.PHONY: build
build:
	go build -o bin/app ./cmd/app
↑ This MUST be a tab character

# WRONG: space-indented recipe
.PHONY: build
build:
    go build -o bin/app ./cmd/app
↑ These spaces cause: *** missing separator. Stop.
```

## Editor Configuration

### VS Code
```json
// .vscode/settings.json
{
  "[makefile]": {
    "editor.insertSpaces": false,
    "editor.tabSize": 4
  }
}
```

### .editorconfig
```ini
[Makefile]
indent_style = tab
indent_size = 4

[*.mk]
indent_style = tab
indent_size = 4
```

### Neovim
```lua
vim.api.nvim_create_autocmd("FileType", {
  pattern = "make",
  callback = function()
    vim.opt_local.expandtab = false
    vim.opt_local.tabstop = 4
  end,
})
```

## Debugging
```bash
# Check for spaces in Makefile
cat -A Makefile | grep "^    "
# ^I = tab (correct), spaces = wrong

# Show invisible characters
cat -et Makefile
```

## Good
```
build:
^Igo build -o bin/app    (^I = tab character)
```

## Bad
```
build:
    go build -o bin/app    (4 spaces = syntax error)
```
