---
id: temporal-testing
stackId: temporal
type: skill
name: Testing Temporal Workflows
description: >-
  Write comprehensive tests for Temporal workflows — unit testing with
  TestWorkflowEnvironment, mocking activities, testing signals and queries, and
  integration testing patterns.
difficulty: advanced
tags:
  - testing
  - unit-tests
  - mocking
  - time-skipping
  - integration-tests
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
  - Jest or Go testing framework
faq:
  - question: How do I test Temporal workflows without a running server?
    answer: >-
      Use TestWorkflowEnvironment from @temporalio/testing. It creates an
      in-memory Temporal server for testing. You can create a local environment
      (createLocal) for full testing or a time-skipping environment
      (createTimeSkipping) for testing timers and timeouts. Mock activities to
      isolate workflow logic.
  - question: How do I test Temporal workflow timeouts?
    answer: >-
      Use TestWorkflowEnvironment.createTimeSkipping() which lets you
      fast-forward time with testEnv.sleep('25h'). This skips the workflow timer
      without waiting in real time. Essential for testing timeout paths,
      scheduled activities, and expiration logic that would otherwise take hours
      or days to execute.
relatedItems:
  - temporal-workflow-architect
  - temporal-activity-patterns
  - temporal-signal-query
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Testing Temporal Workflows

## Overview
Temporal provides a test framework that runs workflows without a real server. You can mock activities, fast-forward time, simulate signals, and verify workflow behavior deterministically. Testing is critical because workflow bugs are hard to diagnose in production.

## Why This Matters
- Workflow bugs in production are hard to debug (replays, state, history)
- Time-dependent logic (timeouts, timers) needs deterministic testing
- Activity failures and retry behavior must be verified

## Testing Patterns

### Step 1: Basic Workflow Test
```typescript
import { TestWorkflowEnvironment } from "@temporalio/testing";
import { Worker } from "@temporalio/worker";
import { orderFulfillmentWorkflow } from "./workflows";
import * as activities from "./activities";

describe("orderFulfillmentWorkflow", () => {
  let testEnv: TestWorkflowEnvironment;

  beforeAll(async () => {
    testEnv = await TestWorkflowEnvironment.createLocal();
  });

  afterAll(async () => {
    await testEnv.teardown();
  });

  it("completes successfully with valid order", async () => {
    const { client, nativeConnection } = testEnv;

    const worker = await Worker.create({
      connection: nativeConnection,
      taskQueue: "test",
      workflowsPath: require.resolve("./workflows"),
      activities,
    });

    const result = await worker.runUntil(
      client.workflow.execute(orderFulfillmentWorkflow, {
        workflowId: "test-order-1",
        taskQueue: "test",
        args: [{ id: "order-1", items: [{ productId: "p1", quantity: 1 }], total: 99.99 }],
      })
    );

    expect(result).toBeDefined();
  });
});
```

### Step 2: Mock Activities
```typescript
it("handles payment failure with compensation", async () => {
  const mockActivities = {
    reserveInventory: async () => ({ reservationId: "res-1" }),
    processPayment: async () => { throw new Error("Payment declined"); },
    releaseInventory: async () => {},  // Compensation should be called
    refundPayment: async () => {},
  };

  const worker = await Worker.create({
    connection: nativeConnection,
    taskQueue: "test",
    workflowsPath: require.resolve("./workflows"),
    activities: mockActivities,
  });

  await expect(
    worker.runUntil(
      client.workflow.execute(orderFulfillmentWorkflow, {
        workflowId: "test-payment-fail",
        taskQueue: "test",
        args: [testOrder],
      })
    )
  ).rejects.toThrow("Payment declined");

  // Verify compensation was called
  // (In practice, use jest.fn() to verify calls)
});
```

### Step 3: Test Signals and Queries
```typescript
it("waits for approval signal", async () => {
  const worker = await Worker.create({
    connection: nativeConnection,
    taskQueue: "test",
    workflowsPath: require.resolve("./workflows"),
    activities,
  });

  // Start workflow
  const handle = await client.workflow.start(orderApprovalWorkflow, {
    workflowId: "test-approval",
    taskQueue: "test",
    args: [testOrder],
  });

  // Query initial state
  const status = await handle.query(getOrderStatusQuery);
  expect(status).toBe("pending_approval");

  // Send approval signal
  await handle.signal(approveOrderSignal, {
    approvedBy: "manager@test.com",
    notes: "Approved",
  });

  // Wait for completion
  const result = await worker.runUntil(handle.result());
  expect(result).toBeDefined();
});
```

### Step 4: Test Timeouts with Time Skipping
```typescript
it("times out after 24 hours without approval", async () => {
  // Use time-skipping test environment
  const testEnv = await TestWorkflowEnvironment.createTimeSkipping();

  // Start workflow and skip time forward
  const handle = await client.workflow.start(orderApprovalWorkflow, {
    workflowId: "test-timeout",
    taskQueue: "test",
    args: [testOrder],
  });

  // Skip 25 hours forward
  await testEnv.sleep("25h");

  const status = await handle.query(getOrderStatusQuery);
  expect(status).toBe("timed_out");
});
```

## Best Practices
- Test happy path, failure paths, timeout paths, and signal paths
- Use mock activities to isolate workflow logic from external dependencies
- Use time-skipping environment for testing timer and timeout behavior
- Test compensation (saga) execution order after failures
- Verify idempotency by running the same workflow twice
- Test workflow versioning by running old and new versions simultaneously

## Common Mistakes
- Not testing timeout and expiry paths (they happen in production)
- Testing only happy path (failures are the interesting cases)
- Not mocking activities (tests depend on external services)
- Not testing signal ordering (what if signal arrives before workflow is ready)
- Not cleaning up test environment (resource leaks between tests)
