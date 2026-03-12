---
id: nats-subject-naming
stackId: nats
type: rule
name: Subject Naming Conventions
description: >-
  Enforce consistent NATS subject naming with dot-delimited hierarchies — define
  clear taxonomy for services, events, and commands with proper wildcard usage
  patterns.
difficulty: beginner
globs:
  - '**/nats*.conf'
  - '**/nats-server.conf'
  - '**/*.go'
  - '**/*.ts'
tags:
  - subject-naming
  - messaging
  - event-taxonomy
  - pubsub
  - naming-conventions
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
  - question: How should NATS subjects be structured?
    answer: >-
      Use dot-delimited lowercase hierarchies: domain.entity.action.qualifier.
      Common prefixes include svc.* for service requests, evt.* for domain
      events, cmd.* for commands, and sys.* for system metrics. This enables
      powerful wildcard subscriptions: svc.users.* subscribes to all user
      service actions.
  - question: What is the difference between * and > wildcards in NATS?
    answer: >-
      The * wildcard matches exactly one token: 'evt.order.*' matches
      'evt.order.created' but NOT 'evt.order.shipped.us-east-1'. The > wildcard
      matches one or more tokens: 'evt.order.>' matches both. Use * for
      single-level matching and > for deep hierarchies.
relatedItems:
  - nats-config-conventions
  - nats-jetstream-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Subject Naming Conventions

## Rule
All NATS subjects MUST use dot-delimited lowercase hierarchies following the pattern: `<domain>.<entity>.<action>.<qualifier>`. Use consistent taxonomy across all services.

## Format
```
<domain>.<entity>.<action>
<domain>.<entity>.<action>.<qualifier>
```

## Subject Taxonomy
| Pattern | Purpose | Example |
|---------|---------|---------|
| `svc.<name>.<action>` | Service requests | `svc.users.create` |
| `evt.<entity>.<event>` | Domain events | `evt.order.completed` |
| `cmd.<service>.<action>` | Commands | `cmd.email.send` |
| `sys.<component>.<metric>` | System metrics | `sys.api.latency` |
| `log.<service>.<level>` | Logging | `log.payment.error` |

## Good Examples
```
# Service requests
svc.users.get
svc.users.create
svc.orders.list
svc.orders.cancel

# Domain events
evt.order.created
evt.order.shipped
evt.payment.processed
evt.user.registered

# Wildcard subscriptions
svc.users.*         # All user service actions
evt.order.>         # All order events (including sub-tokens)
log.*.error          # All error logs across services

# With qualifiers
evt.order.shipped.us-east-1
svc.inventory.check.warehouse-a
```

## Bad Examples
```
# BAD: No hierarchy
UserCreated               # Flat, no domain context
createOrder               # camelCase, no dots

# BAD: Inconsistent naming
svc.User.Create           # PascalCase — use lowercase
evt.ORDER_SHIPPED         # UPPER_SNAKE — use dots and lowercase
events/order/completed    # Slashes — use dots

# BAD: Too deep or meaningless hierarchy
svc.v2.internal.api.users.management.actions.create.sync
```

## Enforcement
- Document subject taxonomy in a shared schema registry
- Validate subjects against patterns in middleware
- Use NATS account/user permissions to restrict subject access
