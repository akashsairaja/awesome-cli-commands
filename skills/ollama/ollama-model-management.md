---
id: ollama-model-management
stackId: ollama
type: skill
name: >-
  Model Management & Organization
description: >-
  Master Ollama model lifecycle — pulling, listing, copying, removing models,
  managing storage, and organizing custom model variants for efficient local
  AI development.
difficulty: intermediate
tags:
  - ollama
  - model
  - management
  - organization
  - performance
  - api
  - best-practices
  - type-safety
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
faq:
  - question: "When should I use the Model Management & Organization skill?"
    answer: >-
      Master Ollama model lifecycle — pulling, listing, copying, removing
      models, managing storage, and organizing custom model variants for
      efficient local AI development. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Model Management & Organization require?"
    answer: >-
      Works with standard ollama tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working ollama environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
