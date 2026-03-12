---
id: spark-performance-tuning
stackId: spark
type: skill
name: Spark Performance Tuning
description: >-
  Optimize Spark job performance — partitioning strategies, caching, broadcast
  joins, shuffle optimization, adaptive query execution, and diagnosing
  bottlenecks with Spark UI.
difficulty: advanced
tags:
  - performance
  - partitioning
  - caching
  - joins
  - shuffle
  - spark-ui
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Apache Spark 3.0+
  - Access to Spark UI
faq:
  - question: How do I fix data skew in Spark?
    answer: >-
      Enable AQE skew join: spark.sql.adaptive.skewJoin.enabled=true. This
      automatically splits skewed partitions. Manual fixes: salt the join key
      (add random prefix), use broadcast join for small tables, filter out hot
      keys and process separately, or repartition with more partitions.
  - question: How many shuffle partitions should I use?
    answer: >-
      Target 128MB per partition. Formula: total_shuffle_data_size / 128MB. For
      100GB of shuffled data: ~800 partitions. With AQE enabled, set a high
      number (spark.sql.shuffle.partitions=1000) and let AQE coalesce small
      partitions automatically.
  - question: When should I cache a DataFrame?
    answer: >-
      Cache when: 1) The DataFrame is used in multiple actions (joins,
      aggregations, writes). 2) The DataFrame is expensive to compute (complex
      transformations). 3) The data fits in memory. Don't cache: one-time-use
      DataFrames, very large datasets, or DataFrames that change between uses.
relatedItems:
  - spark-submit-config
  - spark-sql-queries
  - spark-data-engineer
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Spark Performance Tuning

## Overview
Spark performance depends on partitioning, shuffles, joins, and caching. Learn to diagnose bottlenecks with Spark UI and apply targeted optimizations for 2-100x improvements.

## Why This Matters
- **Cost** — faster jobs use fewer cluster resources
- **SLAs** — meet data pipeline deadlines
- **Scale** — handle growing data without proportional resource increase
- **Debugging** — understand why jobs are slow

## How It Works

### Step 1: Partitioning
```bash
# Set shuffle partitions (key performance knob)
spark-submit --conf spark.sql.shuffle.partitions=200 app.py

# Rule of thumb: target 128MB per partition
# Data size / 128MB = number of partitions
# 100GB / 128MB ≈ 800 partitions

# Enable adaptive partitioning (Spark 3.0+)
spark-submit \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.adaptive.coalescePartitions.enabled=true \
  --conf spark.sql.adaptive.advisoryPartitionSizeInBytes=128MB \
  app.py

# In code: repartition for parallelism
# df.repartition(100)                    # hash repartition
# df.repartition(100, "date")            # repartition by column
# df.coalesce(10)                        # reduce partitions (no shuffle)
```

### Step 2: Caching
```bash
# Cache frequently accessed DataFrames
# df.cache()                             # MEMORY_AND_DISK
# df.persist(StorageLevel.MEMORY_ONLY)   # memory only
# df.persist(StorageLevel.DISK_ONLY)     # disk only

# Unpersist when no longer needed
# df.unpersist()

# Check cache usage
# spark.catalog.isCached("tableName")

# Configure memory fractions
spark-submit \
  --conf spark.memory.fraction=0.6 \
  --conf spark.memory.storageFraction=0.5 \
  app.py
```

### Step 3: Join Optimization
```bash
# Broadcast join (small table < 10MB)
spark-submit \
  --conf spark.sql.autoBroadcastJoinThreshold=10485760 \
  app.py

# In code:
# from pyspark.sql.functions import broadcast
# result = large_df.join(broadcast(small_df), "key")

# AQE auto-converts sort-merge to broadcast when runtime stats show small table
spark-submit \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.adaptive.localShuffleReader.enabled=true \
  app.py

# Skew join optimization (AQE)
spark-submit \
  --conf spark.sql.adaptive.skewJoin.enabled=true \
  --conf spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes=256MB \
  app.py
```

### Step 4: Shuffle Optimization
```bash
# Compress shuffle data
spark-submit \
  --conf spark.shuffle.compress=true \
  --conf spark.shuffle.spill.compress=true \
  app.py

# Kryo serialization (2-10x faster)
spark-submit \
  --conf spark.serializer=org.apache.spark.serializer.KryoSerializer \
  app.py

# Increase shuffle buffer
spark-submit \
  --conf spark.shuffle.file.buffer=64k \
  --conf spark.reducer.maxSizeInFlight=96m \
  app.py
```

### Step 5: Diagnosing with Spark UI
```bash
# Access Spark UI
# Running job: http://driver-host:4040
# History Server: http://history-host:18080

# Key metrics to check:
# 1. Stage timeline — look for stragglers (data skew)
# 2. Task duration distribution — wide spread = skew
# 3. Shuffle read/write size — excessive shuffle = repartition needed
# 4. GC time — > 10% = increase executor memory
# 5. Spill (memory/disk) — > 0 = increase memory or partitions

# Enable History Server
spark-submit \
  --conf spark.eventLog.enabled=true \
  --conf spark.eventLog.dir=hdfs:///spark-logs \
  app.py
```

## Best Practices
- Enable AQE on Spark 3.0+ (automatic optimization)
- Target 128MB per partition for optimal parallelism
- Use broadcast joins for tables under 10MB
- Cache only if data is reused more than once
- Use Kryo serializer for all production jobs
- Check Spark UI for every slow job (don't guess)

## Common Mistakes
- Caching everything (wastes memory, causes spills)
- Default 200 shuffle partitions for all data sizes
- Sort-merge join when broadcast join would work
- Not enabling AQE (free performance improvement)
- Ignoring data skew (one slow task blocks entire stage)
- Not using event logging (can't debug completed jobs)
