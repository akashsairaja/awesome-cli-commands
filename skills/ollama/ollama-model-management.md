---
id: ollama-model-management
stackId: ollama
type: skill
name: Model Management & Organization
description: >-
  Master Ollama model lifecycle — pulling, listing, copying, removing models,
  managing storage, and organizing custom model variants for efficient local AI
  development.
difficulty: beginner
tags:
  - model-management
  - ollama-pull
  - storage
  - custom-models
  - organization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
prerequisites:
  - Ollama installed
faq:
  - question: How do I manage Ollama model storage?
    answer: >-
      Use 'ollama list' to see all models with sizes, 'ollama rm <model>' to
      remove unused ones. Models are stored in ~/.ollama/models (Linux/Mac) or
      C:\Users\<user>\.ollama\models (Windows). Regularly remove models you
      haven't used in 30+ days to free disk space.
  - question: What quantization level should I use for Ollama models?
    answer: >-
      Q4_K_M offers the best balance of speed and quality for most tasks. Q5_K_M
      provides slightly better quality at ~15% more memory. Use Q8_0 only if you
      have ample VRAM and need maximum quality. Avoid Q2/Q3 — quality drops
      significantly.
  - question: How do I create a custom Ollama model for coding?
    answer: >-
      Create a Modelfile that specifies a base model (FROM), system prompt
      (SYSTEM), and parameters (temperature, context size). Build it with
      'ollama create my-coder -f Modelfile'. Customize the system prompt for
      your language/framework.
relatedItems:
  - ollama-api-integration
  - ollama-embedding-setup
  - ollama-model-manager
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Model Management & Organization

## Overview
Effective model management keeps your Ollama installation fast, organized, and storage-efficient. Learn to pull the right models, create custom variants, manage disk space, and organize models for different development tasks.

## Why This Matters
- **Storage control** — models range from 2GB to 40GB each
- **Fast switching** — organized models let you switch contexts quickly
- **Team alignment** — consistent model versions across developers
- **Performance** — right model for the right task

## How It Works

### Step 1: Pull and List Models
```bash
# Pull a model from the Ollama registry
ollama pull llama3.1:8b-instruct-q5_K_M

# Pull a coding-specific model
ollama pull qwen2.5-coder:7b

# List all downloaded models
ollama list

# Show model details
ollama show llama3.1:8b-instruct-q5_K_M
```

### Step 2: Create Custom Variants
```bash
# Create a Modelfile for your custom variant
cat << 'EOF' > Modelfile.typescript
FROM qwen2.5-coder:7b
SYSTEM "You are a TypeScript expert. Generate strict, type-safe code with proper error handling."
PARAMETER temperature 0.2
PARAMETER num_ctx 8192
EOF

# Build the custom model
ollama create ts-coder -f Modelfile.typescript

# Test it
ollama run ts-coder "Write a function to debounce API calls"
```

### Step 3: Copy and Version Models
```bash
# Copy a model (useful for creating variants)
ollama cp qwen2.5-coder:7b my-coder:v1

# After tuning, create a new version
ollama create my-coder:v2 -f Modelfile.v2
```

### Step 4: Manage Storage
```bash
# Check model storage location
# Linux/Mac: ~/.ollama/models
# Windows: C:\Users\<user>\.ollama\models

# Remove unused models
ollama rm codellama:7b
ollama rm llama2:13b

# Check disk usage by model
ollama list  # Shows size column
```

## Best Practices
- Pull quantized models (Q4_K_M, Q5_K_M) — best speed/quality ratio
- Name custom models descriptively: `ts-coder`, `python-reviewer`, `sql-helper`
- Remove models you haven't used in 30+ days
- Use instruct/chat variants for interactive coding, base models for completion
- Pin model versions in team documentation to ensure consistency

## Common Mistakes
- Pulling multiple sizes of the same model (wasteful)
- Using the :latest tag (breaks reproducibility when model updates)
- Not removing old models (disk fills up silently)
- Using base models for chat tasks (poor instruction following)
