---
id: mongodb-change-streams
stackId: mongodb
type: skill
name: MongoDB Change Streams for Real-Time Data
description: >-
  Implement MongoDB change streams to react to data changes in real time — watch
  collections, filter events, resume after failures, and build event-driven
  architectures.
difficulty: advanced
tags:
  - change-streams
  - real-time
  - event-driven
  - oplog
  - reactive
  - mongodb
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - javascript
  - typescript
prerequisites:
  - MongoDB 6.0+ (replica set or sharded cluster)
  - Node.js MongoDB driver
faq:
  - question: What are MongoDB change streams?
    answer: >-
      Change streams are a MongoDB feature that lets your application subscribe
      to real-time data changes (inserts, updates, deletes) without polling.
      They use the oplog internally, work with replica sets and sharded
      clusters, and support resumability — your app can pick up where it left
      off after a crash.
  - question: How do I handle change stream failures and restarts?
    answer: >-
      Persist the resume token (_id field) from each change event to durable
      storage (database, file, Redis). When restarting, pass the last resume
      token as resumeAfter in the watch() options. MongoDB will replay all
      changes from that point forward. Process changes idempotently since
      duplicates are possible.
relatedItems:
  - mongodb-schema-designer
  - mongodb-aggregation-pipeline
  - kafka-event-streaming
version: 1.0.0
lastUpdated: '2026-03-11'
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
