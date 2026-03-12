---
id: ollama-api-configuration-rules
stackId: ollama
type: rule
name: API Integration Rules
description: >-
  Standards for integrating Ollama's REST API into applications — health checks,
  error handling, timeout configuration, streaming patterns, and request
  parameter validation.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.js'
  - '**/*.py'
tags:
  - api
  - error-handling
  - health-check
  - timeouts
  - streaming
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - aider
faq:
  - question: Why must Ollama integrations include health checks?
    answer: >-
      Ollama runs as a local server that may not be started, may be restarting,
      or may be loading a model. Health checks (GET /api/version) detect these
      states before requests fail silently, enabling proper error messages like
      'Start Ollama with: ollama serve'.
  - question: What timeout should I use for Ollama requests?
    answer: >-
      Use 60 seconds for the first request (model loading can take 10-30s), 30
      seconds for subsequent requests, and 5 seconds for health checks. For
      streaming, set a 10-second timeout per chunk to detect stalled responses.
relatedItems:
  - ollama-modelfile-standards
  - ollama-resource-management-rules
  - ollama-api-integration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# API Integration Rules

## Rule
All Ollama API integrations MUST implement health checks, proper error handling, configurable timeouts, and streaming for interactive use cases.

## Health Check (Required)
```typescript
// ALWAYS check server health before first request
async function checkOllamaHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/version', {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

## Error Handling (Required)
```typescript
// Good — comprehensive error handling
async function ollamaChat(model: string, messages: Message[]) {
  const healthy = await checkOllamaHealth();
  if (!healthy) {
    throw new OllamaError('Ollama server not running. Start with: ollama serve');
  }

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      signal: AbortSignal.timeout(60000), // 60s for model loading
      body: JSON.stringify({ model, messages, stream: false }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new OllamaError(`Ollama error: ${error.error}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new OllamaError('Request timed out — model may be loading');
    }
    throw error;
  }
}

// Bad — no error handling
async function ollamaChatBad(prompt: string) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({ model: 'llama3.1', messages: [{ role: 'user', content: prompt }] }),
  });
  return res.json(); // No error handling, no timeout, no health check
}
```

## Timeout Configuration
| Operation | Recommended Timeout |
|-----------|-------------------|
| Health check | 5s |
| First request (model loading) | 60s |
| Subsequent requests | 30s |
| Streaming (per chunk) | 10s |
| Embedding generation | 15s |

## Streaming Rules
- ALWAYS use streaming (stream: true) for interactive UIs
- Parse each line as independent JSON
- Handle partial JSON chunks gracefully
- Implement a cancel mechanism for long-running generations

## Base URL Configuration
```typescript
// Good — configurable base URL
const OLLAMA_BASE_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Bad — hardcoded URL
const url = 'http://localhost:11434'; // Can't change without code edit
```

## Anti-Patterns
- No health check before requests (silent failures)
- No timeout (requests hang forever if server is down)
- Hardcoded localhost:11434 (can't use remote Ollama)
- Not handling model loading delay on first request
- Using stream: false for interactive applications
