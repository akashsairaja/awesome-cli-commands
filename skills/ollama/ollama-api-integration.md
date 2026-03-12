---
id: ollama-api-integration
stackId: ollama
type: skill
name: Ollama REST API Integration
description: >-
  Integrate Ollama's REST API into your applications — chat completions,
  streaming responses, embeddings, and model management endpoints for building
  local AI-powered features.
difficulty: intermediate
tags:
  - api
  - rest-api
  - integration
  - streaming
  - embeddings
  - localhost
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
prerequisites:
  - Ollama installed and running
  - At least one model pulled
faq:
  - question: What is the Ollama REST API?
    answer: >-
      Ollama runs a REST API on localhost:11434 that provides chat completions,
      text generation, embeddings, and model management. It's compatible with
      the OpenAI API format, making it a drop-in replacement for cloud APIs in
      local development.
  - question: How do I stream responses from Ollama?
    answer: >-
      Set 'stream': true in your request body. The response will be a stream of
      JSON objects, each containing a chunk of the generated text in
      message.content. Read the stream with a reader and decode each chunk as it
      arrives.
  - question: Can I use Ollama as a drop-in replacement for OpenAI?
    answer: >-
      Yes. Ollama supports the OpenAI-compatible API at
      http://localhost:11434/v1/. Most libraries that work with OpenAI
      (openai-python, langchain, etc.) can point to Ollama by changing the base
      URL and using any string as the API key.
relatedItems:
  - ollama-model-management
  - ollama-embedding-setup
  - ollama-gpu-optimization
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Ollama REST API Integration

## Overview
Ollama exposes a REST API on localhost:11434 that lets you integrate local LLM inference into any application. Use it for chat completions, text generation, embeddings, and model management — all running privately on your hardware.

## Why This Matters
- **Privacy** — data never leaves your machine
- **Zero cost** — no API keys or usage fees after hardware investment
- **Low latency** — no network round-trip for inference
- **Customization** — full control over model parameters per request

## How It Works

### Step 1: Basic Chat Completion
```bash
# Simple chat request
curl http://localhost:11434/api/chat -d '{
  "model": "qwen2.5-coder:7b",
  "messages": [
    {"role": "system", "content": "You are a TypeScript expert."},
    {"role": "user", "content": "Write a debounce function with generics"}
  ],
  "stream": false
}'
```

### Step 2: Streaming Response
```typescript
// TypeScript streaming example
async function streamChat(prompt: string) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: 'qwen2.5-coder:7b',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const json = JSON.parse(chunk);
    process.stdout.write(json.message?.content || '');
  }
}
```

### Step 3: Generate Embeddings
```bash
# Generate embeddings for RAG or semantic search
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": ["function debounce<T>(fn: T, delay: number)", "React useCallback hook"]
}'
```

### Step 4: Model Management API
```bash
# List models
curl http://localhost:11434/api/tags

# Pull a model
curl http://localhost:11434/api/pull -d '{"name": "llama3.1:8b"}'

# Show model info
curl http://localhost:11434/api/show -d '{"name": "qwen2.5-coder:7b"}'

# Check if server is running
curl http://localhost:11434/api/version
```

## API Parameters
```json
{
  "model": "qwen2.5-coder:7b",
  "messages": [...],
  "stream": true,
  "options": {
    "temperature": 0.2,
    "top_p": 0.9,
    "num_ctx": 8192,
    "num_predict": 2048,
    "stop": ["\n\n\n"]
  }
}
```

## Best Practices
- Always check server health before sending requests (GET /api/version)
- Use streaming for interactive UIs — reduces perceived latency
- Set appropriate timeouts (30s+ for large model responses)
- Use the options object to override Modelfile defaults per request
- Implement retry logic for model loading (first request after cold start is slow)

## Common Mistakes
- Not handling model loading time (first request takes 10-30s to load model)
- Setting stream:false for interactive applications (slow perceived response)
- Missing error handling for server not running
- Not setting num_ctx large enough for code tasks
- Forgetting to URL-encode model names with special characters
