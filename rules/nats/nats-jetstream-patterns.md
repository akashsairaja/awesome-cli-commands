---
id: nats-jetstream-patterns
stackId: nats
type: rule
name: JetStream Stream and Consumer Design
description: >-
  Design JetStream streams and consumers correctly — proper retention policies,
  consumer acknowledgment patterns, replay policies, and stream partitioning for
  scalability.
difficulty: advanced
globs:
  - '**/nats*.conf'
  - '**/*.go'
  - '**/*.ts'
  - '**/jetstream*'
tags:
  - jetstream
  - streams
  - consumers
  - acknowledgment
  - message-durability
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
  - question: When should I use JetStream pull vs push consumers?
    answer: >-
      Use pull consumers for workload processing where consumers control their
      own pace — workers fetch messages when ready, preventing overload. Use
      push consumers for real-time delivery where latency matters (live
      dashboards, notifications). Pull consumers are generally safer for
      production workloads because they inherently support backpressure.
  - question: What JetStream retention policy should I use?
    answer: >-
      Use 'limits' (default) for event logs that need time-based or size-based
      retention. Use 'workqueue' when messages should be deleted after any
      consumer acks them (job queues). Use 'interest' when messages should be
      kept only while active consumers exist. Most use cases work with 'limits'
      plus max-age.
relatedItems:
  - nats-subject-naming
  - nats-config-conventions
version: 1.0.0
lastUpdated: '2026-03-12'
---

# JetStream Stream and Consumer Design

## Rule
Every JetStream stream MUST have explicit retention policy, storage type, max age, and discard policy. Consumers MUST use explicit acknowledgment. Never use auto-ack in production.

## Stream Configuration
| Parameter | Purpose | Recommended |
|-----------|---------|-------------|
| retention | When to discard | limits (default), workqueue, interest |
| storage | Where to store | file (durable) or memory (ephemeral) |
| max_age | TTL for messages | Set based on use case |
| max_msgs | Max message count | Set to prevent unbounded growth |
| discard | When full | old (drop oldest) or new (reject new) |
| replicas | Replication factor | 3 for production clusters |

## Good Examples
```bash
# Create a well-configured stream
nats stream add ORDERS \
  --subjects "evt.order.>" \
  --retention limits \
  --storage file \
  --max-age 30d \
  --max-msgs 10000000 \
  --max-bytes 10GB \
  --discard old \
  --replicas 3 \
  --duplicate-window 2m

# Durable pull consumer with explicit ack
nats consumer add ORDERS order-processor \
  --filter "evt.order.created" \
  --ack explicit \
  --max-deliver 5 \
  --ack-wait 30s \
  --replay instant \
  --pull \
  --max-pending 1000
```

## Bad Examples
```bash
# BAD: No limits — unbounded growth
nats stream add EVENTS --subjects "evt.>"
# No max-age, max-msgs, or max-bytes!

# BAD: Auto-ack consumer — messages lost on crash
nats consumer add ORDERS processor \
  --ack none  # Messages deleted before processing completes!

# BAD: Push consumer without flow control
nats consumer add ORDERS fast-consumer \
  --push --deliver-subject worker.inbox
  # No flow-control, no max-pending — overwhelms slow consumers
```

## Acknowledgment Patterns
```
explicit ack     — Consumer must ack each message (safest)
ack with timeout — Re-deliver if not acked within --ack-wait
max-deliver      — Give up after N delivery attempts (dead letter)
```

## Enforcement
- Validate stream configs in infrastructure-as-code (Terraform, Pulumi)
- Monitor consumer lag with NATS monitoring API
- Alert on max-deliver exceeded (dead-letter scenarios)
- Test failover by killing consumers and verifying re-delivery
