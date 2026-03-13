---
id: azure-azure-functions-skill
stackId: azure
type: skill
name: Azure Functions Development
description: >-
  Expert patterns for Azure Functions development including isolated worker
  model, Durable Functions orchestration, cold start optimization, and
  production patterns.
difficulty: beginner
tags:
  - azure
  - functions
  - development
compatibility:
  - claude-code
faq:
  - question: "When should I use the Azure Functions Development skill?"
    answer: >-
      Expert patterns for Azure Functions development including isolated
      worker model, Durable Functions orchestration, cold start optimization,
      and production patterns. This skill provides a structured workflow for
      resource management, serverless functions, AKS configuration, and
      infrastructure automation.
  - question: "What tools and setup does Azure Functions Development require?"
    answer: >-
      Works with standard Azure tooling (Azure CLI, Bicep). Review the setup
      section in the skill content for specific configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Azure Functions

## Patterns

### Isolated Worker Model (.NET)

Modern .NET execution model with process isolation

### Node.js v4 Programming Model

Modern code-centric approach for TypeScript/JavaScript

### Python v2 Programming Model

Decorator-based approach for Python functions

## Anti-Patterns

### ❌ Blocking Async Calls

### ❌ New HttpClient Per Request

### ❌ In-Process Model for New Projects

## ⚠️ Sharp Edges

| Issue | Severity | Solution |
|-------|----------|----------|
| Issue | high | ## Use async pattern with Durable Functions |
| Issue | high | ## Use IHttpClientFactory (Recommended) |
| Issue | high | ## Always use async/await |
| Issue | medium | ## Configure maximum timeout (Consumption) |
| Issue | high | ## Use isolated worker for new projects |
| Issue | medium | ## Configure Application Insights properly |
| Issue | medium | ## Check extension bundle (most common) |
| Issue | medium | ## Add warmup trigger to initialize your code |

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
