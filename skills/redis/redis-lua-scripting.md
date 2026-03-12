---
id: redis-lua-scripting
stackId: redis
type: skill
name: Redis Lua Scripting for Atomic Operations
description: >-
  Write Redis Lua scripts for atomic multi-step operations — rate limiters,
  distributed locks, conditional updates, and complex transactions that cannot
  be interrupted.
difficulty: advanced
tags:
  - lua-scripting
  - atomic-operations
  - rate-limiting
  - distributed-lock
  - transactions
  - redis
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - lua
  - typescript
  - python
prerequisites:
  - Redis 7.0+
  - Basic Lua syntax
  - Redis data structures
faq:
  - question: Why use Lua scripts in Redis instead of transactions (MULTI/EXEC)?
    answer: >-
      MULTI/EXEC transactions cannot read a value and use it in a subsequent
      write within the same transaction — they only batch commands. Lua scripts
      can read, compute, and write atomically. For example, a rate limiter needs
      to read the current count and conditionally increment — only Lua can do
      this atomically.
  - question: Are Redis Lua scripts atomic?
    answer: >-
      Yes. Redis executes Lua scripts atomically — no other command from any
      client can run between the script's operations. This is because Redis is
      single-threaded. However, this also means long-running scripts block all
      other clients, so keep scripts fast (under 5ms ideally).
relatedItems:
  - redis-data-structures
  - redis-caching-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Redis Lua Scripting for Atomic Operations

## Overview
Redis executes Lua scripts atomically — no other command can run between the script's operations. This makes Lua scripts perfect for implementing complex logic that needs to read, compute, and write without race conditions. Think of it as a stored procedure for Redis.

## Why This Matters
- Multi-step operations without Lua are not atomic (race conditions)
- Lua scripts reduce round trips (one network call instead of many)
- Enables complex logic: rate limiting, leaderboard updates, conditional sets

## Lua Script Patterns

### Step 1: Sliding Window Rate Limiter
```lua
-- rate_limit.lua
-- KEYS[1] = rate limit key (e.g., "ratelimit:user:123")
-- ARGV[1] = window size in seconds
-- ARGV[2] = max requests per window
-- ARGV[3] = current timestamp (ms)

local key = KEYS[1]
local window = tonumber(ARGV[1]) * 1000
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove entries outside the window
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)

-- Count current requests in window
local count = redis.call('ZCARD', key)

if count < limit then
  -- Under limit: add this request and allow
  redis.call('ZADD', key, now, now .. ':' .. math.random(1000000))
  redis.call('PEXPIRE', key, window)
  return 1  -- Allowed
else
  return 0  -- Rate limited
end
```

### Step 2: Atomic Compare-and-Swap
```lua
-- cas.lua — Update only if current value matches expected
-- KEYS[1] = key to update
-- ARGV[1] = expected current value
-- ARGV[2] = new value

local current = redis.call('GET', KEYS[1])
if current == ARGV[1] then
  redis.call('SET', KEYS[1], ARGV[2])
  return 1  -- Updated
else
  return 0  -- Value changed since read
end
```

### Step 3: Distributed Lock with Fencing Token
```lua
-- acquire_lock.lua
-- KEYS[1] = lock key
-- KEYS[2] = fencing token counter key
-- ARGV[1] = lock holder ID
-- ARGV[2] = TTL in seconds

local acquired = redis.call('SET', KEYS[1], ARGV[1], 'NX', 'EX', tonumber(ARGV[2]))
if acquired then
  -- Increment fencing token for ordering guarantees
  local token = redis.call('INCR', KEYS[2])
  return token
else
  return -1  -- Lock not acquired
end
```

### Step 4: Using Lua Scripts from Application Code
```typescript
import Redis from "ioredis";

const redis = new Redis();

// Load script once, call many times with EVALSHA
const rateLimitScript = `
local key = KEYS[1]
local window = tonumber(ARGV[1]) * 1000
local limit = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)
if count < limit then
  redis.call('ZADD', key, now, now .. ':' .. math.random(1000000))
  redis.call('PEXPIRE', key, window)
  return 1
else
  return 0
end
`;

// Define custom command
redis.defineCommand("rateLimit", {
  numberOfKeys: 1,
  lua: rateLimitScript,
});

// Use it
const allowed = await redis.rateLimit(
  "ratelimit:user:123",  // KEYS[1]
  60,                      // ARGV[1]: 60 second window
  100,                     // ARGV[2]: 100 requests max
  Date.now()               // ARGV[3]: current time
);
```

## Best Practices
- Keep Lua scripts short — they block the single Redis thread while executing
- Use EVALSHA (not EVAL) in production — loads the script once by SHA hash
- Pass keys via KEYS array and values via ARGV array (required for Redis Cluster)
- Use redis.log(redis.LOG_WARNING, "message") for debugging
- Test scripts with redis-cli --eval script.lua keys , args

## Common Mistakes
- Long-running Lua scripts (blocks all other clients)
- Hardcoding key names (breaks Redis Cluster compatibility)
- Not using EVALSHA (EVAL sends the full script text every time)
- Trying to call external services from Lua (not allowed)
- Using Lua when a simple MULTI/EXEC transaction would suffice
