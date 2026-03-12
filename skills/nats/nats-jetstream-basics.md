---
id: nats-jetstream-basics
stackId: nats
type: skill
name: JetStream Streams & Consumers
description: >-
  Set up durable messaging with NATS JetStream — creating streams, configuring
  retention, durable consumers, acknowledgment patterns, and building reliable
  message processing pipelines.
difficulty: intermediate
tags:
  - jetstream
  - streams
  - consumers
  - durability
  - acknowledgment
  - retention
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - NATS CLI installed
  - NATS server with JetStream enabled
faq:
  - question: What is the difference between pull and push consumers?
    answer: >-
      Pull consumers: the client explicitly fetches messages (nats consumer
      next). Good for batch processing, backpressure control, and workers that
      process at their own pace. Push consumers: NATS delivers messages to a
      subject automatically. Good for real-time processing, event handlers, and
      fan-out patterns.
  - question: What does deliver=all vs deliver=last mean?
    answer: >-
      deliver=all: consumer starts from the first message in the stream (full
      replay). deliver=last: starts from the most recent message only.
      deliver=new: only messages published after consumer creation.
      deliver=by_start_time: from a specific timestamp. Use 'all' for new
      consumers that need history, 'new' for real-time only.
  - question: How does message acknowledgment work in JetStream?
    answer: >-
      With ack=explicit, each message must be acknowledged after processing. If
      not acked within the ack_wait period, NATS redelivers it (up to
      max-deliver times). Ack types: ack (success), nak (reject, redeliver
      immediately), term (reject permanently), in-progress (extend ack
      deadline).
relatedItems:
  - nats-pubsub-basics
  - nats-kv-object-store
  - nats-jetstream-ops
version: 1.0.0
lastUpdated: '2026-03-12'
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
