---
id: huggingface-fine-tuning-setup
stackId: huggingface
type: skill
name: Fine-Tuning Models with PEFT & LoRA
description: >-
  Fine-tune HuggingFace models efficiently using PEFT and LoRA — dataset
  preparation, training configuration, adapter merging, and model publishing for
  domain-specific AI.
difficulty: advanced
tags:
  - fine-tuning
  - lora
  - peft
  - training
  - adapters
  - datasets
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - python
prerequisites:
  - Python 3.9+
  - GPU with 16GB+ VRAM
  - 'transformers, peft, trl libraries installed'
faq:
  - question: What is LoRA fine-tuning?
    answer: >-
      LoRA (Low-Rank Adaptation) fine-tunes large models by adding small
      trainable adapter layers instead of updating all parameters. This reduces
      memory requirements by 75%+ and training time by 90%, making it possible
      to fine-tune 7B models on a single consumer GPU.
  - question: How much training data do I need for LoRA fine-tuning?
    answer: >-
      A minimum of 1000 high-quality examples for meaningful results. 5000-10000
      examples is ideal for most tasks. Below 500 examples, the model tends to
      memorize rather than generalize. Quality matters more than quantity —
      clean, consistent formatting is essential.
  - question: What hardware do I need for LoRA fine-tuning?
    answer: >-
      A GPU with 16GB+ VRAM (RTX 4090, A100, etc.) for 7B models with 4-bit
      quantization. For 13B models, you need 24GB+ VRAM. Use gradient
      accumulation to simulate larger batch sizes when VRAM is limited.
relatedItems:
  - huggingface-inference-api
  - huggingface-datasets-loading
  - huggingface-model-scout
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Fine-Tuning Models with PEFT & LoRA

## Overview
LoRA (Low-Rank Adaptation) lets you fine-tune large models by training small adapter layers instead of all parameters. This reduces GPU memory by 75%+ and training time by 90%, making fine-tuning accessible on consumer hardware.

## Why This Matters
- **Affordable** — fine-tune 7B models on a single 24GB GPU
- **Fast** — hours instead of days of training
- **Efficient** — adapters are 10-100MB vs multi-GB full models
- **Composable** — swap adapters for different tasks on the same base model

## How It Works

### Step 1: Prepare Your Dataset
```python
from datasets import load_dataset, Dataset

# Load from HuggingFace Hub
dataset = load_dataset("your-org/your-dataset")

# Or create from local data
data = [
    {"instruction": "Write a test for this function", "input": "def add(a, b): return a + b", "output": "def test_add():\n    assert add(2, 3) == 5"},
    # ... more examples
]
dataset = Dataset.from_list(data)

# Format for instruction tuning
def format_prompt(example):
    return {
        "text": f"""### Instruction: {example['instruction']}
### Input: {example['input']}
### Output: {example['output']}"""
    }

dataset = dataset.map(format_prompt)
```

### Step 2: Configure LoRA
```python
from peft import LoraConfig, get_peft_model, TaskType

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=16,                    # Rank — higher = more capacity, more memory
    lora_alpha=32,           # Scaling factor (usually 2x r)
    lora_dropout=0.05,       # Dropout for regularization
    target_modules=[         # Which layers to adapt
        "q_proj", "v_proj",  # Attention layers (minimum)
        "k_proj", "o_proj",  # More layers = better fit, more memory
    ],
    bias="none",
)
```

### Step 3: Train
```python
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-Coder-7B",
    load_in_4bit=True,
    device_map="auto",
)
tokenizer = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-Coder-7B")

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    warmup_steps=100,
    logging_steps=10,
    save_strategy="epoch",
    fp16=True,
)

trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    peft_config=lora_config,
    args=training_args,
    tokenizer=tokenizer,
    dataset_text_field="text",
    max_seq_length=2048,
)

trainer.train()
trainer.save_model("./my-lora-adapter")
```

### Step 4: Merge and Push
```python
from peft import PeftModel

# Merge adapter with base model
base_model = AutoModelForCausalLM.from_pretrained("Qwen/Qwen2.5-Coder-7B")
merged_model = PeftModel.from_pretrained(base_model, "./my-lora-adapter")
merged_model = merged_model.merge_and_unload()

# Push to HuggingFace Hub
merged_model.push_to_hub("your-org/your-fine-tuned-model")
tokenizer.push_to_hub("your-org/your-fine-tuned-model")
```

## Best Practices
- Start with r=16, increase to 32-64 if underfitting
- Use at least 1000 examples for meaningful fine-tuning
- Always include a validation split to detect overfitting
- Save checkpoints — you can resume training if interrupted
- Test the fine-tuned model against the base model with held-out examples

## Common Mistakes
- Too few examples (< 100) — model memorizes instead of generalizing
- r too high for small datasets (overfitting)
- No validation split (can't detect overfitting)
- Training for too many epochs (overfitting)
- Not formatting data consistently (model learns noise)
