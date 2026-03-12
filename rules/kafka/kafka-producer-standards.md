---
id: kafka-producer-standards
stackId: kafka
type: rule
name: Kafka Producer Configuration Standards
description: >-
  Enforce reliable Kafka producer settings — acks=all for durability, idempotent
  producers, proper serialization, partition key selection, and error handling
  best practices.
difficulty: intermediate
globs:
  - '**/*.ts'
  - '**/*.java'
  - '**/*.py'
tags:
  - producer
  - acks
  - idempotent
  - durability
  - configuration
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
  - question: Why should Kafka producers use acks=all?
    answer: >-
      acks=all means the leader broker waits for all in-sync replicas to
      acknowledge the message before confirming the write. This provides the
      strongest durability guarantee — if the leader crashes, any ISR replica
      has the message. Without it, messages can be lost. The latency overhead is
      minimal (1-5ms) for the durability gained.
  - question: What is an idempotent Kafka producer?
    answer: >-
      An idempotent producer assigns sequence numbers to messages, allowing the
      broker to detect and discard duplicates caused by network retries. Without
      idempotence, a retry after a timeout can produce the same message twice.
      Enable it with idempotent: true (KafkaJS) or enable.idempotence=true
      (Java). It has negligible performance overhead.
relatedItems:
  - kafka-topic-naming
  - kafka-consumer-patterns
  - kafka-event-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Kafka Producer Configuration Standards

## Rule
All production Kafka producers MUST use acks=all, enable idempotence, set proper serialization, and include meaningful partition keys.

## Format
Every producer configuration must include durability, reliability, and monitoring settings.

## Requirements

### 1. Durability Settings
```typescript
const producer = kafka.producer({
  // Idempotent producer prevents duplicates on retry
  idempotent: true,

  // Retry configuration
  retry: {
    retries: 5,
    initialRetryTime: 100,
    maxRetryTime: 30000,
  },
});

// When sending messages
await producer.send({
  topic: "orders.order.created",
  acks: -1,  // -1 = all ISR replicas must acknowledge (same as "all")
  messages: [{ key: orderId, value: JSON.stringify(order) }],
});
```

### 2. Always Use Partition Keys
```typescript
// GOOD: Partition by entity ID — ensures ordering per entity
await producer.send({
  topic: "orders.order.created",
  messages: [{
    key: order.id,        // All events for this order go to same partition
    value: JSON.stringify(order),
  }],
});

// BAD: No key — random partition, no ordering guarantee
await producer.send({
  topic: "orders.order.created",
  messages: [{
    value: JSON.stringify(order),  // No key — random distribution
  }],
});
```

### 3. Message Headers for Metadata
```typescript
await producer.send({
  topic: "orders.order.created",
  messages: [{
    key: order.id,
    value: JSON.stringify(order),
    headers: {
      "content-type": "application/json",
      "correlation-id": requestId,
      "source-service": "order-api",
      "schema-version": "2",
      "produced-at": new Date().toISOString(),
    },
  }],
});
```

### 4. Error Handling
```typescript
try {
  const metadata = await producer.send({
    topic: "orders.order.created",
    messages: [{ key: orderId, value: JSON.stringify(order) }],
  });
  console.log("Produced to:", metadata);
} catch (error) {
  if (error.name === "KafkaJSNumberOfRetriesExceeded") {
    // All retries exhausted — alert and store for later retry
    await storeFailedMessage("orders.order.created", order);
    alertOps("Kafka producer failed after retries", error);
  }
  throw error;
}
```

## Anti-Patterns
```typescript
// BAD: acks=0 — fire and forget, data loss risk
acks: 0

// BAD: No error handling
await producer.send({ topic, messages });  // Uncaught errors

// BAD: Large messages (> 1MB)
// Store in S3/GCS, put reference in Kafka message instead

// BAD: Producing without flush on shutdown
process.exit(0);  // Messages in buffer are lost

// GOOD: Flush before shutdown
await producer.disconnect();  // Flushes pending messages
```

## Enforcement
Use shared producer factory functions that enforce these settings. Add monitoring for producer errors, latency percentiles, and record send rate.
