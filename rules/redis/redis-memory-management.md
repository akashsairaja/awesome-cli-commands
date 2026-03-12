---
id: redis-memory-management
stackId: redis
type: rule
name: Redis Memory Optimization Rules
description: >-
  Optimize Redis memory usage — hash ziplist tuning, key expiry policies,
  memory-efficient data structures, OBJECT ENCODING checks, and MEMORY USAGE
  monitoring.
difficulty: intermediate
globs:
  - '**/redis.conf'
  - '**/*.ts'
  - '**/*.py'
tags:
  - memory
  - optimization
  - ziplist
  - encoding
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
faq:
  - question: How do I reduce Redis memory usage?
    answer: >-
      Four approaches: (1) Use Hashes with ziplist encoding for small objects
      (90 bytes overhead per key saved). (2) Set TTLs on all cache keys. (3)
      Tune ziplist thresholds (hash-max-ziplist-entries/value). (4) Use shorter
      key names — they consume memory too. Monitor with MEMORY USAGE and
      redis-cli --bigkeys.
  - question: What is ziplist encoding in Redis and why does it matter?
    answer: >-
      Ziplist is a compact, memory-efficient encoding Redis uses for small
      hashes, sets, and sorted sets. It stores data contiguously in memory
      instead of using pointers. A hash with 10 small fields uses ~10x less
      memory with ziplist encoding. Redis automatically upgrades to standard
      encoding when thresholds are exceeded.
relatedItems:
  - redis-key-naming
  - redis-production-safety
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Redis Memory Optimization Rules

## Rule
Redis memory MUST be monitored and optimized. Use memory-efficient encodings, set TTLs on all temporary data, and regularly audit key sizes.

## Format
Every Redis deployment must have memory budgets per key pattern and monitoring alerts.

## Requirements

### 1. Use Memory-Efficient Encodings
```bash
# Check current encoding of a key
OBJECT ENCODING mykey

# Small hashes use ziplist (very memory efficient)
# Configure thresholds:
hash-max-ziplist-entries 128    # Up to 128 fields
hash-max-ziplist-value 64       # Fields up to 64 bytes

# Small sorted sets use listpack
zset-max-listpack-entries 128
zset-max-listpack-value 64

# Small sets use listpack
set-max-listpack-entries 128
```

### 2. Monitor Memory Per Key Pattern
```bash
# Check memory usage of a specific key
MEMORY USAGE cache:user:1234:profile

# Check overall memory
INFO memory
# used_memory_human: 2.5G
# maxmemory_human: 4G
# mem_fragmentation_ratio: 1.1 (good: 1.0-1.5)
```

### 3. Use Hashes for Small Object Groups
```bash
# BAD: 1000 separate keys for user settings
SET user:1:theme "dark"
SET user:1:lang "en"
SET user:1:timezone "UTC"
# Each key has ~90 bytes overhead

# GOOD: One hash with all settings (ziplist encoding)
HSET user:1:settings theme "dark" lang "en" timezone "UTC"
# One key overhead, ziplist encoding for small hashes
```

### 4. Avoid Large Keys
```bash
# Check for large keys
redis-cli --bigkeys

# Set alerts for keys > 1MB
# Large keys cause:
# - Slow network transfer
# - Memory fragmentation
# - Cluster rebalancing issues
# - Blocking DEL operations
```

### 5. Use UNLINK Instead of DEL for Large Keys
```bash
# DEL blocks Redis for large keys (millions of elements)
DEL large:sorted:set    # Blocks for seconds

# UNLINK is non-blocking — frees memory in background
UNLINK large:sorted:set  # Returns immediately
```

## Memory Budget Example
| Key Pattern | Count | Avg Size | Total | TTL |
|-------------|-------|----------|-------|-----|
| cache:user:* | 100K | 500B | 50MB | 1h |
| session:* | 50K | 200B | 10MB | 24h |
| ratelimit:* | 200K | 100B | 20MB | 1min |
| leaderboard:* | 10 | 5MB | 50MB | none |
| **Total** | | | **130MB** | |

## Anti-Patterns
- Storing large JSON strings (> 100KB) as single keys
- Not monitoring memory fragmentation ratio
- Using DEL on keys with millions of elements (use UNLINK)
- Not setting hash-max-ziplist-entries for small hash optimization
- Ignoring bigkeys output in monitoring

## Enforcement
Run redis-cli --bigkeys weekly. Set alerts on used_memory > 80% of maxmemory. Monitor mem_fragmentation_ratio (> 1.5 means fragmentation issue).
