---
id: huggingface-fine-tuning-setup
stackId: huggingface
type: skill
name: >-
  Fine-Tuning Models with PEFT & LoRA
description: >-
  Fine-tune HuggingFace models efficiently using PEFT and LoRA — dataset
  preparation, training configuration, adapter merging, and model publishing
  for domain-specific AI.
difficulty: intermediate
tags:
  - huggingface
  - fine-tuning
  - models
  - peft
  - lora
  - prompting
  - llm
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Fine-Tuning Models with PEFT & LoRA skill?"
    answer: >-
      Fine-tune HuggingFace models efficiently using PEFT and LoRA — dataset
      preparation, training configuration, adapter merging, and model
      publishing for domain-specific AI. This skill provides a structured
      workflow for model management, dataset handling, fine-tuning, and ML
      pipeline deployment.
  - question: "What tools and setup does Fine-Tuning Models with PEFT & LoRA require?"
    answer: >-
      Works with standard Hugging Face tooling (Hugging Face CLI (hf),
      transformers library). Review the setup section in the skill content for
      specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
