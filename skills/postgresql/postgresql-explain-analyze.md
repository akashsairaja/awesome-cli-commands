---
id: postgresql-explain-analyze
stackId: postgresql
type: skill
name: Reading EXPLAIN ANALYZE Like a Pro
description: >-
  Decode PostgreSQL EXPLAIN ANALYZE output — understand node types, costs,
  buffer usage, timing breakdowns, and common performance patterns to diagnose
  slow queries.
difficulty: intermediate
tags:
  - explain-analyze
  - query-plans
  - performance
  - diagnostics
  - postgresql
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - sql
prerequisites:
  - PostgreSQL 14+
  - Basic SQL knowledge
faq:
  - question: What is the difference between EXPLAIN and EXPLAIN ANALYZE in PostgreSQL?
    answer: >-
      EXPLAIN shows the query planner's estimated execution plan without running
      the query. EXPLAIN ANALYZE actually executes the query and shows real
      timing, row counts, and buffer usage. Always use ANALYZE for performance
      tuning — estimates can be wildly inaccurate.
  - question: What does Seq Scan mean in PostgreSQL EXPLAIN output?
    answer: >-
      Seq Scan (Sequential Scan) means PostgreSQL is reading every row in the
      table. On small tables (< 10K rows) this is normal and efficient. On large
      tables it usually indicates a missing index. Check the Filter line — if
      'Rows Removed by Filter' is high, an index on the filter column would
      help.
  - question: How do I tell if my PostgreSQL statistics are stale from EXPLAIN ANALYZE?
    answer: >-
      Compare the 'rows' estimate in the cost section with 'rows' in the actual
      section. If the estimate says rows=100 but actual shows rows=100000,
      statistics are stale. Run ANALYZE on the table to update them. Stale
      statistics cause the planner to choose bad join and scan strategies.
relatedItems:
  - postgresql-query-optimizer
  - postgresql-index-strategy
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Reading EXPLAIN ANALYZE Like a Pro

## Overview
EXPLAIN ANALYZE is PostgreSQL's most powerful diagnostic tool. It executes your query and shows exactly what the planner did — every scan, join, sort, and filter with actual timing and row counts. Learning to read it is the single most valuable PostgreSQL skill.

## How to Run It

### Step 1: Basic EXPLAIN ANALYZE
```sql
-- Always use ANALYZE (runs the query) + BUFFERS (shows I/O)
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, COUNT(o.id) as order_count
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.name
ORDER BY order_count DESC
LIMIT 10;
```

### Step 2: Read the Output Bottom-Up
```
Limit  (cost=1524.78..1524.80 rows=10 width=44) (actual time=12.456..12.460 rows=10 loops=1)
  ->  Sort  (cost=1524.78..1536.03 rows=4500 width=44) (actual time=12.454..12.456 rows=10 loops=1)
        Sort Key: (count(o.id)) DESC
        Sort Method: top-N heapsort  Memory: 26kB
        ->  HashAggregate  (cost=1402.50..1447.50 rows=4500 width=44) (actual time=11.890..12.150 rows=4500 loops=1)
              Group Key: u.name
              Buffers: shared hit=892 read=45
              ->  Hash Join  (cost=145.00..1357.50 rows=9000 width=40) (actual time=1.234..8.567 rows=9000 loops=1)
                    Hash Cond: (o.user_id = u.id)
                    ->  Seq Scan on orders o  (cost=0.00..819.00 rows=50000 width=12) (actual time=0.012..3.456 rows=50000 loops=1)
                          Buffers: shared hit=500
                    ->  Hash  (cost=100.00..100.00 rows=4500 width=36) (actual time=1.100..1.100 rows=4500 loops=1)
                          Buckets: 8192  Batches: 1  Memory Usage: 300kB
                          ->  Seq Scan on users u  (cost=0.00..100.00 rows=4500 width=36) (actual time=0.008..0.650 rows=4500 loops=1)
                                Filter: (status = 'active')
                                Rows Removed by Filter: 5500
                                Buffers: shared hit=392
Planning Time: 0.245 ms
Execution Time: 12.530 ms
```

### Step 3: Key Metrics to Check
```
actual time=START..END    -- Time in ms (START = first row, END = all rows)
rows=N                    -- Actual rows processed (compare to estimated)
loops=N                   -- How many times this node executed
Buffers: shared hit=N     -- Pages read from cache (good)
Buffers: shared read=N    -- Pages read from disk (slow)
Rows Removed by Filter    -- Rows scanned but discarded (high = needs index)
```

### Step 4: Common Node Types and What They Mean
```
Seq Scan          -- Full table scan (often means missing index)
Index Scan        -- Using index, fetching from table for each match
Index Only Scan   -- Using covering index, no table access (fastest)
Bitmap Index Scan -- Index scan for many rows, then table access in batch
Nested Loop       -- For each outer row, scan inner (good for small outer)
Hash Join         -- Build hash of smaller table, probe with larger (good for big joins)
Merge Join        -- Both inputs sorted, merge together (good for pre-sorted data)
Sort              -- Sorting results (check if index could avoid this)
```

## Best Practices
- Always compare estimated rows vs actual rows — large mismatches mean stale statistics
- Run ANALYZE on tables after bulk data changes to update statistics
- Look for Seq Scan on large tables — usually means missing index
- High "Rows Removed by Filter" means the index is not selective enough
- Check Buffers: shared read vs hit — high reads mean cold cache or dataset larger than RAM
- Use EXPLAIN (ANALYZE, BUFFERS, VERBOSE) for maximum detail

## Common Mistakes
- Using EXPLAIN without ANALYZE (only shows estimates, not actuals)
- Ignoring the loops count (actual cost = time x loops)
- Blaming the wrong node (the innermost slow node is the bottleneck)
- Not checking for implicit casts that prevent index usage
