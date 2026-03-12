---
id: spark-submit-config
stackId: spark
type: skill
name: spark-submit Configuration Guide
description: >-
  Configure spark-submit for optimal job execution — resource allocation, deploy
  modes, packages, configuration properties, and submitting applications to
  YARN, Kubernetes, and standalone clusters.
difficulty: beginner
tags:
  - spark-submit
  - configuration
  - resource-allocation
  - deploy-mode
  - packages
  - yarn
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
prerequisites:
  - Apache Spark installed
  - Cluster access (YARN/K8s/standalone)
faq:
  - question: What is the difference between client and cluster deploy mode?
    answer: >-
      Client mode: driver runs on the submitting machine, logs visible in
      terminal, dies if you disconnect. Cluster mode: driver runs on a cluster
      node, survives disconnection, logs in YARN/cluster UI. Use client for
      debugging, cluster for production.
  - question: How do I choose executor memory and cores?
    answer: >-
      Rule of thumb: 4-8GB memory, 2-5 cores per executor. Too many cores cause
      GC contention. Too much memory causes long GC pauses. Start with 5 cores,
      8GB and adjust. Leave 1 core and 1GB per node for OS/YARN. Formula:
      (node_memory - 1GB) / num_executors_per_node.
  - question: How do I add Python dependencies to a Spark job?
    answer: >-
      Use --py-files for .py files or .zip archives: spark-submit --py-files
      mylib.zip app.py. For pip packages, create a virtual environment, zip
      site-packages, and pass with --py-files. Or use conda/venv with
      spark.pyspark.python config pointing to the venv Python binary.
relatedItems:
  - spark-performance-tuning
  - spark-sql-queries
  - spark-data-engineer
version: 1.0.0
lastUpdated: '2026-03-12'
---

# spark-submit Configuration Guide

## Overview
spark-submit is the gateway to running Spark applications. Master its configuration options to properly allocate resources, set deploy modes, and pass configuration properties for optimal job execution.

## Why This Matters
- **Performance** — proper resource allocation prevents OOM and waste
- **Reliability** — correct deploy mode ensures job resilience
- **Flexibility** — configuration properties tune behavior per job
- **Portability** — same application runs on YARN, K8s, or standalone

## How It Works

### Step 1: Basic Submission
```bash
# Local mode (development)
spark-submit app.py
spark-submit --master local[4] app.py    # 4 cores
spark-submit --master local[*] app.py    # all cores

# YARN cluster mode (production)
spark-submit --master yarn --deploy-mode cluster app.py

# YARN client mode (interactive debugging)
spark-submit --master yarn --deploy-mode client app.py

# With arguments
spark-submit --master yarn app.py --input /data/raw --output /data/processed
```

### Step 2: Resource Allocation
```bash
# Executor resources
spark-submit \
  --master yarn \
  --deploy-mode cluster \
  --num-executors 10 \
  --executor-memory 4g \
  --executor-cores 2 \
  --driver-memory 2g \
  --driver-cores 2 \
  app.py

# Memory overhead (for native memory)
spark-submit \
  --conf spark.executor.memoryOverhead=1g \
  --conf spark.driver.memoryOverhead=512m \
  app.py

# Dynamic allocation (auto-scale executors)
spark-submit \
  --conf spark.dynamicAllocation.enabled=true \
  --conf spark.dynamicAllocation.minExecutors=2 \
  --conf spark.dynamicAllocation.maxExecutors=50 \
  --conf spark.shuffle.service.enabled=true \
  app.py
```

### Step 3: Dependencies & Packages
```bash
# Maven packages
spark-submit \
  --packages org.apache.spark:spark-avro_2.12:3.5.0 \
  app.py

# Multiple packages
spark-submit \
  --packages "org.apache.spark:spark-avro_2.12:3.5.0,io.delta:delta-spark_2.12:3.1.0" \
  app.py

# Local JAR files
spark-submit \
  --jars /path/to/custom.jar,/path/to/other.jar \
  app.py

# Python files
spark-submit \
  --py-files utils.zip,helpers.py \
  app.py

# Extra files (configs, data)
spark-submit \
  --files app.conf,lookup.csv \
  app.py
```

### Step 4: Configuration Properties
```bash
# Common configurations
spark-submit \
  --conf spark.sql.shuffle.partitions=200 \
  --conf spark.sql.adaptive.enabled=true \
  --conf spark.sql.adaptive.coalescePartitions.enabled=true \
  --conf spark.serializer=org.apache.spark.serializer.KryoSerializer \
  --conf spark.eventLog.enabled=true \
  --conf spark.eventLog.dir=hdfs:///spark-logs \
  --conf spark.ui.port=4050 \
  --conf spark.sql.sources.partitionOverwriteMode=dynamic \
  app.py

# YARN-specific
spark-submit \
  --queue production \
  --conf spark.yarn.maxAppAttempts=2 \
  --conf spark.yarn.submit.waitAppCompletion=true \
  app.py

# Properties file
spark-submit --properties-file spark-defaults.conf app.py
```

## Best Practices
- Use cluster mode in production (driver survives node failure)
- Enable AQE (adaptive query execution) on Spark 3.0+
- Enable event logging for post-mortem debugging
- Use Kryo serializer for 2-10x serialization speedup
- Set shuffle partitions based on data size (not default 200)

## Common Mistakes
- Default shuffle partitions (200) for all jobs (too few for big data)
- Client deploy mode in production (driver dies if submitter disconnects)
- No event logging (can't debug past jobs)
- Missing memory overhead config (native memory OOM)
- Not using dynamic allocation on shared clusters (resource waste)
