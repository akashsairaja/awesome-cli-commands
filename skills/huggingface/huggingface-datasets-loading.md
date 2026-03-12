---
id: huggingface-datasets-loading
stackId: huggingface
type: skill
name: Loading & Processing Datasets
description: >-
  Master HuggingFace datasets library — loading from Hub, local files, and APIs,
  with filtering, mapping, tokenization, and streaming for efficient data
  processing pipelines.
difficulty: intermediate
tags:
  - datasets
  - data-loading
  - preprocessing
  - streaming
  - tokenization
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - python
prerequisites:
  - Python 3.9+
  - datasets library installed
faq:
  - question: How do I load large datasets without running out of memory?
    answer: >-
      Use streaming mode: load_dataset('name', streaming=True). This processes
      data on-the-fly without downloading the entire dataset. For cached
      datasets, HuggingFace uses memory-mapped files that don't load into RAM —
      only accessed portions are read.
  - question: How do I create a dataset from my own data?
    answer: >-
      Use load_dataset('csv', data_files='file.csv') for CSV,
      load_dataset('json', data_files='file.jsonl') for JSON/JSONL, or
      Dataset.from_pandas(df) for DataFrames. Push to the Hub with
      dataset.push_to_hub('org/name') for team sharing.
  - question: Why is map() with batched=True faster?
    answer: >-
      Batched processing sends multiple examples to your function at once,
      reducing Python overhead and enabling vectorized operations. Tokenizers
      especially benefit — they can process batches in parallel using Rust
      backends. Set num_proc for additional multi-core parallelism.
relatedItems:
  - huggingface-fine-tuning-setup
  - huggingface-inference-api
  - huggingface-model-scout
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Loading & Processing Datasets

## Overview
The HuggingFace datasets library provides efficient, memory-mapped data loading with streaming support. Load datasets from the Hub, local files, or custom sources with built-in processing, filtering, and tokenization tools.

## Why This Matters
- **Memory efficient** — datasets are memory-mapped, not loaded into RAM
- **Streaming** — process TB-scale datasets without downloading entirely
- **Caching** — processed datasets are cached for instant reloading
- **Hub integration** — 100k+ datasets available with one line of code

## How It Works

### Step 1: Load from Hub
```python
from datasets import load_dataset

# Load a popular dataset
dataset = load_dataset("code_search_net", "python")

# Load specific split
train = load_dataset("code_search_net", "python", split="train")

# Load with streaming (for large datasets)
stream = load_dataset("bigcode/the-stack", split="train", streaming=True)
for example in stream:
    process(example)
    break  # Process one at a time, no download needed
```

### Step 2: Load from Local Files
```python
# From CSV
dataset = load_dataset("csv", data_files="training_data.csv")

# From JSON/JSONL
dataset = load_dataset("json", data_files="data.jsonl")

# From a directory of files
dataset = load_dataset("json", data_dir="./data/")

# From pandas DataFrame
import pandas as pd
df = pd.read_csv("data.csv")
dataset = Dataset.from_pandas(df)
```

### Step 3: Process and Transform
```python
# Filter rows
python_only = dataset.filter(lambda x: x["language"] == "python")

# Map transformations (batched for speed)
def tokenize(examples):
    return tokenizer(examples["text"], truncation=True, max_length=512)

tokenized = dataset.map(tokenize, batched=True, num_proc=4)

# Select/rename columns
clean = dataset.select_columns(["input", "output"])
renamed = dataset.rename_column("input", "instruction")

# Train/test split
split = dataset.train_test_split(test_size=0.1, seed=42)
train_set = split["train"]
test_set = split["test"]
```

### Step 4: Push to Hub
```python
# Share your processed dataset
dataset.push_to_hub("your-org/processed-dataset")

# With train/test splits
from datasets import DatasetDict
ds = DatasetDict({"train": train_set, "test": test_set})
ds.push_to_hub("your-org/processed-dataset")
```

## Best Practices
- Use streaming for datasets > 10GB to avoid download wait
- Set num_proc for parallel mapping on multi-core machines
- Use batched=True for tokenization (10x faster)
- Cache processed datasets to avoid recomputing
- Always set a random seed for train_test_split reproducibility

## Common Mistakes
- Loading entire dataset into memory (use memory-mapped files)
- Not using batched processing (10x slower tokenization)
- Forgetting to set seed for splits (non-reproducible experiments)
- Not checking dataset schema before processing (column name mismatches)
- Processing in Python loop instead of .map() (much slower)
