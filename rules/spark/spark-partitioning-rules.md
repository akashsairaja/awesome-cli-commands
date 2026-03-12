---
id: spark-partitioning-rules
stackId: spark
type: rule
name: Data Partitioning Best Practices
description: >-
  Partition Spark DataFrames correctly — choose partition columns wisely, avoid
  data skew, set appropriate partition counts, and use repartition vs coalesce
  correctly.
difficulty: intermediate
globs:
  - '**/*.scala'
  - '**/*.py'
  - '**/spark-defaults.conf'
tags:
  - partitioning
  - repartition
  - coalesce
  - data-skew
  - performance
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
  - question: What is the difference between repartition and coalesce in Spark?
    answer: >-
      repartition performs a full shuffle to create the exact number of
      partitions — use it to increase partitions or hash-partition by a column.
      coalesce reduces partitions without a full shuffle by combining existing
      partitions — use it to reduce output files. Never use repartition(1) when
      coalesce(1) suffices.
  - question: How do I fix data skew in Spark partitioning?
    answer: >-
      Add a salt column (random number) to the skewed key, repartition on the
      salted key, perform the operation, then aggregate back. Alternatively, use
      broadcast joins if one side is small enough. Monitor the Spark UI — if one
      task takes 10x longer than others, you have a skew problem.
relatedItems:
  - spark-caching-rules
  - spark-config-standards
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Data Partitioning Best Practices

## Rule
Every Spark job MUST have intentional partitioning. Use 2-4x the number of cores for partition count. Avoid skewed partition keys. Use coalesce to reduce partitions, repartition to increase.

## Partition Count Guidelines
| Cluster Size | Recommended Partitions | Formula |
|-------------|----------------------|---------|
| 10 cores | 20-40 partitions | cores * 2-4 |
| 100 cores | 200-400 partitions | cores * 2-4 |
| 1000 cores | 2000-4000 partitions | cores * 2-4 |

## Good Examples
```python
# Repartition before expensive operations
df = (
    spark.read.parquet("s3://data/events/")
    .repartition(200, "user_id")  # Hash partition on join key
)

# Coalesce before writing (reduce small files)
(
    df.filter(col("date") == "2024-01-01")
    .coalesce(10)  # Reduce to 10 output files
    .write
    .mode("overwrite")
    .parquet("s3://output/filtered/")
)

# Partition on write for query performance
(
    df.write
    .partitionBy("year", "month")
    .mode("append")
    .parquet("s3://data/events_partitioned/")
)

# Check partition count
print(f"Partitions: {df.rdd.getNumPartitions()}")
```

```scala
// Repartition before join to align partitions
val users = spark.read.parquet("users/").repartition(200, col("user_id"))
val orders = spark.read.parquet("orders/").repartition(200, col("user_id"))
val joined = users.join(orders, "user_id")
```

## Bad Examples
```python
# BAD: Default partitions (often 200) regardless of data size
df = spark.read.parquet("s3://huge-dataset/")  # 200 partitions for 1TB?

# BAD: Repartition(1) for small output — use coalesce
df.repartition(1).write.parquet("output/")  # Full shuffle!
# Use: df.coalesce(1).write.parquet("output/")

# BAD: Skewed partition key
df.repartition("country")  # US partition is 100x larger than others

# BAD: Too many partitions on write
df.write.partitionBy("user_id").parquet("output/")
# Millions of user_ids = millions of tiny directories
```

## Enforcement
- Monitor partition sizes in Spark UI — flag partitions > 1GB
- Alert on tasks taking 10x longer than average (skew indicator)
- Set spark.sql.shuffle.partitions based on cluster size
