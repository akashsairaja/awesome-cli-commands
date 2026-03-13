---
id: nats-jetstream-basics
stackId: nats
type: skill
name: >-
  JetStream Streams & Consumers
description: >-
  Set up durable messaging with NATS JetStream — creating streams, configuring
  retention, durable consumers, acknowledgment patterns, and building reliable
  message processing pipelines.
difficulty: beginner
tags:
  - nats
  - jetstream
  - streams
  - consumers
  - monitoring
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the JetStream Streams & Consumers skill?"
    answer: >-
      Set up durable messaging with NATS JetStream — creating streams,
      configuring retention, durable consumers, acknowledgment patterns, and
      building reliable message processing pipelines. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does JetStream Streams & Consumers require?"
    answer: >-
      Works with standard nats tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-12"
---

# JetStream Streams & Consumers

## Overview
JetStream adds persistence to NATS. Messages are stored in streams and delivered via consumers with acknowledgment, replay, and retry semantics for reliable message processing.

## Why This Matters
- **Durability** — messages persist even when consumers are offline
- **Replay** — reprocess historical messages from any point in time
- **Acknowledgment** — guaranteed at-least-once delivery
- **Retention** — configurable message lifecycle management

## How It Works

### Step 1: Create a Stream
```bash
# Basic stream
nats stream add ORDERS \
  --subjects="orders.>" \
  --retention=limits \
  --max-msgs=1000000 \
  --max-age=72h \
  --storage=file

# Stream info
nats stream info ORDERS

# List all streams
nats stream list

# Publish to stream subject
nats pub orders.created '{"id":1,"item":"widget","qty":5}'
nats pub orders.shipped '{"id":1,"tracking":"ABC123"}'
```

### Step 2: Create Consumers
```bash
# Durable pull consumer
nats consumer add ORDERS processor \
  --filter="orders.created" \
  --deliver=all \
  --ack=explicit \
  --max-deliver=5 \
  --pull \
  --durable

# Push consumer (messages delivered automatically)
nats consumer add ORDERS notifier \
  --filter="orders.>" \
  --deliver=last \
  --ack=explicit \
  --deliver-to="notify.orders" \
  --durable

# Ephemeral consumer (not durable, auto-deleted)
nats consumer add ORDERS temp-reader \
  --filter="orders.>" \
  --deliver=all \
  --ack=none

# Consumer info
nats consumer info ORDERS processor
nats consumer list ORDERS
```

### Step 3: Consume Messages
```bash
# Pull next message
nats consumer next ORDERS processor

# Pull batch
nats consumer next ORDERS processor --count=10

# Subscribe to push consumer's delivery subject
nats sub "notify.orders"

# View stream contents (admin)
nats stream view ORDERS
nats stream view ORDERS --last=5
```

### Step 4: Stream Management
```bash
# Edit stream configuration
nats stream edit ORDERS --max-age=168h

# Purge all messages
nats stream purge ORDERS

# Purge by subject
nats stream purge ORDERS --subject="orders.test.>"

# Delete stream
nats stream rm ORDERS

# Stream report
nats stream report
```

## Best Practices
- Use durable consumers for any processing that must not lose messages
- Set max-deliver to prevent infinite redelivery loops
- Use explicit ack for reliable processing (ack after successful processing)
- Set max-age and max-msgs to prevent unbounded storage growth
- Use pull consumers for batch processing, push for real-time

## Common Mistakes
- No max-deliver limit (poison messages redelivered forever)
- Using ack=none for important processing (messages lost on failure)
- No retention limits (disk fills up)
- Using deliver=new when historical replay is needed (misses existing data)
- Not monitoring consumer lag (processing falling behind)
