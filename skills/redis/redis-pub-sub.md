---
id: redis-pub-sub
stackId: redis
type: skill
name: Redis Pub/Sub & Streams Messaging
description: >-
  Implement real-time messaging with Redis Pub/Sub and Streams — channel
  subscriptions, pattern matching, consumer groups, message acknowledgment, and
  dead letter handling.
difficulty: intermediate
tags:
  - pub-sub
  - streams
  - messaging
  - consumer-groups
  - real-time
  - events
  - redis
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - typescript
  - python
prerequisites:
  - Redis 7.0+
  - Basic Redis operations
faq:
  - question: What is the difference between Redis Pub/Sub and Streams?
    answer: >-
      Pub/Sub is fire-and-forget: messages are delivered only to currently
      connected subscribers and lost if no one is listening. Streams persist
      messages, support consumer groups with load balancing, message
      acknowledgment, and replay from any point in history. Use Pub/Sub for live
      notifications; use Streams for reliable processing.
  - question: How do Redis Streams consumer groups work?
    answer: >-
      Consumer groups distribute stream messages among multiple consumers — each
      message is delivered to exactly one consumer in the group (load
      balancing). Consumers must acknowledge (XACK) processed messages.
      Unacknowledged messages can be claimed by other consumers if the original
      consumer fails. This is similar to Kafka consumer groups.
relatedItems:
  - redis-data-structures
  - redis-caching-architect
  - kafka-consumer-groups
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Redis Pub/Sub & Streams Messaging

## Overview
Redis offers two messaging models: Pub/Sub for fire-and-forget real-time messaging, and Streams for persistent event logs with consumer groups. Choose Pub/Sub for live updates (chat, notifications) and Streams for reliable message processing (order processing, event sourcing).

## Why This Matters
- Pub/Sub delivers messages in ~0.1ms (same datacenter)
- Streams provide Kafka-like consumer groups without Kafka's complexity
- Both avoid polling, reducing load on your primary database

## Pub/Sub Implementation

### Step 1: Basic Pub/Sub
```typescript
import Redis from "ioredis";

// Publisher
const pub = new Redis();
await pub.publish("notifications:user:123", JSON.stringify({
  type: "message",
  from: "user:456",
  body: "Hello!"
}));

// Subscriber (separate connection — required for Pub/Sub)
const sub = new Redis();
sub.subscribe("notifications:user:123");
sub.on("message", (channel, message) => {
  const data = JSON.parse(message);
  console.log(`[${channel}] ${data.type}: ${data.body}`);
});

// Pattern subscription (wildcard)
sub.psubscribe("notifications:user:*");
sub.on("pmessage", (pattern, channel, message) => {
  console.log(`[pattern: ${pattern}] [channel: ${channel}] ${message}`);
});
```

## Streams Implementation

### Step 2: Append Events to a Stream
```typescript
const redis = new Redis();

// Add events (auto-generated ID with *)
await redis.xadd("orders:events", "*",
  "action", "created",
  "orderId", "order-789",
  "amount", "49.99",
  "userId", "user-123"
);
```

### Step 3: Create Consumer Group
```typescript
// Create consumer group starting from latest messages
try {
  await redis.xgroup("CREATE", "orders:events", "order-processors", "$", "MKSTREAM");
} catch (e) {
  // Group already exists — ignore
}
```

### Step 4: Read and Process Messages
```typescript
async function processMessages(consumerId: string) {
  while (true) {
    // Read up to 10 new messages, block for 5 seconds if none
    const messages = await redis.xreadgroup(
      "GROUP", "order-processors", consumerId,
      "COUNT", "10",
      "BLOCK", "5000",
      "STREAMS", "orders:events", ">"
    );

    if (!messages) continue;

    for (const [stream, entries] of messages) {
      for (const [id, fields] of entries) {
        const data = Object.fromEntries(
          fields.reduce((acc, val, i) =>
            i % 2 === 0 ? [...acc, [val, fields[i + 1]]] : acc, [])
        );

        // Process the message
        await handleOrderEvent(data);

        // Acknowledge — message won't be redelivered
        await redis.xack("orders:events", "order-processors", id);
      }
    }
  }
}
```

### Step 5: Handle Failed Messages
```bash
# Check pending messages (not yet acknowledged)
XPENDING orders:events order-processors - + 10

# Claim messages from a dead consumer (idle > 60 seconds)
XAUTOCLAIM orders:events order-processors worker-2 60000 0-0 COUNT 10

# Delete processed messages to save memory (trim stream)
XTRIM orders:events MAXLEN ~ 10000
```

## Best Practices
- Use Pub/Sub for ephemeral real-time notifications (OK to lose messages)
- Use Streams for reliable message processing (must not lose messages)
- Always XACK after processing to prevent redelivery
- Use XAUTOCLAIM to handle dead consumers (reassign their pending messages)
- Trim streams with XTRIM MAXLEN ~ N to bound memory usage
- Use separate Redis connections for Pub/Sub subscribers

## Common Mistakes
- Using Pub/Sub when message delivery must be guaranteed (use Streams)
- Not acknowledging Stream messages (they stay in pending list forever)
- Using the same Redis connection for Pub/Sub and regular commands
- Not trimming Streams (unbounded memory growth)
- Blocking the subscriber callback with slow processing
