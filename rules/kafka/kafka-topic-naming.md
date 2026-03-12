---
id: kafka-topic-naming
stackId: kafka
type: rule
name: Kafka Topic Naming Conventions
description: >-
  Enforce consistent Kafka topic naming with dot-separated namespaces,
  event-type suffixes, environment prefixes, and Dead Letter Queue conventions
  for organized topic management.
difficulty: beginner
globs:
  - '**/*.yml'
  - '**/*.yaml'
  - '**/*.ts'
  - '**/*.java'
tags:
  - topic-naming
  - conventions
  - namespaces
  - dead-letter-queue
  - standards
  - kafka
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
faq:
  - question: What is the best naming convention for Kafka topics?
    answer: >-
      Use dot-separated hierarchical names: {domain}.{entity}.{event-type}. For
      example, orders.order.created, payments.payment.processed. This convention
      enables pattern-based ACLs, monitoring, and subscription. Include .dlq
      suffix for dead letter queues and .retry for retry topics.
  - question: 'Should Kafka topic names use dots, hyphens, or underscores?'
    answer: >-
      Use dots as separators. Dots create a natural hierarchy matching Java
      package conventions and enable wildcard subscriptions. Kafka internally
      converts dots to underscores in metric names, so avoid mixing dots and
      underscores in the same topic name to prevent metric collisions.
relatedItems:
  - kafka-event-architect
  - kafka-producer-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Kafka Topic Naming Conventions

## Rule
All Kafka topics MUST follow a dot-separated naming pattern with consistent casing and meaningful hierarchy.

## Format
```
{domain}.{entity}.{event-type}
{domain}.{entity}.{event-type}.dlq
{domain}.{entity}.{event-type}.retry
```

## Requirements

### 1. Topic Naming Pattern
```bash
# GOOD: Clear hierarchy
orders.order.created
orders.order.paid
orders.order.shipped
payments.payment.processed
payments.payment.failed
inventory.stock.updated
notifications.email.sent

# BAD: Inconsistent patterns
orderCreated           # No hierarchy
ORDERS_CREATED         # Uppercase, underscores
order-service-events   # Hyphens, not dot-separated
events                 # Too vague
```

### 2. Dead Letter Queue Topics
```bash
# DLQ follows the original topic name with .dlq suffix
orders.order.created.dlq
payments.payment.processed.dlq

# Retry topics with attempt count
orders.order.created.retry.1
orders.order.created.retry.2
orders.order.created.retry.3
```

### 3. Internal/System Topics
```bash
# Kafka Connect
connect.configs
connect.offsets
connect.status

# Schema Registry
_schemas

# Application internal
_internal.{service}.{purpose}
```

### 4. Environment Separation
```bash
# Option A: Separate clusters per environment (RECOMMENDED)
# Same topic names, different clusters

# Option B: Prefix with environment (only if sharing clusters)
dev.orders.order.created
staging.orders.order.created
prod.orders.order.created
```

## Examples

### Good
```bash
# E-commerce event topics
commerce.order.created
commerce.order.updated
commerce.order.cancelled
commerce.payment.authorized
commerce.payment.captured
commerce.shipment.dispatched
commerce.shipment.delivered
```

### Bad
```bash
order_events          # Vague, underscores
OrderService          # PascalCase, no event type
my-topic-1            # Meaningless name
test                  # No namespace
```

## Enforcement
Disable auto.create.topics.enable and manage topics through infrastructure as code (Terraform, Ansible). Review topic names in PR process.
