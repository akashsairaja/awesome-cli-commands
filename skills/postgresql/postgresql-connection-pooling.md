---
id: postgresql-connection-pooling
stackId: postgresql
type: skill
name: PostgreSQL Connection Pooling with PgBouncer
description: >-
  Configure PgBouncer for PostgreSQL connection pooling — transaction vs
  session pooling, sizing pool limits, monitoring connections, and handling
  prepared statements.
difficulty: intermediate
tags:
  - postgresql
  - connection
  - pooling
  - pgbouncer
  - docker
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the PostgreSQL Connection Pooling with PgBouncer skill?"
    answer: >-
      Configure PgBouncer for PostgreSQL connection pooling — transaction vs
      session pooling, sizing pool limits, monitoring connections, and
      handling prepared statements. This skill provides a structured workflow
      for query optimization, index strategy, connection pooling, and
      migration safety.
  - question: "What tools and setup does PostgreSQL Connection Pooling with PgBouncer require?"
    answer: >-
      Requires Docker installed. Works with PostgreSQL projects. Review the
      configuration section for project-specific setup.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# PostgreSQL Connection Pooling with PgBouncer

## Overview
PostgreSQL creates a new process for every client connection, consuming ~10MB of memory each. Without connection pooling, 500 application instances each opening 20 connections would require 10,000 PostgreSQL processes — crashing your server. PgBouncer solves this by multiplexing many client connections over a small pool of actual database connections.

## Why This Matters
- Each PostgreSQL connection costs ~10MB RAM + process overhead
- Default max_connections is 100 — easily exhausted by modern apps
- Opening a new connection takes 50-100ms (TCP + TLS + auth)
- Connection pooling reduces this to < 1ms for pooled connections

## Setup and Configuration

### Step 1: Install PgBouncer
```bash
# Debian/Ubuntu
sudo apt install pgbouncer

# macOS
brew install pgbouncer

# Docker
docker run --name pgbouncer -d -p 6432:6432 \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/mydb" \
  edoburu/pgbouncer
```

### Step 2: Configure PgBouncer
```ini
; /etc/pgbouncer/pgbouncer.ini

[databases]
mydb = host=localhost port=5432 dbname=mydb

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt

; Pool mode — most important setting
pool_mode = transaction    ; Recommended for most apps

; Pool sizing
default_pool_size = 20     ; Connections per user/database pair
min_pool_size = 5          ; Keep this many connections warm
max_client_conn = 1000     ; Max client connections to PgBouncer
max_db_connections = 50    ; Max actual connections to PostgreSQL

; Timeouts
server_idle_timeout = 300  ; Close idle server connections after 5 min
client_idle_timeout = 0    ; Never close idle client connections
query_timeout = 30         ; Kill queries running longer than 30s
```

### Step 3: Choose Pool Mode
```bash
# Transaction pooling (RECOMMENDED for most apps)
# Connection returned to pool after each transaction
# Cannot use: session-level SET, prepared statements, LISTEN/NOTIFY
pool_mode = transaction

# Session pooling (for apps needing session features)
# Connection held for entire client session — less efficient
pool_mode = session

# Statement pooling (for simple query routing)
# Connection returned after each statement — most efficient but most restrictive
pool_mode = statement
```

### Step 4: Application Connection String
```bash
# Point your app at PgBouncer instead of PostgreSQL directly
DATABASE_URL="postgresql://user:pass@pgbouncer-host:6432/mydb"

# For Node.js with pg driver:
# Set statement_timeout at query level, not connection level
```

## Best Practices
- Use transaction pooling unless you specifically need session features
- Set max_db_connections to 80% of PostgreSQL's max_connections
- Monitor with: SHOW POOLS; SHOW STATS; SHOW CLIENTS;
- Use prepared statements at the driver level with transaction pooling disabled
- Set server_idle_timeout to reclaim unused connections
- Run PgBouncer on the same host as the application for lowest latency

## Common Mistakes
- Setting pool size too high (defeats the purpose — still overwhelms PostgreSQL)
- Using session pooling when transaction pooling would work
- Using SET statements with transaction pooling (settings don't persist)
- Not monitoring the pool (cl_waiting > 0 means clients are queuing)
- Forgetting to update connection strings from direct PostgreSQL to PgBouncer
