---
id: ollama-gpu-optimization
stackId: ollama
type: skill
name: >-
  GPU & Performance Optimization
description: >-
  Optimize Ollama inference performance — GPU layer allocation, batch
  processing, context window tuning, concurrent requests, and
  hardware-specific configuration for fast local AI.
difficulty: intermediate
tags:
  - ollama
  - gpu
  - performance
  - optimization
  - api
  - prompting
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
faq:
  - question: "When should I use the GPU & Performance Optimization skill?"
    answer: >-
      Optimize Ollama inference performance — GPU layer allocation, batch
      processing, context window tuning, concurrent requests, and
      hardware-specific configuration for fast local AI. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does GPU & Performance Optimization require?"
    answer: >-
      Works with standard ollama tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# GPU & Performance Optimization

## Overview
Ollama performance depends heavily on hardware configuration. Learn to allocate GPU layers, tune context windows, configure concurrent requests, and optimize memory usage for the fastest possible local inference.

## Why This Matters
- **Speed** — proper GPU config can 10x inference speed vs CPU-only
- **Responsiveness** — optimized settings enable real-time code assistance
- **Stability** — prevent OOM crashes from misconfigured memory allocation
- **Efficiency** — run larger models on the same hardware

## How It Works

### Step 1: Check Hardware
```bash
# Check GPU availability (NVIDIA)
nvidia-smi

# Check GPU availability (macOS)
system_profiler SPDisplaysDataType | grep "VRAM\|Chipset"

# Verify Ollama sees GPU
ollama run llama3.1:8b "test" --verbose 2>&1 | grep -i gpu
```

### Step 2: Configure GPU Layers
```bash
# In Modelfile — control GPU vs CPU layer split
PARAMETER num_gpu 35    # Number of layers on GPU (default: all)
# Set to 0 for CPU-only, -1 for all layers on GPU

# Via API — per-request override
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "messages": [{"role": "user", "content": "hello"}],
  "options": {
    "num_gpu": 35
  }
}'
```

### Step 3: Optimize Context Window
```bash
# Context window directly impacts memory usage
# 4096 ctx ≈ base model size
# 8192 ctx ≈ base + 25% more memory
# 32768 ctx ≈ base + 200% more memory

# Set in Modelfile
PARAMETER num_ctx 8192

# Or per-request
curl http://localhost:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "options": { "num_ctx": 8192 },
  "messages": [{"role": "user", "content": "analyze this code..."}]
}'
```

### Step 4: Environment Variables
```bash
# Control Ollama behavior via environment
export OLLAMA_NUM_PARALLEL=2      # Concurrent request slots
export OLLAMA_MAX_LOADED_MODELS=2 # Models kept in memory
export OLLAMA_FLASH_ATTENTION=1   # Enable flash attention (faster)
export OLLAMA_GPU_OVERHEAD=256m   # Reserve GPU memory for system

# On Linux, edit /etc/systemd/system/ollama.service
# On macOS, use launchctl or terminal exports
# On Windows, set in System Environment Variables
```

### Step 5: Benchmark Your Setup
```bash
# Measure tokens per second
time ollama run qwen2.5-coder:7b "Write a merge sort in Python" --verbose 2>&1 | tail -5

# Compare different quantizations
ollama pull llama3.1:8b-instruct-q4_K_M
ollama pull llama3.1:8b-instruct-q5_K_M
# Run the same prompt with each, compare speed vs quality
```

## Performance Tuning Table
| Setting | Low Memory (8GB) | Medium (16GB) | High (24GB+) |
|---------|-------------------|---------------|---------------|
| Model size | 7B Q4 | 13B Q4 or 7B Q5 | 34B Q4 or 13B Q8 |
| num_ctx | 4096 | 8192 | 16384-32768 |
| num_gpu | All (-1) | All (-1) | All (-1) |
| PARALLEL | 1 | 2 | 4 |
| MAX_LOADED | 1 | 2 | 3 |

## Best Practices
- Always use Flash Attention when available (OLLAMA_FLASH_ATTENTION=1)
- Start with all layers on GPU, reduce only if OOM
- Match context window to actual need — don't set 32k for simple completions
- Keep one concurrent slot per expected user
- Monitor GPU memory with nvidia-smi during operation

## Common Mistakes
- Setting num_ctx to 32768 on 8GB VRAM (will OOM)
- Running multiple large models simultaneously (memory thrashing)
- Not enabling Flash Attention (20-30% speed improvement)
- Using CPU-only mode when GPU is available
- Setting PARALLEL too high (each slot reserves memory)
