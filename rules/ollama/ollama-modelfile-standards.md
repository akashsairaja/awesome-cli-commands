---
id: ollama-modelfile-standards
stackId: ollama
type: rule
name: Modelfile Standards
description: >-
  Enforce consistent Ollama Modelfile structure with required sections,
  parameter documentation, proper system prompts, and template configuration for
  reliable custom model builds.
difficulty: intermediate
globs:
  - '**/Modelfile*'
  - '**/modelfile*'
tags:
  - modelfile
  - standards
  - configuration
  - naming
  - parameters
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
faq:
  - question: What must every Ollama Modelfile include?
    answer: >-
      Every Modelfile needs: FROM with a specific model tag (not :latest),
      SYSTEM prompt defining behavior, temperature parameter, num_ctx for
      context window size, and appropriate stop tokens for the model
      architecture. Include comments documenting each parameter choice.
  - question: How should I name custom Ollama models?
    answer: >-
      Use the pattern purpose-language:version — for example, ts-coder:v1,
      python-reviewer:v2, sql-helper:v1. Names should be lowercase, descriptive
      of the model's purpose, and include a version tag for reproducibility.
relatedItems:
  - ollama-api-configuration-rules
  - ollama-resource-management-rules
  - ollama-modelfile-builder
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Modelfile Standards

## Rule
All Ollama Modelfiles MUST include a FROM directive, documented SYSTEM prompt, explicitly set temperature, num_ctx, and appropriate stop tokens.

## Required Structure
```dockerfile
# Model: descriptive-name
# Purpose: What this model variant is for
# Base: model-name:tag

FROM model-name:tag

# System prompt — defines model behavior
SYSTEM """
Clear, focused system prompt describing the model's role
and behavioral constraints.
"""

# Inference parameters — documented
PARAMETER temperature 0.2      # Low for code, higher for creative
PARAMETER top_p 0.9            # Nucleus sampling threshold
PARAMETER num_ctx 8192         # Context window size
PARAMETER num_predict 2048     # Max output tokens
PARAMETER stop "<|eot_id|>"    # Stop token for model architecture
```

## Naming Convention
```bash
# Model names: lowercase, descriptive, version tagged
# Format: purpose-language:version
ollama create ts-coder:v1 -f Modelfile.typescript
ollama create python-reviewer:v2 -f Modelfile.python-review
ollama create sql-helper:v1 -f Modelfile.sql
```

### Good Names
```
ts-coder:v1
react-assistant:v2
sql-optimizer:v1
python-debugger:v1
```

### Bad Names
```
my-model          # No purpose, no version
test              # Meaningless
asdf:latest       # Not descriptive
```

## Parameter Rules
| Parameter | Code Gen | Code Review | Creative |
|-----------|----------|-------------|----------|
| temperature | 0.1-0.3 | 0.3-0.5 | 0.7-0.9 |
| num_ctx | 8192+ | 8192+ | 4096 |
| num_predict | 2048 | 4096 | 2048 |
| top_p | 0.9 | 0.95 | 0.95 |

## Anti-Patterns
- Modelfile without SYSTEM prompt (generic behavior)
- No temperature set (defaults vary by model)
- Missing stop tokens (generation runs past intended end)
- No comments explaining parameter choices
- Using :latest tag in FROM (breaks reproducibility)
