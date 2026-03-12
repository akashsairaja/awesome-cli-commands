---
id: ollama-resource-management-rules
stackId: ollama
type: rule
name: Resource Management Rules
description: >-
  Enforce GPU memory, disk storage, and concurrent request limits for Ollama
  deployments — preventing out-of-memory crashes, storage exhaustion, and
  performance degradation.
difficulty: advanced
globs:
  - '**/ollama*'
  - '**/.env*'
tags:
  - resource-management
  - gpu-memory
  - concurrency
  - storage
  - configuration
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
faq:
  - question: How do I prevent Ollama from crashing with out-of-memory errors?
    answer: >-
      Set OLLAMA_GPU_OVERHEAD to reserve memory for the OS, limit
      OLLAMA_NUM_PARALLEL to match your VRAM budget, and set
      OLLAMA_MAX_LOADED_MODELS based on available memory. Keep num_ctx
      proportional to your VRAM — don't set 32k context on 8GB VRAM.
  - question: How many concurrent Ollama requests can my GPU handle?
    answer: >-
      Calculate: floor(Available VRAM / Model VRAM requirement). A 7B Q4 model
      needs ~5GB, so 16GB VRAM supports 3 parallel slots maximum. Set
      OLLAMA_NUM_PARALLEL accordingly. Each slot reserves memory even when idle.
relatedItems:
  - ollama-modelfile-standards
  - ollama-api-configuration-rules
  - ollama-gpu-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Resource Management Rules

## Rule
All Ollama deployments MUST configure memory limits, storage monitoring, and concurrent request limits based on available hardware resources.

## Memory Rules

### GPU Memory Budget
```bash
# Rule: Never allocate more than 90% of VRAM to Ollama
# Leave 10% for OS and other GPU tasks

# Check available VRAM
nvidia-smi --query-gpu=memory.total,memory.used,memory.free --format=csv

# Set GPU overhead reservation
export OLLAMA_GPU_OVERHEAD=512m  # Reserve 512MB for system
```

### Context Window Limits
```
# Maximum num_ctx by VRAM (for 7B Q4 model)
4 GB VRAM  → num_ctx max 4096
8 GB VRAM  → num_ctx max 16384
16 GB VRAM → num_ctx max 32768
24 GB VRAM → num_ctx max 65536
```

## Storage Rules
```bash
# Monitor model storage
ollama list  # Check sizes

# Rule: Set up alerts when model storage exceeds threshold
# Models location: ~/.ollama/models
du -sh ~/.ollama/models/

# Cleanup rule: Remove models unused for 30+ days
# Document which models are in active use
```

## Concurrency Rules
```bash
# Rule: Concurrent slots = floor(Available VRAM / Model VRAM requirement)
# Example: 16GB VRAM, 7B Q4 model (5GB) → max 3 parallel slots

export OLLAMA_NUM_PARALLEL=2      # Conservative default
export OLLAMA_MAX_LOADED_MODELS=2 # Don't load more models than VRAM allows
```

## Environment Configuration Template
```bash
# /etc/environment.d/ollama.conf (Linux systemd)
# Or set in shell profile

# GPU Configuration
OLLAMA_FLASH_ATTENTION=1       # Always enable
OLLAMA_GPU_OVERHEAD=512m       # Reserve for system

# Concurrency (adjust per hardware)
OLLAMA_NUM_PARALLEL=2          # Concurrent requests
OLLAMA_MAX_LOADED_MODELS=2     # Models in memory

# Network (if serving to network)
OLLAMA_HOST=0.0.0.0:11434     # Listen on all interfaces
OLLAMA_ORIGINS=*               # CORS (restrict in production)
```

## Good Configuration (16GB VRAM)
```bash
OLLAMA_FLASH_ATTENTION=1
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=2
# Running: qwen2.5-coder:14b-q4_K_M with num_ctx 8192
```

## Bad Configuration (8GB VRAM)
```bash
OLLAMA_NUM_PARALLEL=4          # Too many — will OOM
OLLAMA_MAX_LOADED_MODELS=3     # Can't fit 3 models in 8GB
# Running: llama3.1:70b with num_ctx 32768  # Way too large for 8GB
```

## Anti-Patterns
- No memory limits set (OOM crashes under load)
- PARALLEL set higher than hardware supports
- Loading multiple large models simultaneously
- Not monitoring disk space for model storage
- Running GPU models without checking CUDA/Metal availability
