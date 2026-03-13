---
id: temporal-activity-patterns
stackId: temporal
type: skill
name: Temporal Activity Design Patterns
description: >-
  Design robust Temporal activities — idempotent operations, heartbeat
  reporting, timeout configuration, retry policies with backoff, and
  compensation logic for saga patterns.
difficulty: beginner
tags:
  - temporal
  - activity
  - design
  - patterns
  - api
  - design-patterns
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Temporal Activity Design Patterns skill?"
    answer: >-
      Design robust Temporal activities — idempotent operations, heartbeat
      reporting, timeout configuration, retry policies with backoff, and
      compensation logic for saga patterns. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does Temporal Activity Design Patterns require?"
    answer: >-
      Works with standard temporal tooling (relevant CLI tools and
      frameworks). Review the setup section in the skill content for specific
      configuration steps.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
