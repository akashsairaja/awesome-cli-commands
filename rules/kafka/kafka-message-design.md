---
id: kafka-message-design
stackId: kafka
type: rule
name: Kafka Message Design Standards
description: >-
  Define standards for Kafka message structure — event envelope format, required
  metadata fields, payload size limits, schema versioning, and
  backward-compatible evolution rules.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.java'
  - '**/*.py'
  - '**/avro/**'
  - '**/proto/**'
tags:
  - message-design
  - event-envelope
  - schema-evolution
  - backward-compatible
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
languages:
  - typescript
  - java
faq:
  - question: What should a Kafka message contain?
    answer: >-
      Every Kafka message should follow an event envelope: eventId (UUID for
      deduplication), eventType (what happened), version (schema version),
      timestamp (ISO-8601), source (producing service), correlationId (trace
      ID), and data (typed payload). This enables tracing, deduplication, and
      schema evolution across all services.
  - question: How do I evolve Kafka message schemas without breaking consumers?
    answer: >-
      Three rules: (1) Only add new fields as optional with defaults. (2) Never
      remove, rename, or change the type of existing fields. (3) Use a version
      field to let consumers handle different versions. With Schema Registry,
      enforce BACKWARD compatibility mode to catch breaking changes before
      deployment.
relatedItems:
  - kafka-topic-naming
  - kafka-schema-registry
  - kafka-producer-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Kafka Message Design Standards

## Rule
All Kafka messages MUST follow a consistent envelope format with metadata headers, typed events, and size limits.

## Format
```json
{
  "eventId": "uuid",
  "eventType": "order.created",
  "version": "2",
  "timestamp": "ISO-8601",
  "source": "service-name",
  "correlationId": "uuid",
  "data": { /* event payload */ }
}
```

## Requirements

### 1. Event Envelope Structure
```typescript
interface KafkaEvent<T> {
  eventId: string;          // Unique ID (UUID v4) for deduplication
  eventType: string;        // Dot-notation type: "order.created"
  version: string;          // Schema version: "1", "2"
  timestamp: string;        // ISO-8601 with timezone
  source: string;           // Producing service name
  correlationId: string;    // Request trace ID
  data: T;                  // Typed payload
}

// Example
const event: KafkaEvent<OrderCreated> = {
  eventId: "550e8400-e29b-41d4-a716-446655440000",
  eventType: "order.created",
  version: "2",
  timestamp: "2025-03-01T12:00:00.000Z",
  source: "order-service",
  correlationId: "req-abc-123",
  data: {
    orderId: "order-789",
    customerId: "cust-456",
    items: [{ productId: "prod-123", quantity: 2, price: 29.99 }],
    total: 59.98,
  },
};
```

### 2. Message Size Limits
```bash
# Maximum message size: 1MB (default Kafka limit)
# Recommended payload size: < 100KB

# For large data: store in object storage, reference in message
{
  "eventType": "report.generated",
  "data": {
    "reportId": "rpt-123",
    "storageUrl": "s3://reports/rpt-123.pdf",
    "sizeBytes": 15000000
  }
}
```

### 3. Backward-Compatible Evolution
```typescript
// Version 1
interface OrderCreatedV1 {
  orderId: string;
  amount: number;
}

// Version 2: Add optional fields only
interface OrderCreatedV2 {
  orderId: string;
  amount: number;
  currency?: string;      // NEW: optional field with default
  metadata?: Record<string, string>;  // NEW: optional
}

// NEVER: Remove fields, rename fields, or change types
```

### 4. Key Selection
```bash
# Use entity ID as key for ordering per entity
Key: order-789    → All order-789 events go to same partition (ordered)

# Use aggregate root ID for related events
Key: customer-456 → All customer-456 events ordered together
```

## Anti-Patterns
- Events without eventId (cannot deduplicate)
- Events without timestamp (cannot determine ordering across topics)
- Embedding large binary data in messages (use object storage references)
- Removing required fields between versions (breaks consumers)
- Using incrementing integers as eventId (not globally unique)

## Enforcement
Use Schema Registry to enforce message structure. Add CI validation that checks message schemas are backward compatible before deployment.
