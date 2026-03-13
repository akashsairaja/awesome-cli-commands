---
id: kafka-operations-specialist
stackId: kafka
type: agent
name: Kafka Operations Specialist
description: >-
  AI agent for Kafka cluster operations — broker configuration, topic
  management, consumer group monitoring, performance tuning, and disaster
  recovery planning.
difficulty: advanced
tags:
  - operations
  - monitoring
  - cluster-management
  - performance
  - disaster-recovery
  - kafka
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - bash
  - java
prerequisites:
  - Apache Kafka 3.0+
  - Linux administration
  - JVM basics
faq:
  - question: How do I monitor Kafka consumer lag?
    answer: >-
      Use kafka-consumer-groups.sh --describe --group <group-name> to see
      current lag per partition. For continuous monitoring, use tools like
      Burrow, Kafka Exporter + Prometheus + Grafana, or Confluent Control
      Center. Alert when lag exceeds your SLA threshold (e.g., > 10000
      messages or growing for more than 5 minutes).
  - question: What causes Kafka consumer rebalancing and how do I fix it?
    answer: >-
      Rebalancing occurs when consumers join/leave the group, or when a consumer
      fails to call poll() within max.poll.interval.ms. Fixes: increase
      max.poll.interval.ms, reduce max.poll.records for faster processing, use
      static group membership (group.instance.id) to avoid rebalance on
      restarts, and use cooperative sticky assignment for incremental rebalancing.
  - question: Should I use ZooKeeper or KRaft for a new Kafka cluster?
    answer: >-
      Always use KRaft mode for new clusters. ZooKeeper support was removed in
      Kafka 4.0 (released March 2025). KRaft simplifies operations by
      eliminating the separate ZooKeeper ensemble, reduces metadata propagation
      latency, and improves partition scaling limits. Existing ZooKeeper clusters
      should plan migration to KRaft.
relatedItems:
  - kafka-event-architect
  - kafka-consumer-patterns
  - kafka-connect-cdc
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Kafka Operations Specialist

Running Kafka in production means operating a distributed system where broker health, consumer lag, partition balance, and replication state must be continuously monitored and tuned. A single misconfigured broker can cause cascading rebalances. An unnoticed growing consumer lag becomes a data processing outage. This agent handles the full operational lifecycle — from cluster deployment and capacity planning through day-to-day monitoring, incident response, and disaster recovery.

## KRaft Mode Cluster Deployment

Kafka 4.0 removed ZooKeeper entirely. All new clusters run in KRaft mode, where a subset of brokers serve as controllers managing cluster metadata. A production KRaft deployment needs at least 3 controller nodes for quorum:

```properties
# server.properties — KRaft controller+broker combined mode (small clusters)
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093
controller.listener.names=CONTROLLER
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
log.dirs=/var/kafka/data

# Replication and durability
default.replication.factor=3
min.insync.replicas=2
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
```

For larger clusters (10+ brokers), separate controller and broker roles onto dedicated nodes. Controllers handle metadata operations and should not compete with brokers for disk I/O and network bandwidth:

```properties
# Dedicated controller node
process.roles=controller
node.id=100
controller.quorum.voters=100@ctrl-1:9093,101@ctrl-2:9093,102@ctrl-3:9093

# Dedicated broker node
process.roles=broker
node.id=1
controller.quorum.voters=100@ctrl-1:9093,101@ctrl-2:9093,102@ctrl-3:9093
```

## Topic Management and Partition Strategy

Topic configuration directly impacts throughput, ordering, and consumer scalability. Get the partition count right at creation — increasing partitions later breaks key-based ordering for compacted topics:

```bash
# Create a topic with explicit configuration
kafka-topics.sh --bootstrap-server kafka-1:9092 \
  --create --topic orders \
  --partitions 12 \
  --replication-factor 3 \
  --config min.insync.replicas=2 \
  --config retention.ms=604800000 \       # 7 days
  --config cleanup.policy=delete \
  --config max.message.bytes=1048576       # 1 MB

# Describe a topic including partition assignments
kafka-topics.sh --bootstrap-server kafka-1:9092 \
  --describe --topic orders

# Alter retention on an existing topic
kafka-configs.sh --bootstrap-server kafka-1:9092 \
  --alter --entity-type topics --entity-name orders \
  --add-config retention.ms=259200000     # 3 days
```

Partition count heuristics: target 10-20 MB/s throughput per partition. For a topic receiving 200 MB/s, allocate at least 10-20 partitions. More partitions improve consumer parallelism but increase end-to-end latency and memory overhead on brokers. For most workloads, 6-24 partitions per topic is the practical range.

## Consumer Group Monitoring

Consumer lag is the primary health indicator for Kafka consumers. Growing lag means consumers are falling behind — either processing is too slow, there are too few consumers, or partitions are unevenly distributed:

```bash
# Check consumer group status and lag per partition
kafka-consumer-groups.sh --bootstrap-server kafka-1:9092 \
  --describe --group order-processor

# Output columns: TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG  CONSUMER-ID  HOST
# Look for: LAG growing over time, empty CONSUMER-ID (unassigned partitions)

# List all consumer groups
kafka-consumer-groups.sh --bootstrap-server kafka-1:9092 --list

# Check group state (Stable, Rebalancing, Empty, Dead)
kafka-consumer-groups.sh --bootstrap-server kafka-1:9092 \
  --describe --group order-processor --state
```

Set up alerting on three conditions: lag exceeding a threshold (e.g., >10,000 messages), lag growing continuously for more than 5 minutes, and consumer group state not `Stable`. A group stuck in `Rebalancing` for more than 2 minutes indicates a problem.

## Rebalancing Prevention

Consumer rebalances are the most common cause of Kafka processing stalls. During a rebalance, all consumers in the group stop processing while partitions are redistributed. Modern Kafka provides several mechanisms to minimize rebalance impact:

**Static group membership** eliminates rebalances from consumer restarts (rolling deployments, scaling events):

```properties
# Consumer configuration — static membership
group.instance.id=order-processor-1    # Unique per consumer instance
session.timeout.ms=300000              # 5 min — allows time for rolling restart
heartbeat.interval.ms=10000
```

When a consumer with a `group.instance.id` disconnects, the group coordinator waits for `session.timeout.ms` before triggering a rebalance. If the same instance ID reconnects within that window, it reclaims its partitions with zero rebalance.

**Cooperative sticky assignment** enables incremental rebalancing where consumers only stop processing the specific partitions being moved, not all partitions:

```properties
# Use cooperative sticky assignor (default in Kafka 3.1+)
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor
```

**Poll interval tuning** prevents rebalances caused by slow message processing:

```properties
# If processing a batch takes > max.poll.interval.ms, consumer is kicked out
max.poll.interval.ms=600000       # 10 min — for heavy processing
max.poll.records=100              # Smaller batches = faster poll() return
```

## Broker Performance Tuning

Broker configuration balances throughput, latency, and durability. These are the parameters with the most operational impact:

```properties
# Network and I/O threads
num.network.threads=8             # Handles network requests (default: 3)
num.io.threads=16                 # Handles disk I/O (default: 8)
num.replica.fetchers=4            # Parallel replication from leaders

# Socket buffers for high-throughput
socket.send.buffer.bytes=1048576        # 1 MB
socket.receive.buffer.bytes=1048576     # 1 MB
socket.request.max.bytes=104857600      # 100 MB

# Log flush — let the OS handle flushing for throughput
log.flush.interval.messages=10000
log.flush.interval.ms=1000

# Replication
replica.lag.time.max.ms=30000     # Time before follower is removed from ISR
replica.fetch.max.bytes=10485760  # 10 MB — increase for large messages
```

For disk configuration, use dedicated disks for each `log.dirs` entry. Kafka benefits from sequential I/O, and sharing a disk with the OS or other applications causes random I/O patterns that destroy throughput. SSDs are recommended for low-latency workloads; HDDs are acceptable for high-throughput streaming where latency tolerance is higher.

## Partition Reassignment

When adding brokers or rebalancing load, move partitions between brokers using the reassignment tool:

```bash
# Generate a reassignment plan for specific topics
kafka-reassign-partitions.sh --bootstrap-server kafka-1:9092 \
  --topics-to-move-json-file topics.json \
  --broker-list "1,2,3,4,5,6" \
  --generate > reassignment-plan.json

# Execute the reassignment (run during off-peak hours)
kafka-reassign-partitions.sh --bootstrap-server kafka-1:9092 \
  --reassignment-json-file reassignment-plan.json \
  --execute \
  --throttle 50000000  # 50 MB/s — prevent saturating network

# Monitor reassignment progress
kafka-reassign-partitions.sh --bootstrap-server kafka-1:9092 \
  --reassignment-json-file reassignment-plan.json \
  --verify
```

Always throttle reassignment to prevent replication traffic from starving production traffic. A 50 MB/s throttle on a 1 Gbps link leaves ample bandwidth for normal operations. Monitor ISR counts during reassignment — if ISR shrinks, reduce the throttle.

## Disaster Recovery

Kafka's replication handles broker failures within a cluster. Cross-datacenter disaster recovery requires additional tooling:

**MirrorMaker 2** replicates topics between clusters with automatic offset translation:

```properties
# MirrorMaker 2 configuration
clusters=primary,dr
primary.bootstrap.servers=kafka-primary-1:9092,kafka-primary-2:9092
dr.bootstrap.servers=kafka-dr-1:9092,kafka-dr-2:9092

# Replicate all topics except internal ones
primary->dr.enabled=true
primary->dr.topics=.*
primary->dr.topics.exclude=.*[\-.]internal,__.*

# Sync consumer group offsets for failover
primary->dr.sync.group.offsets.enabled=true
primary->dr.sync.group.offsets.interval.seconds=10
```

Test failover regularly. A DR plan that has never been tested is not a plan — it is a hypothesis. Verify that consumer group offsets are correctly translated and that consumers can resume processing on the DR cluster without data loss or duplication beyond your SLA tolerance.

## Key Metrics to Monitor

Track these metrics in Prometheus/Grafana or your monitoring platform:

| Metric | Alert Threshold | Indicates |
|---|---|---|
| Under-replicated partitions | > 0 for 5 min | Broker failure or network issue |
| ISR shrink rate | > 0 | Follower falling behind, data loss risk |
| Consumer lag | Growing for > 5 min | Processing bottleneck |
| Request queue size | > 100 | Broker overloaded |
| Log flush latency (99th pct) | > 500ms | Disk I/O bottleneck |
| Network handler idle % | < 20% | Network thread saturation |
| Active controller count | != 1 | Controller election issue |
