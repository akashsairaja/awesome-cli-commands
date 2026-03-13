---
id: docker-microservices-patterns
stackId: docker
type: skill
name: Microservices Patterns
description: >-
  Design microservices architectures with service boundaries, event-driven
  communication, and resilience patterns.
difficulty: beginner
tags:
  - docker
  - microservices
  - patterns
  - deployment
  - migration
  - architecture
compatibility:
  - claude-code
faq:
  - question: "When should I use the Microservices Patterns skill?"
    answer: >-
      Design microservices architectures with service boundaries, event-driven
      communication, and resilience patterns. It includes practical examples
      for container development.
  - question: "What tools and setup does Microservices Patterns require?"
    answer: >-
      Works with standard Docker tooling (Docker CLI, Docker Compose). No
      special setup required beyond a working container environment.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# Microservices Patterns

Master microservices architecture patterns including service boundaries, inter-service communication, data management, and resilience patterns for building distributed systems.

## Use this skill when

- Decomposing monoliths into microservices
- Designing service boundaries and contracts
- Implementing inter-service communication
- Managing distributed data and transactions
- Building resilient distributed systems
- Implementing service discovery and load balancing
- Designing event-driven architectures

## Do not use this skill when

- The system is small enough for a modular monolith
- You need a quick prototype without distributed complexity
- There is no operational support for distributed systems

## Instructions

1. Identify domain boundaries and ownership for each service.
2. Define contracts, data ownership, and communication patterns.
3. Plan resilience, observability, and deployment strategy.
4. Provide migration steps and operational guardrails.

## Resources

- `resources/implementation-playbook.md` for detailed patterns and examples.
