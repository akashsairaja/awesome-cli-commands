---
id: mongodb-change-streams
stackId: mongodb
type: skill
name: MongoDB Change Streams for Real-Time Data
description: >-
  Implement MongoDB change streams to react to data changes in real time —
  watch collections, filter events, resume after failures, and build
  event-driven architectures.
difficulty: beginner
tags:
  - mongodb
  - change
  - streams
  - real-time
  - data
  - architecture
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the MongoDB Change Streams for Real-Time Data skill?"
    answer: >-
      Implement MongoDB change streams to react to data changes in real time —
      watch collections, filter events, resume after failures, and build
      event-driven architectures. This skill provides a structured workflow
      for aggregation pipelines, index strategy, change streams, and schema
      design.
  - question: "What tools and setup does MongoDB Change Streams for Real-Time Data require?"
    answer: >-
      Requires pip/poetry installed. Works with MongoDB projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# MongoDB Change Streams for Real-Time Data

## Overview
Change streams let your application subscribe to real-time data changes in MongoDB. Instead of polling for updates, your code receives a push notification whenever documents are inserted, updated, deleted, or replaced. Built on the oplog, they work with replica sets and sharded clusters.

## Why This Matters
- Eliminates polling — instant notification of data changes
- Enables event-driven architectures (CQRS, event sourcing)
- Resumable after application restart — no missed events
- Works across replica sets and sharded clusters

## Implementation

### Step 1: Basic Change Stream
```javascript
const { MongoClient } = require("mongodb");

async function watchOrders() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db("myapp");
  const orders = db.collection("orders");

  const changeStream = orders.watch();

  changeStream.on("change", (change) => {
    console.log("Change detected:", change.operationType);
    console.log("Document:", change.fullDocument);
    console.log("Resume token:", change._id);
  });

  changeStream.on("error", (error) => {
    console.error("Change stream error:", error);
  });
}
```

### Step 2: Filter Specific Events
```javascript
// Only watch for specific operations and conditions
const pipeline = [
  { $match: {
    operationType: { $in: ["insert", "update"] },
    "fullDocument.status": "completed"
  }},
  { $project: {
    operationType: 1,
    "fullDocument.orderId": 1,
    "fullDocument.amount": 1,
    "fullDocument.customerId": 1
  }}
];

const changeStream = orders.watch(pipeline, {
  fullDocument: "updateLookup"  // Include full doc on updates
});
```

### Step 3: Resume After Failure
```javascript
let resumeToken = loadResumeTokenFromStorage(); // Your persistence layer

async function watchWithResume() {
  const options = resumeToken
    ? { resumeAfter: resumeToken, fullDocument: "updateLookup" }
    : { fullDocument: "updateLookup" };

  const changeStream = orders.watch([], options);

  changeStream.on("change", async (change) => {
    // Process the change
    await processOrderChange(change);

    // Persist resume token for crash recovery
    resumeToken = change._id;
    await saveResumeTokenToStorage(resumeToken);
  });
}
```

### Step 4: Watch Entire Database or Cluster
```javascript
// Watch all collections in a database
const dbChangeStream = db.watch();

// Watch entire cluster (all databases)
const clusterChangeStream = client.watch();

// Filter to specific collections
const pipeline = [
  { $match: {
    "ns.coll": { $in: ["orders", "payments", "shipments"] }
  }}
];
const filteredStream = db.watch(pipeline);
```

## Best Practices
- Always persist resume tokens to survive application restarts
- Use pipeline filters to reduce network traffic — watch only what you need
- Set maxAwaitTimeMS to control how long the server waits before returning empty batches
- Handle the "invalidate" event — it means the collection was dropped or renamed
- Use fullDocument: "updateLookup" for updates (otherwise you only get changed fields)
- Process changes idempotently — you may receive duplicates after resume

## Common Mistakes
- Not persisting resume tokens (miss events after restart)
- Watching without filters (processing every change in the collection)
- Not handling errors and reconnecting (change stream dies silently)
- Assuming exactly-once delivery (it is at-least-once)
- Using change streams without a replica set (they require oplog)
