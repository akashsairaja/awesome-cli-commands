---
id: huggingface-dataset-formatting-rules
stackId: huggingface
type: rule
name: Dataset Formatting Standards
description: >-
  Enforce consistent dataset formatting for HuggingFace — column naming,
  instruction format, train/test splits, and metadata requirements for
  reproducible ML experiments.
difficulty: intermediate
globs:
  - '**/*.py'
  - '**/*.jsonl'
  - '**/*.csv'
tags:
  - datasets
  - formatting
  - standards
  - instruction-tuning
  - reproducibility
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
  - question: What format should I use for instruction tuning datasets?
    answer: >-
      Use three columns: 'instruction' (the task description), 'input' (optional
      context or code), and 'output' (the expected response). For chat-based
      models, use the 'messages' format with role/content pairs. Be consistent
      across all rows.
  - question: Why must dataset splits use a fixed random seed?
    answer: >-
      A fixed seed (e.g., seed=42) ensures the same train/test split every time.
      Without it, different runs produce different splits, making experiments
      non-reproducible — you can't compare model versions if they trained on
      different data subsets.
relatedItems:
  - huggingface-model-loading-rules
  - huggingface-api-token-rules
  - huggingface-datasets-loading
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Dataset Formatting Standards

## Rule
All datasets prepared for HuggingFace MUST follow standard column naming, include metadata, use deterministic splits, and include a dataset card (README.md).

## Column Naming Standards

### Instruction Tuning
```python
# Required columns
{
    "instruction": "Write a test for this function",
    "input": "def add(a, b): return a + b",    # Optional context
    "output": "def test_add(): assert add(2, 3) == 5"
}
```

### Chat Format
```python
# Required columns
{
    "messages": [
        {"role": "system", "content": "You are a code reviewer."},
        {"role": "user", "content": "Review this function..."},
        {"role": "assistant", "content": "The function has..."}
    ]
}
```

### Text Classification
```python
{
    "text": "The API response time improved by 40%",
    "label": "positive"
}
```

## Split Requirements
```python
# ALWAYS use deterministic splits with seed
split = dataset.train_test_split(test_size=0.1, seed=42)

# Standard split ratios
# Training: 80-90%
# Validation: 5-10%
# Test: 5-10%

# For small datasets (< 1000 examples), use k-fold cross-validation
```

## Dataset Card (Required)
```markdown
---
language: en
license: apache-2.0
task_categories:
  - text-generation
size_categories:
  - 1K<n<10K
---

# Dataset Name

## Description
What this dataset contains and what it's for.

## Format
Column descriptions and example rows.

## Collection Method
How the data was collected/generated.

## Limitations
Known biases, missing categories, quality issues.
```

## Good Formatting
```python
dataset = Dataset.from_list([
    {"instruction": "Explain recursion", "output": "Recursion is..."},
    # Consistent format, clean text, no HTML artifacts
])
```

## Bad Formatting
```python
dataset = Dataset.from_list([
    {"prompt": "explain recursion", "response": "Recursion is..."},
    {"input": "what is OOP", "answer": "OOP stands for..."},
    # Inconsistent column names, mixed formats
])
```

## Anti-Patterns
- Inconsistent column names across rows
- No dataset card (README.md) — others can't understand the data
- Non-deterministic splits (different results every run)
- Missing data quality checks (empty strings, duplicates, encoding issues)
- No train/test split (can't evaluate model performance)
