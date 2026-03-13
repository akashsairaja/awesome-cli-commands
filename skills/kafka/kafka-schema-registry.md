---
id: kafka-schema-registry
stackId: kafka
type: skill
name: >-
  Kafka Schema Registry & Schema Evolution
description: >-
  Implement Confluent Schema Registry for Kafka — Avro and Protobuf schema
  management, compatibility modes, schema evolution strategies, and
  producer/consumer integration.
difficulty: advanced
tags:
  - kafka
  - schema
  - registry
  - evolution
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the Kafka Schema Registry & Schema Evolution skill?"
    answer: >-
      Implement Confluent Schema Registry for Kafka — Avro and Protobuf schema
      management, compatibility modes, schema evolution strategies, and
      producer/consumer integration. This skill provides a structured workflow
      for development tasks.
  - question: "What tools and setup does Kafka Schema Registry & Schema Evolution require?"
    answer: >-
      Works with standard kafka tooling (relevant CLI tools and frameworks).
      Review the setup section in the skill content for specific configuration
      steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Kafka Schema Registry & Schema Evolution

## Overview
Schema Registry provides a centralized repository for Kafka message schemas. It enforces compatibility rules so producers and consumers can evolve independently without breaking each other. Without it, a schema change by one team breaks every consumer.

## Why This Matters
- Without schemas, producers can send anything — consumers break silently
- Schema evolution lets you add/remove fields without downtime
- Avro/Protobuf schemas are 5-10x more compact than JSON

## Implementation

### Step 1: Register a Schema
```bash
# Register an Avro schema for the "orders" topic
curl -X POST http://schema-registry:8081/subjects/orders-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{
    "schemaType": "AVRO",
    "schema": "{\"type\":\"record\",\"name\":\"Order\",\"fields\":[{\"name\":\"id\",\"type\":\"string\"},{\"name\":\"amount\",\"type\":\"double\"},{\"name\":\"customerId\",\"type\":\"string\"},{\"name\":\"createdAt\",\"type\":\"long\",\"logicalType\":\"timestamp-millis\"}]}"
  }'
```

### Step 2: Set Compatibility Mode
```bash
# BACKWARD (default): New schema can read old data
# FORWARD: Old consumers can read new data
# FULL: Both backward and forward compatible
# NONE: No compatibility checks

curl -X PUT http://schema-registry:8081/config/orders-value \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d '{"compatibility": "BACKWARD"}'
```

### Step 3: Evolve the Schema Safely
```json
// Version 1: Original schema
{
  "type": "record",
  "name": "Order",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "customerId", "type": "string"}
  ]
}

// Version 2: Add optional field (BACKWARD compatible)
{
  "type": "record",
  "name": "Order",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "amount", "type": "double"},
    {"name": "customerId", "type": "string"},
    {"name": "currency", "type": ["null", "string"], "default": null}
  ]
}
```

### Step 4: Producer with Schema Registry
```typescript
import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { Kafka } from "kafkajs";

const registry = new SchemaRegistry({ host: "http://schema-registry:8081" });
const kafka = new Kafka({ brokers: ["kafka:9092"] });
const producer = kafka.producer();

// Register or get existing schema
const schemaId = await registry.getLatestSchemaId("orders-value");

async function sendOrder(order: Order) {
  // Encode with schema — includes schema ID in the message
  const encodedValue = await registry.encode(schemaId, order);

  await producer.send({
    topic: "orders",
    messages: [{ key: order.id, value: encodedValue }],
  });
}
```

### Step 5: Consumer with Schema Registry
```typescript
await consumer.run({
  eachMessage: async ({ message }) => {
    // Decode automatically resolves schema from embedded ID
    const order = await registry.decode(message.value);
    console.log("Order:", order);
    // Works even if producer used a different schema version
  },
});
```

## Best Practices
- Use BACKWARD compatibility as default (new code reads old data)
- Always add new fields with default values (enables backward compatibility)
- Never remove required fields or change field types
- Use subject naming strategy: {topic}-key and {topic}-value
- Test schema compatibility before deploying: POST /compatibility/subjects/{subject}/versions/latest
- Use Avro for most cases, Protobuf for cross-language with gRPC

## Common Mistakes
- Not setting compatibility mode (defaults to BACKWARD but should be explicit)
- Adding required fields without defaults (breaks backward compatibility)
- Renaming fields (treated as remove + add, breaks compatibility)
- Not testing compatibility before deploying producer changes
- Using JSON Schema in production (no binary encoding, larger messages)
