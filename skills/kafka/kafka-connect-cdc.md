---
id: kafka-connect-cdc
stackId: kafka
type: skill
name: Change Data Capture with Kafka Connect
description: >-
  Implement Change Data Capture (CDC) with Kafka Connect and Debezium — stream
  database changes to Kafka topics in real time for event-driven architectures
  and data pipelines.
difficulty: advanced
tags:
  - cdc
  - change-data-capture
  - debezium
  - kafka-connect
  - data-pipeline
  - kafka
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - typescript
  - java
  - bash
prerequisites:
  - Apache Kafka 3.0+
  - Kafka Connect
  - Debezium
  - PostgreSQL or MySQL
faq:
  - question: What is Change Data Capture (CDC) with Kafka?
    answer: >-
      CDC captures every INSERT, UPDATE, and DELETE from a database transaction
      log and streams them to Kafka topics in real time. Using Debezium with
      Kafka Connect, you get a reliable event stream of all data changes without
      modifying application code. Use cases include search index sync, analytics
      pipelines, and microservice event sourcing.
  - question: How does Debezium CDC work with PostgreSQL?
    answer: >-
      Debezium reads PostgreSQL's Write-Ahead Log (WAL) via logical replication.
      It creates a replication slot and publication, captures every change to
      configured tables, and produces Kafka messages with before/after states
      plus metadata. The process is non-intrusive — no triggers or application
      changes needed.
relatedItems:
  - kafka-event-architect
  - kafka-consumer-patterns
  - postgresql-migration-safety
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Change Data Capture with Kafka Connect

## Overview
Change Data Capture (CDC) streams every INSERT, UPDATE, and DELETE from your database to Kafka topics in real time. Using Kafka Connect with Debezium, you get a reliable event stream of all data changes without modifying application code or adding database triggers.

## Why This Matters
- No application code changes needed — reads the database transaction log
- Real-time data streaming (sub-second latency)
- Captures the complete change history (before and after values)
- Enables event-driven microservices, data lakes, and search index sync

## Implementation

### Step 1: Deploy Kafka Connect with Debezium
```yaml
# docker-compose.yml
services:
  kafka-connect:
    image: debezium/connect:2.5
    ports:
      - "8083:8083"
    environment:
      BOOTSTRAP_SERVERS: kafka:9092
      GROUP_ID: connect-cluster
      CONFIG_STORAGE_TOPIC: connect-configs
      OFFSET_STORAGE_TOPIC: connect-offsets
      STATUS_STORAGE_TOPIC: connect-status
```

### Step 2: Create a PostgreSQL CDC Connector
```bash
curl -X POST http://localhost:8083/connectors -H "Content-Type: application/json" -d '{
  "name": "postgres-cdc",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "dbz",
    "database.dbname": "myapp",
    "topic.prefix": "myapp",
    "table.include.list": "public.orders,public.customers",
    "plugin.name": "pgoutput",
    "slot.name": "debezium_slot",
    "publication.name": "debezium_pub",
    "snapshot.mode": "initial",
    "transforms": "route",
    "transforms.route.type": "org.apache.kafka.connect.transforms.RegexRouter",
    "transforms.route.regex": "myapp\\.public\\.(.*)",
    "transforms.route.replacement": "cdc.$1"
  }
}'
```

### Step 3: Consume CDC Events
```typescript
// CDC event structure from Debezium
interface CDCEvent {
  before: Record<string, any> | null;  // Previous state (null for INSERT)
  after: Record<string, any> | null;   // New state (null for DELETE)
  source: {
    version: string;
    connector: string;
    name: string;
    ts_ms: number;
    db: string;
    schema: string;
    table: string;
  };
  op: "c" | "u" | "d" | "r";  // create, update, delete, read (snapshot)
  ts_ms: number;
}

// Consumer processing CDC events
await consumer.run({
  eachMessage: async ({ topic, message }) => {
    const event: CDCEvent = JSON.parse(message.value.toString());

    switch (event.op) {
      case "c": // INSERT
        await syncToSearchIndex(event.after);
        break;
      case "u": // UPDATE
        await updateSearchIndex(event.after);
        break;
      case "d": // DELETE
        await removeFromSearchIndex(event.before);
        break;
    }
  },
});
```

### Step 4: Monitor Connector Health
```bash
# Check connector status
curl http://localhost:8083/connectors/postgres-cdc/status | jq

# Check for failed tasks
curl http://localhost:8083/connectors/postgres-cdc/tasks/0/status | jq

# Restart a failed task
curl -X POST http://localhost:8083/connectors/postgres-cdc/tasks/0/restart
```

## Best Practices
- Use initial snapshot mode for first-time setup, then switch to streaming
- Monitor connector lag and replication slot size in PostgreSQL
- Set up alerting for connector failures (tasks in FAILED state)
- Use Single Message Transforms (SMTs) to route and filter events
- Handle schema changes carefully — DDL changes may require connector restart
- Use tombstone events (null value) for compacted topic cleanup

## Common Mistakes
- Not monitoring replication slot size (PostgreSQL disk fills up if connector is down)
- Forgetting to handle the snapshot phase (op = "r" events)
- Not handling schema evolution in CDC events
- Running without error handling (one bad record stops the connector)
- Not setting up dead letter queue for Connect errors
