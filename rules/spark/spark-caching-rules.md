---
id: spark-caching-rules
stackId: spark
type: rule
name: DataFrame Caching and Persistence Rules
description: >-
  Cache Spark DataFrames strategically — cache only reused DataFrames, choose
  the right storage level, unpersist when done, and monitor memory usage to
  prevent spills.
difficulty: intermediate
globs:
  - '**/*.scala'
  - '**/*.py'
  - '**/spark-defaults.conf'
tags:
  - caching
  - persistence
  - memory-management
  - storage-levels
  - unpersist
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
  - scala
  - python
faq:
  - question: When should I cache a Spark DataFrame?
    answer: >-
      Cache when a DataFrame is reused in two or more operations AND computing
      it is expensive (complex joins, aggregations, or reading from external
      sources). Never cache DataFrames used only once — it wastes memory. Always
      call count() or another action after cache() to trigger materialization.
  - question: What is the difference between cache() and checkpoint() in Spark?
    answer: >-
      cache() stores the DataFrame in memory/disk but preserves the full lineage
      (computation graph). checkpoint() saves to reliable storage (HDFS/S3) and
      truncates the lineage. Use checkpoint() for iterative algorithms where
      lineage grows too long, causing stack overflow or performance degradation.
relatedItems:
  - spark-partitioning-rules
  - spark-config-standards
version: 1.0.0
lastUpdated: '2026-03-12'
---

# DataFrame Caching and Persistence Rules

## Rule
Only cache DataFrames that are reused multiple times in the same job. Always unpersist after use. Choose storage level based on data size and memory availability. Never cache everything.

## Storage Levels
| Level | Memory | Disk | Use Case |
|-------|--------|------|----------|
| MEMORY_ONLY | Yes | No | Fits in memory, fast access |
| MEMORY_AND_DISK | Yes | Spillover | Too large for memory |
| DISK_ONLY | No | Yes | Very large, reused |
| MEMORY_ONLY_SER | Serialized | No | Memory pressure |

## Good Examples
```python
from pyspark import StorageLevel

# Cache DataFrame reused in multiple operations
base_df = (
    spark.read.parquet("s3://data/events/")
    .filter(col("date") >= "2024-01-01")
    .select("user_id", "event_type", "timestamp", "value")
)
base_df.cache()
base_df.count()  # Trigger materialization

# Reuse cached DataFrame
summary = base_df.groupBy("event_type").agg(count("*"), sum("value"))
user_stats = base_df.groupBy("user_id").agg(count("*"))

# Unpersist when done
base_df.unpersist()

# Use MEMORY_AND_DISK for large DataFrames
large_df.persist(StorageLevel.MEMORY_AND_DISK)
```

```scala
// Checkpoint for iterative algorithms
spark.sparkContext.setCheckpointDir("s3://checkpoints/")
df.checkpoint()  // Breaks lineage, saves to reliable storage
```

## Bad Examples
```python
# BAD: Caching everything
df1.cache()
df2.cache()
df3.cache()  # Memory exhausted — spilling to disk everywhere

# BAD: Cache used only once
filtered = df.filter(col("type") == "A").cache()
filtered.write.parquet("output/")
# Cached but never reused — wasted memory

# BAD: Never unpersisting
for day in date_range:
    daily = spark.read.parquet(f"data/{day}").cache()
    process(daily)
    # Never unpersist — memory fills up over iterations
```

## Enforcement
- Monitor Spark UI Storage tab for cached DataFrames
- Alert when executor memory usage exceeds 80%
- Code review: verify every cache() has a corresponding unpersist()
- Log cache hit/miss ratios for optimization
