---
id: redis-key-naming
stackId: redis
type: rule
name: Redis Key Naming Conventions
description: >-
  Enforce consistent Redis key naming with colon-separated namespaces,
  predictable patterns, short prefixes, and TTL policies to maintain organized,
  scannable key spaces.
difficulty: beginner
globs:
  - '**/*.ts'
  - '**/*.js'
  - '**/*.py'
  - '**/*.go'
tags:
  - key-naming
  - namespaces
  - conventions
  - ttl
  - memory
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
  - question: What is the best key naming convention for Redis?
    answer: >-
      Use colon-separated namespaces: {service}:{entity}:{id}:{field}. For
      example, cache:user:1234:profile. Colons are the standard Redis
      convention, enable pattern-based SCAN, and create a logical hierarchy.
      Keep keys as short as possible since they consume memory.
  - question: Why should I always set TTL on Redis cache keys?
    answer: >-
      Without TTL, cache keys live forever and Redis memory grows continuously
      until it hits maxmemory and starts evicting keys unpredictably. Explicit
      TTLs ensure data freshness, predictable memory usage, and automatic
      cleanup of stale data.
relatedItems:
  - redis-memory-management
  - redis-caching-architect
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Redis Key Naming Conventions

## Rule
All Redis keys MUST follow a colon-separated namespace pattern with consistent, descriptive names.

## Format
```
{service}:{entity}:{id}:{field}
```

## Requirements

### 1. Namespace Pattern
```bash
# GOOD: Clear hierarchy with colons
cache:user:1234:profile
session:abc123def456
ratelimit:api:user:1234
lock:order:789:processing
leaderboard:game:weekly
queue:emails:pending

# BAD: Inconsistent or verbose
user_1234_profile      # Underscores instead of colons
cache-user-1234        # Hyphens instead of colons
myapp.cache.user.1234  # Dots (not Redis convention)
UserProfile:1234       # PascalCase
```

### 2. Keep Keys Short (Memory Matters)
```bash
# GOOD: Short but descriptive
c:u:1234:p       # Only if documented in team conventions
usr:1234:sess    # Abbreviated but readable

# BAD: Unnecessarily long
application:user-service:user-profile-cache:user-id-1234:profile-data
```

### 3. Use TTL for Every Cache Key
```bash
# GOOD: Every cache key has a TTL
SET cache:user:1234:profile '{"name":"Jane"}' EX 3600

# BAD: No TTL — data lives forever
SET cache:user:1234:profile '{"name":"Jane"}'
```

### 4. Consistent ID Formats
```bash
# GOOD: Consistent ID type across all keys
cache:user:1234          # Numeric IDs
session:a1b2c3d4e5f6     # String session IDs

# BAD: Mixed formats
cache:user:1234
cache:user:uuid-here
cache:user:jane@email
```

## Key Categories
| Prefix | Purpose | TTL |
|--------|---------|-----|
| cache: | Cached data | Always set (5m-24h) |
| session: | User sessions | Match session timeout |
| lock: | Distributed locks | Short (5-30s) |
| ratelimit: | Rate limiting | Match window size |
| queue: | Job queues | No TTL (managed by consumer) |
| temp: | Temporary data | Always short TTL |

## Anti-Patterns
- Keys without namespaces (flat key space is unsearchable)
- Using KEYS command to find keys (use SCAN with patterns)
- Embedding large data in key names
- Cache keys without TTL (memory leak)

## Enforcement
Document the key naming convention in your project README. Use SCAN with patterns in monitoring to verify compliance.
