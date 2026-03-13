---
id: clitools-architecture
stackId: clitools
type: skill
name: Architecture
description: >-
  "Requirements drive architecture. Trade-offs inform decisions.
difficulty: beginner
tags:
  - clitools
  - architecture
  - deployment
  - api
  - design-patterns
compatibility:
  - claude-code
faq:
  - question: "When should I use the Architecture skill?"
    answer: >-
      "Requirements drive architecture. Trade-offs inform decisions. This
      skill provides a structured workflow for API design, documentation,
      architecture patterns, and development workflows.
  - question: "What tools and setup does Architecture require?"
    answer: >-
      Works with standard CLI & Dev Tools tooling (various CLI tools, code
      generators). No special setup required beyond a working developer
      tooling environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Architecture Decision Framework

> "Requirements drive architecture. Trade-offs inform decisions. ADRs capture rationale."

## 🎯 Selective Reading Rule

**Read ONLY files relevant to the request!** Check the content map, find what you need.

| File | Description | When to Read |
|------|-------------|--------------|
| `context-discovery.md` | Questions to ask, project classification | Starting architecture design |
| `trade-off-analysis.md` | ADR templates, trade-off framework | Documenting decisions |
| `pattern-selection.md` | Decision trees, anti-patterns | Choosing patterns |
| `examples.md` | MVP, SaaS, Enterprise examples | Reference implementations |
| `patterns-reference.md` | Quick lookup for patterns | Pattern comparison |

---

## 🔗 Related Skills

| Skill | Use For |
|-------|---------|
| `@[skills/database-design]` | Database schema design |
| `@[skills/api-patterns]` | API design patterns |
| `@[skills/deployment-procedures]` | Deployment architecture |

---

## Core Principle

**"Simplicity is the ultimate sophistication."**

- Start simple
- Add complexity ONLY when proven necessary
- You can always add patterns later
- Removing complexity is MUCH harder than adding it

---

## Validation Checklist

Before finalizing architecture:

- [ ] Requirements clearly understood
- [ ] Constraints identified
- [ ] Each decision has trade-off analysis
- [ ] Simpler alternatives considered
- [ ] ADRs written for significant decisions
- [ ] Team expertise matches chosen patterns

## When to Use
This skill is applicable to execute the workflow or actions described in the overview.
