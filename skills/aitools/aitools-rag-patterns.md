---
id: aitools-rag-patterns
stackId: aitools
type: skill
name: RAG Patterns for Code Documentation
description: >-
  Implement Retrieval-Augmented Generation patterns to give AI coding tools
  access to your documentation, API specs, and codebase knowledge for more
  accurate code generation.
difficulty: intermediate
tags:
  - aitools
  - rag
  - patterns
  - code
  - documentation
  - testing
  - api
  - prompting
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the RAG Patterns for Code Documentation skill?"
    answer: >-
      Implement Retrieval-Augmented Generation patterns to give AI coding
      tools access to your documentation, API specs, and codebase knowledge
      for more accurate code generation. This skill provides a structured
      workflow for prompt engineering, RAG pipelines, LLM application
      development, and AI agent building.
  - question: "What tools and setup does RAG Patterns for Code Documentation require?"
    answer: >-
      Works with standard AI & ML Tools tooling (LLM APIs, embedding models).
      No special setup required beyond a working AI/ML development
      environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# RAG Patterns for Code Documentation

## Overview
RAG (Retrieval-Augmented Generation) enhances AI coding tools by dynamically retrieving relevant documentation, examples, and API specs based on the current task. Instead of cramming everything into the system prompt, RAG fetches only what's needed.

## Why This Matters
- **Accuracy** — AI generates code matching your actual API signatures
- **Freshness** — documentation updates are reflected immediately
- **Scale** — works with documentation too large for any context window
- **Relevance** — only task-related context is included

## How It Works

### Step 1: Index Your Documentation
```bash
# Using a documentation indexer
# Index API docs, README files, and code examples
npx @docs-indexer/cli index \
  --source ./docs \
  --source ./README.md \
  --source ./src/types \
  --output ./.docs-index
```

### Step 2: Chunk and Embed
```typescript
// Chunk documentation into retrieval-friendly segments
interface DocChunk {
  content: string;      // The text content
  source: string;       // File path
  section: string;      // Section heading
  embedding: number[];  // Vector embedding
}

// Chunk by section headings for API docs
// Chunk by function/class for code
// Chunk by paragraph for prose documentation
```

### Step 3: Retrieve on Query
```typescript
// When AI needs context, retrieve relevant chunks
async function getRelevantDocs(query: string, topK: number = 5) {
  const queryEmbedding = await embed(query);
  const results = await vectorDB.search(queryEmbedding, topK);
  return results.map(r => r.content).join('\n\n');
}
```

### Step 4: Augment the Prompt
```typescript
const context = await getRelevantDocs("create user API endpoint");
const prompt = `
Based on the following documentation:
---
${context}
---

Generate a new API endpoint for user creation following the documented patterns.
`;
```

## RAG for AI Coding Tools

### Cursor: @docs Integration
```
# Cursor supports @docs for RAG
# Index documentation URLs in Cursor settings
# Reference in chat: @docs how does the auth middleware work?
```

### Claude Code: MCP + RAG
```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./docs"]
    }
  }
}
```

## Best Practices
- Chunk by logical units (functions, API endpoints, sections) not arbitrary size
- Include code examples in your indexed documentation
- Re-index when documentation changes (add to CI pipeline)
- Test retrieval quality — relevant chunks should appear in top 5 results
- Combine RAG with system prompts for best results

## Common Mistakes
- Indexing too much (node_modules, generated files) — noise in results
- Chunks too large (> 1000 tokens) or too small (< 50 tokens)
- Not updating the index when docs change
- Relying only on RAG without system prompt constraints
- Not testing retrieval quality before deploying
