---
id: temporal-signal-query
stackId: temporal
type: skill
name: Temporal Signals & Queries
description: >-
  Implement Temporal signals and queries — sending external events to running
  workflows, querying workflow state without side effects, and building
  interactive long-running processes.
difficulty: intermediate
tags:
  - signals
  - queries
  - external-events
  - workflow-interaction
  - condition
  - temporal
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - typescript
  - go
prerequisites:
  - Temporal SDK
  - Basic workflow knowledge
faq:
  - question: What is the difference between Temporal signals and queries?
    answer: >-
      Signals send data INTO a running workflow and can change its state (e.g.,
      approve an order, cancel a process). Queries read data FROM a running
      workflow without changing it (e.g., get current status, check progress).
      Signals are events; queries are inspections. Signals are recorded in
      history; queries are not.
  - question: How does a Temporal workflow wait for an external event?
    answer: >-
      Use the condition() function: 'await condition(() => approved ||
      cancelled, timeout)'. This pauses the workflow until the condition becomes
      true (set by a signal handler) or the timeout expires. The workflow
      consumes no resources while waiting — it is completely suspended until a
      signal arrives or the timer fires.
relatedItems:
  - temporal-workflow-architect
  - temporal-activity-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Temporal Signals & Queries

## Overview
Signals send data INTO a running workflow (external events). Queries read data FROM a running workflow (state inspection). Together they make workflows interactive — external systems can influence workflow execution and monitor progress in real time.

## Why This Matters
- Workflows often need to wait for external events (approvals, payments, user input)
- Operations teams need to inspect workflow state without affecting execution
- Signals enable event-driven workflow patterns without polling

## Implementation

### Step 1: Define Signals and Queries
```typescript
import { defineSignal, defineQuery } from "@temporalio/workflow";

// Signals: external events sent TO the workflow
export const approveOrderSignal = defineSignal<[{ approvedBy: string; notes: string }]>("approveOrder");
export const cancelOrderSignal = defineSignal("cancelOrder");

// Queries: read workflow state (must be side-effect free)
export const getOrderStatusQuery = defineQuery<OrderStatus>("getOrderStatus");
export const getProgressQuery = defineQuery<{ step: string; percent: number }>("getProgress");
```

### Step 2: Handle Signals in Workflow
```typescript
import { setHandler, condition } from "@temporalio/workflow";

export async function orderApprovalWorkflow(order: Order): Promise<void> {
  let status: OrderStatus = "pending_approval";
  let approved = false;
  let cancelled = false;
  let approvalDetails: { approvedBy: string; notes: string } | null = null;

  // Register signal handlers
  setHandler(approveOrderSignal, (details) => {
    approved = true;
    approvalDetails = details;
    status = "approved";
  });

  setHandler(cancelOrderSignal, () => {
    cancelled = true;
    status = "cancelled";
  });

  // Register query handler
  setHandler(getOrderStatusQuery, () => status);

  // Wait for approval or cancellation (up to 24 hours)
  const signalReceived = await condition(
    () => approved || cancelled,
    "24h" // timeout
  );

  if (!signalReceived) {
    status = "timed_out";
    await sendNotification(order.requesterId, "Your order request has expired");
    return;
  }

  if (cancelled) {
    await sendNotification(order.requesterId, "Order was cancelled");
    return;
  }

  // Approved — proceed with fulfillment
  status = "processing";
  await fulfillOrder(order);
  status = "completed";
}
```

### Step 3: Send Signals from External Code
```typescript
import { Client } from "@temporalio/client";

const client = new Client();

// Send approval signal to a running workflow
const handle = client.workflow.getHandle("order-workflow-123");
await handle.signal(approveOrderSignal, {
  approvedBy: "manager@company.com",
  notes: "Approved for Q1 budget",
});

// Send cancellation signal
await handle.signal(cancelOrderSignal);

// Query workflow state (does not affect workflow)
const status = await handle.query(getOrderStatusQuery);
console.log("Current status:", status);
```

### Step 4: Signal with Start (Start-or-Signal Pattern)
```typescript
// Start a workflow or signal it if already running
await client.workflow.signalWithStart("batchProcessorWorkflow", {
  workflowId: "daily-batch",
  taskQueue: "batch-processing",
  signal: addItemSignal,
  signalArgs: [{ itemId: "item-456" }],
  args: [{ batchSize: 100 }],
});
```

## Best Practices
- Queries must be pure functions — no side effects, no mutations, no activity calls
- Use condition() to wait for signals instead of busy-waiting or sleep
- Set timeouts on condition() to handle cases where signals never arrive
- Use signalWithStart for idempotent "start or add to batch" patterns
- Keep signal payloads small — they are stored in workflow history
- Handle unknown/unexpected signals gracefully (log and ignore)

## Common Mistakes
- Mutating state in query handlers (queries must be read-only)
- Not setting timeout on condition() (workflow waits forever)
- Sending large payloads via signals (stored in history, increases replay time)
- Not handling the case where a signal arrives after the workflow has progressed past that step
- Using sleep instead of condition() to wait for signals (wastes history events)
