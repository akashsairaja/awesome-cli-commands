---
id: huggingface-api-token-rules
stackId: huggingface
type: rule
name: API Token Security Rules
description: >-
  Security rules for HuggingFace API tokens — storage, rotation, permission
  scoping, environment variable usage, and preventing token exposure in code and
  logs.
difficulty: beginner
globs:
  - '**/*.py'
  - '**/.env*'
  - '**/.gitignore'
tags:
  - api-tokens
  - security
  - environment-variables
  - authentication
  - credentials
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: How should I store my HuggingFace API token?
    answer: >-
      Store it in an environment variable (HF_TOKEN) loaded from a .env file
      that's in .gitignore. Never hardcode tokens in source code. Use the
      huggingface-cli login command for local development and CI/CD secrets for
      automated pipelines.
  - question: What permissions should my HuggingFace token have?
    answer: >-
      Use the minimum permissions needed: read-only tokens for inference and
      model downloading, write tokens only for uploading models and datasets.
      For production, use fine-grained tokens scoped to specific repositories.
relatedItems:
  - huggingface-model-loading-rules
  - huggingface-dataset-formatting-rules
  - huggingface-inference-api
version: 1.0.0
lastUpdated: '2026-03-11'
---

# API Token Security Rules

## Rule
HuggingFace API tokens MUST be stored in environment variables, never hardcoded. Use fine-grained tokens with minimal permissions.

## Token Storage

### Good — Environment Variables
```python
import os
from huggingface_hub import login

# Load from environment
hf_token = os.environ.get("HF_TOKEN")
if not hf_token:
    raise ValueError("HF_TOKEN environment variable not set")

login(token=hf_token)
```

### Bad — Hardcoded Token
```python
# NEVER do this
login(token="hf_AbCdEfGhIjKlMnOpQrStUvWxYz")  # Exposed in code!
```

## Token Types and Permissions
| Token Type | Permissions | Use Case |
|-----------|------------|----------|
| Read | Download models/datasets | CI/CD, inference |
| Write | Upload models/datasets | Training pipelines |
| Fine-grained | Custom per-repo | Production (recommended) |

## Environment Setup
```bash
# .env file (gitignored!)
HF_TOKEN=hf_...

# Or use HuggingFace CLI
huggingface-cli login

# Verify login
huggingface-cli whoami
```

## Gitignore Rules
```gitignore
# Always ignore
.env
.env.*
!.env.example
**/token
**/token.txt
**/.huggingface/
```

## CI/CD Configuration
```yaml
# GitHub Actions — use secrets
- name: Login to HuggingFace
  env:
    HF_TOKEN: ${{ secrets.HF_TOKEN }}
  run: huggingface-cli login --token $HF_TOKEN
```

## Token Rotation
- Rotate tokens every 90 days
- Revoke tokens immediately if exposed
- Use different tokens for development and production
- Audit token usage in HuggingFace settings

## Anti-Patterns
- Hardcoded tokens in source code
- Tokens in Jupyter notebook output cells (committed accidentally)
- Same token for all environments (dev, staging, prod)
- Write tokens used where read-only would suffice
- Tokens logged to stdout or log files
