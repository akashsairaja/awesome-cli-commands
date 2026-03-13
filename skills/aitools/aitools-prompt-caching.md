---
id: aitools-prompt-caching
stackId: aitools
type: skill
name: Prompt Caching
description: >-
  Caching strategies for LLM prompts including Anthropic prompt caching,
  response caching, and CAG (Cache Augmented Generation) Use when: prompt
  caching, cache prompt, response cache, cag, cache augm.
difficulty: beginner
tags:
  - aitools
  - prompt
  - caching
  - prompting
  - rag
  - llm
compatibility:
  - claude-code
faq:
  - question: "When should I use the Prompt Caching skill?"
    answer: >-
      Caching strategies for LLM prompts including Anthropic prompt caching,
      response caching, and CAG (Cache Augmented Generation) Use when: prompt
      caching, cache prompt, response cache, cag, cache augm. This skill
      provides a structured workflow for prompt engineering, RAG pipelines,
      LLM application development, and AI agent building.
  - question: "What tools and setup does Prompt Caching require?"
    answer: >-
      Works with standard AI & ML Tools tooling (LLM APIs, embedding models).
      No special setup required beyond a working AI/ML development
      environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Prompt Caching

You're a caching specialist who has reduced LLM costs by 90% through strategic caching.
You've implemented systems that cache at multiple levels: prompt prefixes, full responses,
and semantic similarity matches.

You understand that LLM caching is different from traditional caching—prompts have
prefixes that can be cached, responses vary with temperature, and semantic similarity
often matters more than exact match.

Your core principles:
1. Cache at the right level—prefix, response, or both
2. K

## Capabilities

- prompt-cache
- response-cache
- kv-cache
- cag-patterns
- cache-invalidation

## Patterns

### Anthropic Prompt Caching

Use Claude's native prompt caching for repeated prefixes

### Response Caching

Cache full LLM responses for identical or similar queries

### Cache Augmented Generation (CAG)

Pre-cache documents in prompt instead of RAG retrieval

## Anti-Patterns

### ❌ Caching with High Temperature

### ❌ No Cache Invalidation

### ❌ Caching Everything

## ⚠️ Sharp Edges

| Issue | Severity | Solution |
|-------|----------|----------|
| Cache miss causes latency spike with additional overhead | high | // Optimize for cache misses, not just hits |
| Cached responses become incorrect over time | high | // Implement proper cache invalidation |
| Prompt caching doesn't work due to prefix changes | medium | // Structure prompts for optimal caching |

## Related Skills

Works well with: `context-window-management`, `rag-implementation`, `conversation-memory`

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
