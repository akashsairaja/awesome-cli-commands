---
id: database-connection-management
stackId: database
type: skill
name: Database Connection Pool Management
description: >-
  Configure database connection pools correctly — pool sizing formulas, timeout
  settings, health checks, connection lifecycle management, and monitoring for
  Node.js, Python, and Java applications.
difficulty: intermediate
tags:
  - connection-pool
  - pool-sizing
  - configuration
  - performance
  - monitoring
  - database
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - typescript
  - python
  - java
prerequisites:
  - Database basics
  - Application deployment experience
faq:
  - question: How do I size a database connection pool?
    answer: >-
      Use the formula: pool_size = (CPU cores * 2) + 1 per application instance.
      For 4 CPU cores, that is 9 connections. Total across all instances must be
      less than the database's max_connections. Too large a pool overwhelms the
      database; too small causes request queuing. Monitor waitingCount to tune.
  - question: Why do I need connection pooling for databases?
    answer: >-
      Each database connection costs ~10MB RAM and ~100ms to establish (TCP +
      TLS + auth). Without pooling, every request creates and destroys a
      connection. Pooling reuses connections, reducing overhead to ~1ms per
      request and capping total connections to prevent database exhaustion.
relatedItems:
  - database-design-architect
  - postgresql-connection-pooling
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Database Connection Pool Management

## Overview
Every database connection consumes memory on both the application and database server. Connection pooling reuses a fixed set of connections across all requests, preventing connection exhaustion and reducing connection overhead from ~100ms to ~1ms.

## Why This Matters
- Each PostgreSQL connection uses ~10MB of server memory
- Opening a connection takes 50-100ms (TCP + TLS + auth)
- Without pooling, 100 concurrent requests = 100 connections = 1GB RAM
- Pool too small = requests queue; pool too large = database overloaded

## Pool Sizing

### Step 1: Calculate Optimal Pool Size
```bash
# Formula for a single application instance:
pool_size = (number_of_cpu_cores * 2) + effective_spindle_count

# For SSD-based servers (most modern):
pool_size = cpu_cores * 2 + 1

# Example: 4 CPU cores, SSD storage
pool_size = 4 * 2 + 1 = 9  # connections per app instance

# For N application instances:
total_connections = pool_size * number_of_instances
# Must be < database max_connections (minus reserved connections)
```

### Step 2: Configure Connection Pool (Node.js/Prisma)
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// DATABASE_URL with pool settings
// postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=10

// Or with pg library directly
import { Pool } from "pg";
const pool = new Pool({
  host: process.env.DB_HOST,
  port: 5432,
  database: "myapp",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,                    // Maximum connections in pool
  min: 2,                     // Minimum idle connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 5000, // Error if can't connect in 5s
  statement_timeout: 30000,   // Kill queries running > 30s
});

// Health check
pool.on("error", (err) => {
  console.error("Unexpected pool error:", err);
});
```

### Step 3: Configure Connection Pool (Python/SQLAlchemy)
```python
from sqlalchemy import create_engine

engine = create_engine(
    "postgresql://user:pass@host:5432/myapp",
    pool_size=10,           # Max connections
    max_overflow=5,         # Extra connections allowed beyond pool_size
    pool_timeout=30,        # Wait for connection before error
    pool_recycle=1800,      # Recreate connections after 30 minutes
    pool_pre_ping=True,     # Verify connection is alive before using
)
```

### Step 4: Monitor Pool Health
```typescript
// Periodic pool monitoring
setInterval(() => {
  console.log({
    totalCount: pool.totalCount,     // Total connections created
    idleCount: pool.idleCount,       // Currently idle
    waitingCount: pool.waitingCount, // Requests waiting for a connection
  });

  // Alert if requests are queuing
  if (pool.waitingCount > 0) {
    alertOps("Database pool exhausted", { waiting: pool.waitingCount });
  }
}, 10000);
```

## Best Practices
- Set pool size based on CPU formula, not arbitrary large numbers
- Always set connection timeout (fail fast instead of hanging)
- Enable pool_pre_ping or equivalent health check
- Monitor waitingCount — non-zero means pool is too small
- Use connection poolers (PgBouncer) for many small application instances
- Release connections promptly — never hold during external API calls

## Common Mistakes
- Setting pool too large (50+ connections per instance overwhelms database)
- No connection timeout (requests hang indefinitely when pool exhausted)
- Holding connections during long operations (HTTP calls, file I/O)
- Not monitoring pool metrics (silent pool exhaustion under load)
- Creating new pools per request instead of sharing one global pool
