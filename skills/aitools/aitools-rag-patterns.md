---
id: aitools-rag-patterns
stackId: aitools
type: skill
name: RAG Patterns for Code Documentation
description: >-
  Implement Retrieval-Augmented Generation patterns to give AI coding tools
  access to your documentation, API specs, and codebase knowledge for more
  accurate code generation.
difficulty: advanced
tags:
  - rag
  - retrieval-augmented-generation
  - documentation
  - embeddings
  - vector-search
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
prerequisites:
  - Understanding of embeddings and vector search
  - Documentation that needs to be indexed
  - Familiarity with AI coding tool configuration
faq:
  - question: What is RAG for coding tools?
    answer: >-
      RAG (Retrieval-Augmented Generation) dynamically retrieves relevant
      documentation, API specs, and code examples based on the current task and
      includes them in the AI's context. This gives coding tools access to your
      full documentation without exceeding context window limits.
  - question: How is RAG different from just including docs in the system prompt?
    answer: >-
      System prompts have fixed content and token limits. RAG dynamically
      retrieves only the documentation relevant to the current task. For a
      10,000-page API reference, RAG fetches the 5 most relevant sections rather
      than trying to include everything.
  - question: Which AI coding tools support RAG?
    answer: >-
      Cursor supports @docs for indexing documentation URLs. Claude Code
      supports RAG through MCP servers that provide file system and database
      access. Copilot uses repository-level indexing. Custom RAG pipelines can
      be built for any tool using embeddings and vector search.
relatedItems:
  - aitools-system-prompt-design
  - aitools-tool-use-patterns
  - aitools-context-manager
version: 1.0.0
lastUpdated: '2026-03-11'
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
