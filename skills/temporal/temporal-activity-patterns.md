---
id: temporal-activity-patterns
stackId: temporal
type: skill
name: Temporal Activity Design Patterns
description: >-
  Design robust Temporal activities — idempotent operations, heartbeat
  reporting, timeout configuration, retry policies with backoff, and
  compensation logic for saga patterns.
difficulty: intermediate
tags:
  - activities
  - retry-policy
  - heartbeat
  - saga-pattern
  - idempotent
  - temporal
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - typescript
  - go
prerequisites:
  - Temporal SDK
  - Basic Temporal concepts
faq:
  - question: What does it mean for a Temporal activity to be idempotent?
    answer: >-
      An idempotent activity produces the same result whether executed once or
      multiple times with the same input. Since Temporal retries failed
      activities, a payment activity must use an idempotency key to prevent
      double-charging. A database insert must use upsert or check-before-insert.
      Design every activity assuming it will be called more than once.
  - question: What is a heartbeat in Temporal activities?
    answer: >-
      A heartbeat is a periodic signal from a running activity to the Temporal
      server saying 'I am still working.' If no heartbeat is received within
      heartbeatTimeout, Temporal considers the activity stuck and schedules it
      on another worker. Heartbeats also report progress data and support
      graceful cancellation by checking ctx.heartbeat().
  - question: What is the saga pattern in Temporal?
    answer: >-
      The saga pattern manages distributed transactions by executing a series of
      steps with compensation logic for each. If step 3 fails, you run
      compensations for steps 2 and 1 in reverse order (e.g., refund payment,
      release inventory). Temporal makes sagas reliable because workflow state
      is durable — compensations run even if the worker crashes.
relatedItems:
  - temporal-workflow-architect
  - temporal-signal-query
  - temporal-testing
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Temporal Activity Design Patterns

## Overview
Activities are the building blocks of Temporal workflows — they perform the actual work (API calls, database operations, file processing). Designing activities correctly means they can be retried safely, report progress via heartbeats, and handle failures gracefully.

## Why This Matters
- Activities may be retried multiple times — they must be idempotent
- Without heartbeats, Temporal cannot detect stuck activities
- Wrong timeout configuration causes unnecessary retries or zombie activities

## Activity Patterns

### Step 1: Basic Activity with Retry Policy
```typescript
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";

const { processPayment, sendNotification } = proxyActivities<typeof activities>({
  startToCloseTimeout: "30s",
  retry: {
    initialInterval: "1s",
    backoffCoefficient: 2,
    maximumInterval: "30s",
    maximumAttempts: 5,
    nonRetryableErrorTypes: ["InvalidCardError", "InsufficientFundsError"],
  },
});

// Activity implementation
export async function processPayment(orderId: string, amount: number): Promise<string> {
  // Idempotency key ensures duplicate retries don't double-charge
  const idempotencyKey = `payment-${orderId}`;
  const result = await paymentGateway.charge({
    amount,
    idempotencyKey,
    currency: "USD",
  });
  return result.transactionId;
}
```

### Step 2: Long-Running Activity with Heartbeat
```typescript
import { Context } from "@temporalio/activity";

export async function processLargeFile(fileUrl: string): Promise<ProcessResult> {
  const ctx = Context.current();
  const records = await downloadRecords(fileUrl);
  let processed = 0;

  for (const record of records) {
    // Check if activity was cancelled
    ctx.heartbeat({ processed, total: records.length });

    await processRecord(record);
    processed++;
  }

  return { totalProcessed: processed };
}

// In workflow: configure heartbeat timeout
const { processLargeFile } = proxyActivities<typeof activities>({
  startToCloseTimeout: "2h",
  heartbeatTimeout: "30s", // Fail if no heartbeat for 30s
});
```

### Step 3: Saga Pattern with Compensation
```typescript
export async function orderFulfillmentWorkflow(order: Order): Promise<void> {
  const compensations: Array<() => Promise<void>> = [];

  try {
    // Step 1: Reserve inventory
    await reserveInventory(order.items);
    compensations.push(() => releaseInventory(order.items));

    // Step 2: Process payment
    const txnId = await processPayment(order.id, order.total);
    compensations.push(() => refundPayment(txnId));

    // Step 3: Ship order
    await createShipment(order.id, order.shippingAddress);
    // No compensation needed — shipment can't be un-shipped

  } catch (error) {
    // Execute compensations in reverse order
    for (const compensate of compensations.reverse()) {
      try {
        await compensate();
      } catch (compError) {
        // Log but continue compensating other steps
        console.error("Compensation failed:", compError);
      }
    }
    throw error;
  }
}
```

### Step 4: Parallel Activity Execution
```typescript
import { proxyActivities } from "@temporalio/workflow";

export async function enrichUserData(userId: string): Promise<UserProfile> {
  // Run independent activities in parallel
  const [profile, orders, preferences] = await Promise.all([
    getProfile(userId),
    getOrderHistory(userId),
    getPreferences(userId),
  ]);

  return { ...profile, orders, preferences };
}
```

## Best Practices
- Make every activity idempotent (use idempotency keys for external calls)
- Use heartbeats for activities running longer than 30 seconds
- Set non-retryable error types for business logic failures (insufficient funds)
- Configure separate retry policies per activity type
- Use compensation (saga) pattern instead of distributed transactions
- Execute independent activities in parallel with Promise.all
- Keep activity functions focused — one responsibility per activity

## Common Mistakes
- Not making activities idempotent (duplicate side effects on retry)
- Missing heartbeat on long-running activities (Temporal thinks they're stuck)
- Retrying non-retryable errors (invalid input, business rule violations)
- Too-short startToCloseTimeout (activity killed before finishing)
- Putting I/O code directly in the workflow function (breaks determinism)
