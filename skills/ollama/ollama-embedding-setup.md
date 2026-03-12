---
id: ollama-embedding-setup
stackId: ollama
type: skill
name: Local Embeddings & Semantic Search
description: >-
  Set up local embedding models with Ollama for semantic code search, RAG
  pipelines, and documentation indexing — all running privately without cloud
  API dependencies.
difficulty: advanced
tags:
  - embeddings
  - semantic-search
  - rag
  - vector-search
  - code-search
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
prerequisites:
  - Ollama installed
  - Embedding model pulled (nomic-embed-text)
  - Node.js or Python for search implementation
faq:
  - question: What embedding models does Ollama support?
    answer: >-
      Ollama supports several embedding models: nomic-embed-text (137M params,
      best balance), mxbai-embed-large (335M params, higher quality), and
      all-minilm (23M params, fastest). Use 'ollama pull <model>' to download
      them.
  - question: How do local embeddings compare to OpenAI embeddings?
    answer: >-
      Local embeddings from nomic-embed-text and mxbai-embed-large are
      competitive with OpenAI's text-embedding-3-small for code search tasks.
      The main advantages are privacy (data stays local), zero cost, and no rate
      limits. Quality is slightly lower than OpenAI's largest models.
  - question: Can I use Ollama embeddings for code search?
    answer: >-
      Yes. Generate embeddings for code chunks (functions, classes), store them
      in a vector database or in-memory array, then compute cosine similarity
      with the query embedding to find relevant code. This enables natural
      language code search across your codebase.
relatedItems:
  - ollama-api-integration
  - ollama-model-management
  - aitools-rag-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Local Embeddings & Semantic Search

## Overview
Ollama can run embedding models locally, enabling private semantic search across your codebase, RAG pipelines for documentation, and similarity-based code recommendations without sending data to external APIs.

## Why This Matters
- **Privacy** — code embeddings stay on your machine
- **Speed** — no network latency for embedding generation
- **Cost** — unlimited embeddings after initial model download
- **Offline** — works without internet connection

## How It Works

### Step 1: Pull an Embedding Model
```bash
# Recommended embedding models
ollama pull nomic-embed-text        # 137M params, good quality/speed balance
ollama pull mxbai-embed-large       # 335M params, higher quality
ollama pull all-minilm              # 23M params, fastest
```

### Step 2: Generate Embeddings
```bash
# Single text embedding
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "async function fetchUser(id: string): Promise<User>"
}'

# Batch embeddings
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": [
    "function to fetch user by ID",
    "React component for user profile",
    "database migration for users table"
  ]
}'
```

### Step 3: Build a Semantic Search Index
```typescript
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface CodeChunk {
  filePath: string;
  content: string;
  embedding: number[];
}

async function embedText(text: string): Promise<number[]> {
  const response = await fetch('http://localhost:11434/api/embed', {
    method: 'POST',
    body: JSON.stringify({ model: 'nomic-embed-text', input: text }),
  });
  const data = await response.json();
  return data.embeddings[0];
}

async function indexCodebase(dir: string): Promise<CodeChunk[]> {
  const files = await readdir(dir, { recursive: true });
  const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
  const chunks: CodeChunk[] = [];

  for (const file of tsFiles) {
    const content = await readFile(join(dir, file), 'utf-8');
    const embedding = await embedText(content.slice(0, 2000));
    chunks.push({ filePath: file, content, embedding });
  }

  return chunks;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function semanticSearch(query: string, index: CodeChunk[], topK = 5) {
  const queryEmbedding = await embedText(query);
  return index
    .map(chunk => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
```

### Step 4: Use in RAG Pipeline
```typescript
async function ragQuery(question: string, index: CodeChunk[]) {
  // 1. Find relevant code chunks
  const relevant = await semanticSearch(question, index, 3);
  const context = relevant.map(r => r.content).join('\n---\n');

  // 2. Send to Ollama with context
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      model: 'qwen2.5-coder:7b',
      messages: [
        { role: 'system', content: `Answer based on this codebase context:\n${context}` },
        { role: 'user', content: question },
      ],
      stream: false,
    }),
  });

  return (await response.json()).message.content;
}
```

## Best Practices
- Use nomic-embed-text for the best quality/speed balance
- Chunk code by function/class boundaries, not arbitrary line counts
- Re-index when codebase changes significantly
- Cache embeddings to avoid re-computing for unchanged files
- Normalize embeddings before computing cosine similarity

## Common Mistakes
- Embedding entire files (too long, poor quality) — chunk first
- Not chunking by logical boundaries (functions, classes)
- Recomputing embeddings on every query (slow, cache them)
- Using a chat model for embeddings (wrong model type)
