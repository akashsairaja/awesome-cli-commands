---
id: huggingface-model-loading-rules
stackId: huggingface
type: rule
name: Model Loading Best Practices
description: >-
  Enforce safe and efficient model loading patterns — device mapping, memory
  management, quantization configuration, and error handling for HuggingFace
  Transformers models.
difficulty: intermediate
globs:
  - '**/*.py'
tags:
  - model-loading
  - memory-management
  - quantization
  - device-mapping
  - security
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - python
faq:
  - question: Why should I always use Auto classes for HuggingFace model loading?
    answer: >-
      Auto classes (AutoModelForCausalLM, AutoTokenizer) automatically detect
      the correct model architecture from the config file. This makes your code
      portable across different models without changing the loading code — just
      change the model_id string.
  - question: Is trust_remote_code=True dangerous?
    answer: >-
      Yes. It allows the model repository to execute arbitrary Python code on
      your machine during loading. Only use it for models you trust (official
      repos, verified organizations). Always review the model's code files
      before enabling this flag.
relatedItems:
  - huggingface-dataset-formatting-rules
  - huggingface-api-token-rules
  - huggingface-pipeline-builder
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Model Loading Best Practices

## Rule
All HuggingFace model loading MUST use AutoModel classes, explicit device mapping, and proper memory management. Never load models without specifying resource constraints.

## Required Patterns

### Good — Production Model Loading
```python
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

# Always use Auto classes for portability
model_id = "Qwen/Qwen2.5-Coder-7B-Instruct"

# Explicit quantization config
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16,
)

# Load with explicit device mapping
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16,
    trust_remote_code=False,  # Explicit security setting
)

# Always load tokenizer from same source
tokenizer = AutoTokenizer.from_pretrained(model_id)

# Set to evaluation mode for inference
model.eval()
```

### Bad — Unsafe Loading
```python
# Missing device_map, no quantization, no eval()
model = AutoModelForCausalLM.from_pretrained("some-model")
# trust_remote_code=True without review (security risk)
model = AutoModelForCausalLM.from_pretrained("unknown/model", trust_remote_code=True)
```

## Rules
1. **Always use Auto classes** — AutoModelForCausalLM, AutoTokenizer, etc.
2. **Always set device_map** — "auto" for inference, explicit for training
3. **Always call model.eval()** — disables dropout for consistent inference
4. **Never trust_remote_code=True** without reviewing the model's code
5. **Always specify torch_dtype** — float16 or bfloat16, never default float32
6. **Use quantization** for models > 3B parameters on consumer GPUs

## Memory Management
```python
# Free GPU memory after use
import gc
del model
gc.collect()
torch.cuda.empty_cache()
```

## Anti-Patterns
- Loading in float32 (double the memory of float16, negligible quality gain)
- No device_map (model goes to CPU, inference is 100x slower)
- trust_remote_code=True on untrusted models (arbitrary code execution risk)
- Not calling model.eval() (dropout active during inference)
- Loading model and tokenizer from different sources (tokenizer mismatch)
