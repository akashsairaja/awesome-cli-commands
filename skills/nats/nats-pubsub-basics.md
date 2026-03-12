---
id: nats-pubsub-basics
stackId: nats
type: skill
name: Pub/Sub Messaging with NATS CLI
description: >-
  Implement publish/subscribe messaging with the NATS CLI — subject hierarchies,
  wildcards, queue groups, request/reply patterns, and building event-driven
  communication between services.
difficulty: beginner
tags:
  - pub-sub
  - subjects
  - wildcards
  - queue-groups
  - request-reply
  - messaging
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - NATS CLI installed
  - NATS server running
faq:
  - question: How do NATS queue groups work?
    answer: >-
      Queue groups distribute messages across subscribers with the same group
      name. Each message goes to exactly one member of the group. Use for load
      balancing: nats sub 'tasks' --queue=workers. Without queue groups, all
      subscribers get every message (fan-out). With queue groups, it's
      round-robin distribution.
  - question: What is the difference between * and > wildcards in NATS?
    answer: >-
      * matches exactly one token: orders.*.created matches orders.us.created
      but not orders.us.east.created. > matches one or more tokens at the tail:
      orders.> matches orders.us.created and orders.eu.east.shipped. > must be
      the last token in the subject.
  - question: How does NATS request/reply work?
    answer: >-
      The requester publishes a message with an auto-generated reply subject.
      The responder subscribes to the request subject and publishes the response
      to the reply subject. The requester waits for the response with a timeout.
      It's synchronous RPC over async messaging.
relatedItems:
  - nats-jetstream-basics
  - nats-kv-object-store
  - nats-messaging-architect
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Pub/Sub Messaging with NATS CLI

## Overview
NATS pub/sub is the foundation of event-driven architectures. Publishers send messages to subjects, subscribers receive them — with wildcards for flexible routing and queue groups for load balancing.

## Why This Matters
- **Decoupling** — services communicate without knowing each other
- **Scalability** — add subscribers without changing publishers
- **Routing** — wildcard subjects enable flexible message routing
- **Load balancing** — queue groups distribute work across consumers

## How It Works

### Step 1: Basic Publish & Subscribe
```bash
# Subscribe to a subject (runs in background or another terminal)
nats sub "greetings"

# Publish a message
nats pub greetings "Hello NATS!"

# Publish with headers
nats pub greetings "Hello" --header="Priority:high" --header="Source:cli"

# Subscribe with count limit
nats sub "events" --count=5    # receive 5 messages then exit
```

### Step 2: Subject Hierarchies & Wildcards
```bash
# Hierarchical subjects
nats pub orders.us.created '{"id":1,"region":"us"}'
nats pub orders.eu.shipped '{"id":2,"region":"eu"}'

# * wildcard — matches one token
nats sub "orders.*.created"    # matches orders.us.created, orders.eu.created

# > wildcard — matches one or more tokens
nats sub "orders.>"            # matches all order events

# Specific and broad subscribers together
nats sub "logs.error" &        # only errors
nats sub "logs.>" &            # all logs
nats pub logs.error "disk full"    # both receive
nats pub logs.info "startup"       # only logs.> receives
```

### Step 3: Queue Groups
```bash
# Queue group — load balances across members
nats sub "tasks" --queue=workers &
nats sub "tasks" --queue=workers &
nats sub "tasks" --queue=workers &

# Each message goes to ONE subscriber in the group
nats pub tasks "job 1"    # goes to one of the 3 workers
nats pub tasks "job 2"    # goes to one of the 3 workers
```

### Step 4: Request/Reply
```bash
# Set up a responder
nats reply "math.add" "result: 42" &

# Send request and wait for reply
nats request "math.add" "2+2" --timeout=5s

# Dynamic responder with script
nats reply "echo" --command="cat" &
nats request "echo" "hello world"
```

## Best Practices
- Use dot-separated subject hierarchies: service.entity.action
- Use wildcards in subscribers, never in publishers
- Use queue groups for work distribution (not fan-out)
- Set --timeout on requests to avoid indefinite blocking
- Monitor subject usage with nats sub for debugging

## Common Mistakes
- Publishing to wildcard subjects (wildcards are for subscribing only)
- Not using queue groups when multiple instances handle the same work
- Overly broad subscriptions (processing irrelevant messages)
- No timeout on request/reply (blocks forever if no responder)
- Flat subject names instead of hierarchies (no wildcard flexibility)
