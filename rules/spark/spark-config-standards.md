---
id: spark-config-standards
stackId: spark
type: rule
name: Spark Configuration Standards
description: >-
  Configure Spark applications properly — memory allocation, executor sizing,
  shuffle settings, and serialization to maximize performance and prevent
  out-of-memory failures.
difficulty: advanced
globs:
  - '**/*.scala'
  - '**/*.py'
  - '**/spark-defaults.conf'
  - '**/spark-submit*'
tags:
  - configuration
  - memory
  - executors
  - shuffle
  - performance-tuning
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
  - question: How should I size Spark executors?
    answer: >-
      Use 4-5 cores per executor with 8GB memory as a starting point. Avoid
      large executors (>64GB) due to GC overhead. Avoid single-core executors
      due to per-executor overhead. Calculate: total_cores / 4 =
      number_of_executors. Adjust based on data volume and Spark UI metrics (GC
      time, spill).
  - question: What is Adaptive Query Execution and should I enable it?
    answer: >-
      AQE (spark.sql.adaptive.enabled=true) automatically optimizes queries at
      runtime: coalescing shuffle partitions, handling skewed joins, and
      switching join strategies. Always enable it in Spark 3.x+ — it eliminates
      most manual partition tuning and skew handling with zero configuration.
relatedItems:
  - spark-partitioning-rules
  - spark-caching-rules
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Spark Configuration Standards

## Rule
Every Spark application MUST have explicit memory, executor, and shuffle configuration. Never rely on defaults for production workloads. Size executors based on data volume and cluster capacity.

## Key Configuration
| Property | Purpose | Guideline |
|----------|---------|-----------|
| spark.executor.memory | Executor heap | 4-8GB typical |
| spark.executor.cores | Cores per executor | 4-5 cores |
| spark.executor.memoryOverhead | Off-heap | 10% of executor.memory |
| spark.sql.shuffle.partitions | Shuffle partitions | 2-4x total cores |
| spark.serializer | Serialization | KryoSerializer |
| spark.sql.adaptive.enabled | AQE | true (always) |

## Good Examples
```python
# spark-defaults.conf or SparkSession config
spark = (
    SparkSession.builder
    .appName("daily-etl")
    .config("spark.executor.memory", "8g")
    .config("spark.executor.cores", "4")
    .config("spark.executor.memoryOverhead", "1g")
    .config("spark.sql.shuffle.partitions", "400")
    .config("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
    .config("spark.sql.adaptive.enabled", "true")
    .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
    .config("spark.sql.adaptive.skewJoin.enabled", "true")
    .config("spark.sql.files.maxPartitionBytes", "128mb")
    .getOrCreate()
)
```

```bash
# spark-submit with explicit configuration
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  --executor-memory 8g \
  --executor-cores 4 \
  --num-executors 50 \
  --conf spark.sql.shuffle.partitions=400 \
  --conf spark.serializer=org.apache.spark.serializer.KryoSerializer \
  --conf spark.sql.adaptive.enabled=true \
  etl_job.py
```

## Bad Examples
```python
# BAD: No configuration — all defaults
spark = SparkSession.builder.appName("my-job").getOrCreate()
# Default 1g memory, 200 shuffle partitions — wrong for most workloads

# BAD: Too much memory per executor
spark.conf.set("spark.executor.memory", "64g")
# GC pauses become catastrophic — use more executors with less memory

# BAD: 1 core per executor
spark.conf.set("spark.executor.cores", "1")
# No parallelism within executor — wasteful overhead
```

## Enforcement
- Require configuration review for production job submissions
- Monitor Spark UI for GC time (>10% = memory pressure)
- Alert on spill to disk (indicates insufficient memory)
- Log and audit configuration for all production jobs
