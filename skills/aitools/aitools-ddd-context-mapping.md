---
id: aitools-ddd-context-mapping
stackId: aitools
type: skill
name: DDD Context Mapping
description: >-
  Map relationships between bounded contexts and define integration contracts
  using DDD context mapping patterns.
difficulty: beginner
tags:
  - aitools
  - ddd
  - context
  - mapping
  - migration
  - api
compatibility:
  - claude-code
faq:
  - question: "When should I use the DDD Context Mapping skill?"
    answer: >-
      Map relationships between bounded contexts and define integration
      contracts using DDD context mapping patterns. It includes practical
      examples for AI/ML development development.
  - question: "What tools and setup does DDD Context Mapping require?"
    answer: >-
      Works with standard AI & ML Tools tooling (LLM APIs, embedding models).
      No special setup required beyond a working AI/ML development
      environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# DDD Context Mapping

## Use this skill when

- Defining integration patterns between bounded contexts.
- Preventing domain leakage across service boundaries.
- Planning anti-corruption layers during migration.
- Clarifying upstream and downstream ownership for contracts.

## Do not use this skill when

- You have a single-context system with no integrations.
- You only need internal class design.
- You are selecting cloud infrastructure tooling.

## Instructions

1. List all context pairs and dependency direction.
2. Choose relationship patterns per pair.
3. Define translation rules and ownership boundaries.
4. Add failure modes, fallback behavior, and versioning policy.

If detailed mapping structures are needed, open `references/context-map-patterns.md`.

## Output requirements

- Relationship map for all context pairs
- Contract ownership matrix
- Translation and anti-corruption decisions
- Known coupling risks and mitigation plan

## Examples

```text
Use @ddd-context-mapping to define how Checkout integrates with Billing,
Inventory, and Fraud contexts, including ACL and contract ownership.
```

## Limitations

- This skill does not replace API-level schema design.
- It does not guarantee organizational alignment by itself.
- It should be revisited when team ownership changes.
