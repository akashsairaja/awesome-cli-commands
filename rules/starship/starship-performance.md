---
id: starship-performance
stackId: starship
type: rule
name: Starship Prompt Performance Rules
description: >-
  Performance standards for Starship prompts — render time limits, scan timeout
  configuration, module budget, and profiling requirements for responsive
  terminal experience.
difficulty: intermediate
globs:
  - '**/starship.toml'
tags:
  - performance
  - render-time
  - scan-timeout
  - optimization
  - profiling
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How do I profile Starship prompt performance?
    answer: >-
      Run 'STARSHIP_LOG=trace starship prompt 2>&1' to see timing for each
      module. Sort by duration to find slow modules. Also use 'time starship
      prompt' for total render time. Target under 200ms for a responsive prompt.
  - question: Why is my Starship prompt slow?
    answer: >-
      Common causes: git_status in large repos (100k+ files), too many active
      modules, slow network drives, or submodule scanning. Fix with
      scan_timeout, ignore_submodules, disabling unused modules, and setting
      command_timeout to 500ms.
relatedItems:
  - starship-toml-structure
  - starship-module-config
  - starship-prompt-designer
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Starship Prompt Performance Rules

## Rule
Starship prompts MUST render in under 200ms. Configure scan_timeout, limit active modules, and profile regularly to prevent slow prompts.

## Performance Budget
| Metric | Target |
|--------|--------|
| Total render time | < 200ms |
| command_timeout | 500ms (global) |
| scan_timeout | 30ms |
| Active modules | < 15 |
| Git status scan | < 100ms |

## Configuration
```toml
# Global timeout settings
command_timeout = 500   # Max time for any module command
scan_timeout = 30       # Max time for directory scanning

# Only enable modules you need
format = """
$directory$git_branch$git_status$nodejs$cmd_duration$line_break$character"""
```

## Profiling
```bash
# Profile prompt render time
STARSHIP_LOG=trace starship prompt 2>&1 | grep "render"

# Time the entire prompt
time starship prompt

# Identify slow modules
STARSHIP_LOG=trace starship prompt 2>&1 | sort -t= -k2 -rn
```

## Optimization Rules

### Disable Unused Modules
```toml
# Good: explicitly disabled
[ruby]
disabled = true
[php]
disabled = true
[java]
disabled = true
```

### Large Repository Handling
```toml
# For repos with 100k+ files
[git_status]
ignore_submodules = true

# Consider disabling for specific repos
# Create .config/starship.toml in repo root
```

## Good
```bash
# Prompt renders in < 100ms
$ time starship prompt
real    0m0.045s
```

## Bad
```bash
# Prompt renders in > 500ms (noticeable lag)
$ time starship prompt
real    0m0.650s
```
