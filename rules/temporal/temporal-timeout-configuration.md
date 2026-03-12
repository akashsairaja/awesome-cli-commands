---
id: temporal-timeout-configuration
stackId: temporal
type: rule
name: Temporal Timeout Configuration Standards
description: >-
  Enforce proper timeout settings for Temporal workflows and activities —
  execution timeouts, start-to-close timeouts, heartbeat timeouts, and
  schedule-to-close timeouts for reliable execution.
difficulty: intermediate
globs:
  - '**/workflows/**'
  - '**/activities/**'
tags:
  - timeouts
  - configuration
  - heartbeat
  - reliability
  - standards
  - temporal
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
  - tabnine
  - zed
languages:
  - typescript
  - go
faq:
  - question: What are the different Temporal activity timeouts?
    answer: >-
      Three timeouts: startToCloseTimeout is the max time for one activity
      attempt. scheduleToCloseTimeout is the max total time including all retry
      attempts. heartbeatTimeout is the max time between heartbeat calls (for
      detecting stuck activities). startToCloseTimeout is required; the others
      are optional but strongly recommended for production.
  - question: When should I use ContinueAsNew in Temporal?
    answer: >-
      Use ContinueAsNew when a workflow's event history approaches 50K events.
      ContinueAsNew completes the current workflow and starts a new one with
      fresh history but the same state. Common for long-running polling
      workflows, batch processors, and subscription-based workflows that run for
      weeks or months.
relatedItems:
  - temporal-workflow-determinism
  - temporal-activity-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Temporal Timeout Configuration Standards

## Rule
Every workflow and activity MUST have explicit timeout configuration. Never rely on defaults for production workloads.

## Format
```typescript
proxyActivities({
  startToCloseTimeout: "required",
  heartbeatTimeout: "required for long-running",
  scheduleToCloseTimeout: "optional but recommended",
});
```

## Requirements

### 1. Activity Timeouts
```typescript
// startToCloseTimeout: Max time for a single activity attempt
// scheduleToCloseTimeout: Max total time including retries
// heartbeatTimeout: Max time between heartbeats (detect stuck activities)

const { quickActivity } = proxyActivities({
  startToCloseTimeout: "30s",     // Quick API call
});

const { longActivity } = proxyActivities({
  startToCloseTimeout: "10m",     // File processing
  heartbeatTimeout: "30s",         // Must heartbeat every 30s
  scheduleToCloseTimeout: "1h",   // Total including retries
});

const { externalApiCall } = proxyActivities({
  startToCloseTimeout: "5s",      // Fast timeout for APIs
  retry: {
    maximumAttempts: 3,
    initialInterval: "1s",
  },
  scheduleToCloseTimeout: "30s",  // Total budget for all retries
});
```

### 2. Workflow Execution Timeout
```typescript
// Set at workflow start — prevents zombie workflows
await client.workflow.start(orderFulfillmentWorkflow, {
  workflowId: "order-123",
  taskQueue: "orders",
  workflowExecutionTimeout: "7d",  // Max workflow lifetime
  workflowRunTimeout: "24h",       // Max single run (before ContinueAsNew)
  args: [order],
});
```

### 3. Timeout Guidelines by Activity Type
```
Activity Type           startToClose   heartbeat    scheduleToClose
API call (fast)         5-10s          -            30s
API call (slow)         30-60s         -            5m
Database query          10-30s         -            2m
File processing         5-30m          30s          2h
Email/notification      10s            -            1m
External webhook        30s            -            5m
Data migration          1-4h           60s          8h
```

### 4. ContinueAsNew for Long-Running Workflows
```typescript
import { continueAsNew } from "@temporalio/workflow";

export async function longRunningWorkflow(state: WorkflowState): Promise<void> {
  // Process events until history gets large
  while (state.eventsProcessed < state.totalEvents) {
    await processNextBatch(state);
    state.eventsProcessed += 100;

    // Prevent history from growing too large (> 50K events)
    if (state.eventsProcessed % 10000 === 0) {
      await continueAsNew<typeof longRunningWorkflow>(state);
    }
  }
}
```

## Anti-Patterns
- No timeout on activities (run indefinitely if stuck)
- No workflow execution timeout (zombie workflows accumulate)
- Heartbeat timeout longer than startToClose (useless)
- Too-short timeouts causing unnecessary retries (wasted resources)
- Not using ContinueAsNew for workflows with large histories

## Enforcement
Require timeout configuration in code review for all activity proxy declarations. Alert on workflows exceeding 50K history events.
