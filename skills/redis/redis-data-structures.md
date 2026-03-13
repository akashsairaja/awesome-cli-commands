---
id: redis-data-structures
stackId: redis
type: skill
name: Redis Data Structures in Practice
description: >-
  Master Redis data structures — strings, hashes, sets, sorted sets, streams,
  and HyperLogLog with real-world implementation patterns for caching,
  counting, ranking, and messaging.
difficulty: advanced
tags:
  - redis
  - data
  - structures
  - practice
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Redis Data Structures in Practice skill?"
    answer: >-
      Master Redis data structures — strings, hashes, sets, sorted sets,
      streams, and HyperLogLog with real-world implementation patterns for
      caching, counting, ranking, and messaging. This skill provides a
      structured workflow for development tasks.
  - question: "What tools and setup does Redis Data Structures in Practice require?"
    answer: >-
      Works with standard redis tooling (relevant CLI tools and frameworks).
      No special setup required beyond a working redis environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Redis Data Structures in Practice

## Overview
Redis is not just a key-value store — it's a data structure server. Each type has specific operations that run in O(1) or O(log N) time, making Redis suitable for real-time features that would be too slow with a traditional database.

## Why This Matters
- Choosing the right data structure can mean O(1) vs O(N) operations
- Redis processes 100K+ operations/second on a single thread
- Proper structure selection saves memory (10x difference between approaches)

## Data Structures

### Step 1: Strings — Simple Values & Counters
```bash
# Set/Get simple values
SET user:1234:name "Jane Smith"
GET user:1234:name

# Atomic counters (page views, likes)
INCR page:home:views          # Returns incremented value
INCRBY user:1234:points 50    # Increment by specific amount

# Expiring keys (cache)
SET cache:product:567 '{"name":"Widget","price":29.99}' EX 300  # 5 min TTL
TTL cache:product:567          # Check remaining time

# Distributed lock
SET lock:order:789 "worker-1" NX EX 30  # Set only if Not eXists, 30s timeout
```

### Step 2: Hashes — Object Storage
```bash
# Store object fields individually
HSET user:1234 name "Jane" email "jane@example.com" role "admin" loginCount 42
HGET user:1234 name               # Get single field
HMGET user:1234 name email        # Get multiple fields
HGETALL user:1234                 # Get all fields
HINCRBY user:1234 loginCount 1    # Increment field atomically
```

### Step 3: Sets — Unique Collections
```bash
# Tags, likes, online users
SADD post:100:tags "redis" "caching" "nosql"
SMEMBERS post:100:tags            # All tags
SISMEMBER post:100:tags "redis"   # Membership test (O(1))

# Set operations
SINTER user:1:friends user:2:friends     # Common friends
SUNION user:1:interests user:2:interests # Combined interests
SDIFF user:1:friends user:2:friends      # Friends of 1 not in 2
```

### Step 4: Sorted Sets — Ranked Data
```bash
# Leaderboard
ZADD leaderboard 1500 "player:alice" 2300 "player:bob" 1800 "player:charlie"
ZREVRANGE leaderboard 0 2 WITHSCORES  # Top 3 players
ZRANK leaderboard "player:alice"       # Alice's rank (0-based)
ZINCRBY leaderboard 100 "player:alice" # Alice scored 100 points

# Time-indexed data (recent activity)
ZADD user:1:activity 1709251200 "login" 1709254800 "purchase" 1709258400 "logout"
ZRANGEBYSCORE user:1:activity 1709251200 1709258400  # Activity in time range
```

### Step 5: Streams — Event Logs & Message Queues
```bash
# Append events
XADD orders:stream * action "created" orderId "789" amount "49.99"
XADD orders:stream * action "paid" orderId "789" gateway "stripe"

# Read latest events
XRANGE orders:stream - + COUNT 10

# Consumer groups (like Kafka)
XGROUP CREATE orders:stream processors $ MKSTREAM
XREADGROUP GROUP processors worker-1 COUNT 5 BLOCK 2000 STREAMS orders:stream >
XACK orders:stream processors 1709251200000-0  # Acknowledge processed
```

## Best Practices
- Use Hashes instead of serialized JSON Strings when you need field-level access
- Use Sorted Sets for anything ranked, time-indexed, or priority-based
- Use HyperLogLog for approximate unique counts (PFADD/PFCOUNT — 12KB for 100M uniques)
- Use SCAN instead of KEYS for iterating keys in production
- Pipeline multiple commands to reduce round trips (10-100x faster)

## Common Mistakes
- Using Strings for everything (losing Redis's data structure advantages)
- Using KEYS in production (blocks the single-threaded server)
- Not setting TTL on cache entries (memory grows indefinitely)
- Using Lists as message queues (use Streams with consumer groups instead)
