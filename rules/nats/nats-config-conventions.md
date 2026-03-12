---
id: nats-config-conventions
stackId: nats
type: rule
name: NATS Server Configuration Standards
description: >-
  Configure NATS servers with proper security defaults — TLS required,
  authentication enabled, authorization with accounts, and JetStream storage
  limits for production deployments.
difficulty: intermediate
globs:
  - '**/nats*.conf'
  - '**/nats-server.conf'
  - '**/jetstream.conf'
tags:
  - nats-config
  - tls
  - authentication
  - jetstream
  - security
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
  - question: Why must NATS always have authentication in production?
    answer: >-
      Without authentication, any client that can reach the NATS port can
      publish to any subject, subscribe to any data stream, and potentially
      disrupt the entire messaging system. NATS with no auth is equivalent to an
      open database — never acceptable in production.
  - question: How should JetStream storage limits be configured?
    answer: >-
      Always set explicit max_mem and max_file limits in the JetStream
      configuration. Without limits, JetStream will consume all available disk
      space. Set max_file based on your retention requirements and disk
      capacity. Monitor with NATS monitoring endpoints and alert at 80% usage.
relatedItems:
  - nats-subject-naming
  - nats-jetstream-patterns
version: 1.0.0
lastUpdated: '2026-03-12'
---

# NATS Server Configuration Standards

## Rule
Production NATS servers MUST enable TLS, require authentication, use account-based authorization, and configure JetStream with explicit storage limits. Never run NATS without auth in production.

## Format
```
# nats-server.conf
port: 4222
server_name: nats-prod-1

tls {
  cert_file: "/etc/nats/server-cert.pem"
  key_file: "/etc/nats/server-key.pem"
  ca_file: "/etc/nats/ca.pem"
  verify: true
}
```

## Good Examples
```
# Production nats-server.conf
server_name: nats-prod-1
port: 4222
http_port: 8222

# TLS required
tls {
  cert_file: "/etc/nats/tls/server.crt"
  key_file: "/etc/nats/tls/server.key"
  ca_file: "/etc/nats/tls/ca.crt"
  verify_and_map: true
}

# JetStream with storage limits
jetstream {
  store_dir: "/data/nats/jetstream"
  max_mem: 1G
  max_file: 10G
}

# Account-based authorization
accounts {
  APP {
    users: [
      {user: "api-service", password: "$2a$11$..."}
      {user: "worker", password: "$2a$11$..."}
    ]
    jetstream: enabled
  }
  MONITORING {
    users: [
      {user: "prometheus", password: "$2a$11$..."}
    ]
  }
  SYS {
    users: [
      {user: "admin", password: "$2a$11$..."}
    ]
  }
}
system_account: SYS

# Limits
max_payload: 1MB
max_connections: 10000
```

## Bad Examples
```
# BAD: No authentication
port: 4222
# Anyone can connect and publish to any subject!

# BAD: No TLS
port: 4222
authorization {
  token: "mysecrettoken"  # Sent in plaintext without TLS!
}

# BAD: Unlimited JetStream storage
jetstream {}  # No limits — will fill disk
```

## Enforcement
- Reject configs without TLS in production environments
- Audit account permissions quarterly
- Monitor JetStream storage usage with alerts at 80% capacity
- Use nats-server --config-check to validate config before deploy
