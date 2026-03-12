---
id: redis-production-safety
stackId: redis
type: rule
name: Redis Production Safety Rules
description: >-
  Prevent dangerous Redis operations in production — ban KEYS and FLUSHALL,
  require maxmemory configuration, enforce persistence settings, and mandate
  connection pooling.
difficulty: intermediate
globs:
  - '**/redis.conf'
  - '**/*.ts'
  - '**/*.py'
tags:
  - production
  - safety
  - maxmemory
  - persistence
  - monitoring
  - redis
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
languages:
  - bash
  - typescript
faq:
  - question: Why is the KEYS command dangerous in Redis production?
    answer: >-
      KEYS scans the entire keyspace in a single blocking operation — O(N) where
      N is the total number of keys. On a Redis instance with millions of keys,
      this blocks all other operations for seconds or minutes, effectively
      causing a denial of service. Use SCAN instead for non-blocking iteration.
  - question: What happens when Redis runs out of memory without maxmemory set?
    answer: >-
      Without maxmemory, Redis keeps growing until the OS out-of-memory (OOM)
      killer terminates the process, causing total data loss if persistence is
      not configured. Always set maxmemory and an eviction policy. For caching,
      use allkeys-lru; for persistent data, use noeviction.
relatedItems:
  - redis-key-naming
  - redis-caching-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Redis Production Safety Rules

## Rule
Production Redis instances MUST have maxmemory configured, dangerous commands renamed or disabled, and persistence enabled.

## Format
Every production Redis deployment must pass this safety checklist before going live.

## Requirements

### 1. Never Use KEYS in Production
```bash
# DANGEROUS: Blocks Redis for seconds/minutes on large datasets
KEYS user:*         # Scans ALL keys, O(N) blocking

# SAFE: Use SCAN for iterative, non-blocking key discovery
SCAN 0 MATCH user:* COUNT 100
# Returns cursor + batch — repeat with returned cursor until cursor = 0
```

### 2. Disable Dangerous Commands
```bash
# redis.conf — rename dangerous commands to prevent accidents
rename-command FLUSHALL ""
rename-command FLUSHDB ""
rename-command KEYS ""
rename-command DEBUG ""
rename-command CONFIG "CONFIG_a1b2c3"  # Require secret suffix
```

### 3. Always Set maxmemory and Eviction Policy
```bash
# redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru    # For caching workloads
# maxmemory-policy noeviction   # For persistent data (returns errors when full)
```

### 4. Enable Persistence
```bash
# redis.conf — RDB snapshots (fast recovery)
save 900 1       # Snapshot if >= 1 key changed in 900 seconds
save 300 10      # Snapshot if >= 10 keys changed in 300 seconds
save 60 10000    # Snapshot if >= 10000 keys changed in 60 seconds

# AOF (durability — every write is logged)
appendonly yes
appendfsync everysec  # Balance between performance and durability
```

### 5. Use Connection Pooling
```typescript
// BAD: New connection per request
async function getData(key: string) {
  const redis = new Redis();  // New connection every time
  const data = await redis.get(key);
  redis.disconnect();
  return data;
}

// GOOD: Shared connection pool
import Redis from "ioredis";
const redis = new Redis({
  host: "redis-host",
  port: 6379,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);  // Exponential backoff
  },
  lazyConnect: true,
  enableReadyCheck: true,
});
```

### 6. Set Timeouts on All Operations
```typescript
const redis = new Redis({
  connectTimeout: 5000,     // Connection timeout: 5s
  commandTimeout: 3000,     // Command timeout: 3s
  retryStrategy(times) {
    if (times > 3) return null;  // Stop retrying after 3 attempts
    return Math.min(times * 200, 1000);
  },
});
```

## Monitoring Checklist
- Memory usage: INFO memory (used_memory vs maxmemory)
- Connected clients: INFO clients
- Hit rate: INFO stats (keyspace_hits / (hits + misses))
- Slow queries: SLOWLOG GET 10
- Eviction count: INFO stats (evicted_keys should be near 0)

## Anti-Patterns
- Running Redis without maxmemory (OOM killer will terminate it)
- Using KEYS, FLUSHALL, FLUSHDB in production
- No persistence (all data lost on restart)
- Single Redis connection shared across async operations without pooling
- Not monitoring memory usage and eviction rates

## Enforcement
Use Redis Sentinel or Redis Cluster for high availability. Configure alerts on memory usage > 80%, eviction rate > 0, and connected_clients approaching limit.
