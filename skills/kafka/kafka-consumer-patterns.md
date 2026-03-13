---
id: kafka-consumer-patterns
stackId: kafka
type: skill
name: Kafka Consumer Group Patterns
description: >-
  Implement reliable Kafka consumer patterns — consumer group setup, offset
  management, error handling, dead letter queues, and graceful shutdown for
  production workloads.
difficulty: beginner
tags:
  - kafka
  - consumer
  - group
  - patterns
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Kafka Consumer Group Patterns skill?"
    answer: >-
      Implement reliable Kafka consumer patterns — consumer group setup,
      offset management, error handling, dead letter queues, and graceful
      shutdown for production workloads. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Kafka Consumer Group Patterns require?"
    answer: >-
      Works with standard kafka tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Kafka Consumer Group Patterns

## Overview
Kafka consumer groups enable parallel message processing across multiple instances. Each partition is assigned to exactly one consumer in the group, providing automatic load balancing and fault tolerance. Getting consumer configuration right is critical for reliable message processing.

## Why This Matters
- Incorrect offset management leads to message loss or duplicate processing
- Bad polling configuration causes unnecessary rebalancing
- Missing error handling means one bad message blocks all processing

## Consumer Patterns

### Step 1: Basic Consumer Group Setup
```typescript
import { Kafka, logLevel } from "kafkajs";

const kafka = new Kafka({
  clientId: "order-processor",
  brokers: ["kafka1:9092", "kafka2:9092", "kafka3:9092"],
  logLevel: logLevel.WARN,
});

const consumer = kafka.consumer({
  groupId: "order-processing-group",
  sessionTimeout: 30000,        // 30s — detect dead consumers
  heartbeatInterval: 3000,      // 3s — must be < sessionTimeout/3
  maxWaitTimeInMs: 5000,        // Max wait for new messages
  rebalanceTimeout: 60000,      // Time allowed for rebalance
});

await consumer.connect();
await consumer.subscribe({ topics: ["orders.created"], fromBeginning: false });

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const order = JSON.parse(message.value.toString());
    console.log(`Processing order ${order.id} from partition ${partition}`);
    await processOrder(order);
  },
});
```

### Step 2: Manual Offset Management
```typescript
await consumer.run({
  autoCommit: false,  // Take control of offset commits
  eachMessage: async ({ topic, partition, message }) => {
    try {
      const order = JSON.parse(message.value.toString());
      await processOrder(order);

      // Commit only after successful processing
      await consumer.commitOffsets([{
        topic,
        partition,
        offset: (BigInt(message.offset) + 1n).toString(),
      }]);
    } catch (error) {
      // Don't commit — message will be reprocessed on next poll
      console.error("Processing failed:", error);
      await sendToDeadLetterQueue(topic, message, error);
    }
  },
});
```

### Step 3: Batch Processing for Throughput
```typescript
await consumer.run({
  autoCommit: false,
  eachBatch: async ({ batch, resolveOffset, commitOffsetsIfNecessary }) => {
    const messages = batch.messages;
    console.log(`Batch: ${messages.length} messages from partition ${batch.partition}`);

    for (const message of messages) {
      try {
        const data = JSON.parse(message.value.toString());
        await processMessage(data);
        resolveOffset(message.offset);
      } catch (error) {
        await sendToDeadLetterQueue(batch.topic, message, error);
        resolveOffset(message.offset);  // Skip past bad message
      }
    }

    await commitOffsetsIfNecessary();
  },
});
```

### Step 4: Dead Letter Queue Pattern
```typescript
const producer = kafka.producer();
await producer.connect();

async function sendToDeadLetterQueue(
  originalTopic: string,
  message: any,
  error: Error
) {
  await producer.send({
    topic: `${originalTopic}.dlq`,
    messages: [{
      key: message.key,
      value: message.value,
      headers: {
        "original-topic": originalTopic,
        "error-message": error.message,
        "failed-at": new Date().toISOString(),
        "retry-count": "0",
      },
    }],
  });
}
```

### Step 5: Graceful Shutdown
```typescript
const shutdown = async () => {
  console.log("Shutting down consumer...");
  await consumer.disconnect();
  await producer.disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

## Best Practices
- Use manual offset commits for at-least-once delivery guarantees
- Implement Dead Letter Queues for messages that fail processing
- Design consumers to be idempotent (handle duplicate messages)
- Use eachBatch for high-throughput workloads
- Always handle graceful shutdown (disconnect consumer to trigger clean rebalance)
- Set max.poll.interval.ms higher than your longest processing time

## Common Mistakes
- Auto-committing offsets before processing completes (message loss)
- Not handling deserialization errors (one bad message blocks partition)
- Synchronous processing with small session timeout (rebalancing storms)
- Not implementing a DLQ (poison messages block the entire consumer)
- Forgetting graceful shutdown (causes unnecessary rebalancing)
