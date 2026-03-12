---
id: huggingface-inference-api
stackId: huggingface
type: skill
name: HuggingFace Inference API Integration
description: >-
  Integrate HuggingFace's Inference API into your applications — serverless
  model inference, streaming responses, and dedicated endpoints without managing
  infrastructure.
difficulty: beginner
tags:
  - inference-api
  - serverless
  - api-integration
  - streaming
  - endpoints
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - typescript
  - python
prerequisites:
  - HuggingFace account with API token
  - Node.js or Python
faq:
  - question: What is the HuggingFace Inference API?
    answer: >-
      The Inference API provides serverless access to HuggingFace models via
      HTTP requests. Send your input, get model output — no GPU servers to
      manage. It supports text generation, classification, embeddings, image
      generation, and more across 200k+ models.
  - question: What is the difference between serverless and dedicated endpoints?
    answer: >-
      Serverless is free/cheap for development — models are shared and may have
      cold starts. Dedicated endpoints give you reserved GPU instances with
      guaranteed availability, autoscaling, and SLA for production use. Use
      serverless for development, dedicated for production.
  - question: How do I handle model loading delays on the Inference API?
    answer: >-
      The serverless API returns 503 when a model is loading (cold start).
      Implement retry logic with exponential backoff — wait 20-60 seconds and
      retry. The model stays loaded for ~15 minutes after last request.
      Dedicated endpoints avoid this issue entirely.
relatedItems:
  - huggingface-fine-tuning-setup
  - huggingface-datasets-loading
  - huggingface-model-scout
version: 1.0.0
lastUpdated: '2026-03-11'
---

# HuggingFace Inference API Integration

## Overview
The HuggingFace Inference API provides serverless access to thousands of models without deploying infrastructure. Use it for text generation, embeddings, classification, and image tasks with simple HTTP requests.

## Why This Matters
- **Zero infrastructure** — no GPU servers to manage
- **Model variety** — access 200k+ models via API
- **Scalability** — automatic scaling from hobby to production
- **Cost efficiency** — pay per request, no idle GPU costs

## How It Works

### Step 1: Get an API Token
```bash
# Get your token from https://huggingface.co/settings/tokens
export HF_TOKEN="hf_..."
```

### Step 2: Basic Inference
```bash
# Text generation
curl https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-7B-Instruct \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Write a Python function to reverse a linked list"}'

# Text classification (sentiment)
curl https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english \
  -H "Authorization: Bearer $HF_TOKEN" \
  -d '{"inputs": "This code refactor is excellent!"}'
```

### Step 3: TypeScript Client
```typescript
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HF_TOKEN);

// Text generation
const result = await hf.textGeneration({
  model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
  inputs: 'Write a debounce function in TypeScript',
  parameters: {
    max_new_tokens: 500,
    temperature: 0.2,
    return_full_text: false,
  },
});

// Streaming
const stream = hf.textGenerationStream({
  model: 'Qwen/Qwen2.5-Coder-7B-Instruct',
  inputs: 'Explain async/await in TypeScript',
});

for await (const chunk of stream) {
  process.stdout.write(chunk.token.text);
}

// Embeddings
const embeddings = await hf.featureExtraction({
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  inputs: 'function to fetch user by ID',
});
```

### Step 4: Dedicated Endpoints (Production)
```bash
# Create a dedicated endpoint via HuggingFace UI or API
# Benefits: guaranteed availability, autoscaling, custom hardware

curl https://your-endpoint-id.us-east-1.aws.endpoints.huggingface.cloud \
  -H "Authorization: Bearer $HF_TOKEN" \
  -d '{"inputs": "production query here"}'
```

## Best Practices
- Use the @huggingface/inference npm package for TypeScript projects
- Enable streaming for interactive applications
- Set max_new_tokens to prevent runaway generation
- Use dedicated endpoints for production workloads (SLA guarantees)
- Cache responses for identical queries to reduce costs

## Common Mistakes
- Not setting max_new_tokens (model generates until context limit)
- Using serverless API for production traffic (rate limited, cold starts)
- Sending large payloads without checking model's max input length
- Not handling 503 (model loading) responses with retry logic
- Exposing HF_TOKEN in client-side code
