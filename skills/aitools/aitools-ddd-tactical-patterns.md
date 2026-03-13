---
id: aitools-ddd-tactical-patterns
stackId: aitools
type: skill
name: DDD Tactical Patterns
description: >-
  Apply DDD tactical patterns in code using entities, value objects,
  aggregates, repositories, and domain events with explicit invariants.
difficulty: beginner
tags:
  - aitools
  - ddd
  - tactical
  - patterns
  - testing
  - deployment
  - architecture
  - api
compatibility:
  - claude-code
faq:
  - question: "When should I use the DDD Tactical Patterns skill?"
    answer: >-
      Apply DDD tactical patterns in code using entities, value objects,
      aggregates, repositories, and domain events with explicit invariants. It
      includes practical examples for AI/ML development development.
  - question: "What tools and setup does DDD Tactical Patterns require?"
    answer: >-
      Works with standard AI & ML Tools tooling (LLM APIs, embedding models).
      No special setup required beyond a working AI/ML development
      environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# DDD Tactical Patterns

## Use this skill when

- Translating domain rules into code structures.
- Designing aggregate boundaries and invariants.
- Refactoring an anemic model into behavior-rich domain objects.
- Defining repository contracts and domain event boundaries.

## Do not use this skill when

- You are still defining strategic boundaries.
- The task is only API documentation or UI layout.
- Full DDD complexity is not justified.

## Instructions

1. Identify invariants first and design aggregates around them.
2. Model immutable value objects for validated concepts.
3. Keep domain behavior in domain objects, not controllers.
4. Emit domain events for meaningful state transitions.
5. Keep repositories at aggregate root boundaries.

If detailed checklists are needed, open `references/tactical-checklist.md`.

## Example

```typescript
class Order {
  private status: "draft" | "submitted" = "draft";

  submit(itemsCount: number): void {
    if (itemsCount === 0) throw new Error("Order cannot be submitted empty");
    if (this.status !== "draft") throw new Error("Order already submitted");
    this.status = "submitted";
  }
}
```

## Limitations

- This skill does not define deployment architecture.
- It does not choose databases or transport protocols.
- It should be paired with testing patterns for invariant coverage.
