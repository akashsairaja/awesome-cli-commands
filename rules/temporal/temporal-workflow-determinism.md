---
id: temporal-workflow-determinism
stackId: temporal
type: rule
name: Temporal Workflow Determinism Rules
description: >-
  Enforce deterministic workflow code in Temporal — no I/O in workflows, no
  random values, no current time access, no threading, and proper use of
  Temporal's deterministic APIs.
difficulty: intermediate
globs:
  - '**/workflows/**'
  - '**/workflow.ts'
  - '**/workflow.go'
tags:
  - determinism
  - replay
  - workflows
  - non-deterministic
  - versioning
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
  - java
  - python
faq:
  - question: Why must Temporal workflow code be deterministic?
    answer: >-
      Temporal replays workflow code from event history to restore state after
      crashes or worker restarts. If the code produces different results on
      replay (due to random values, current time, or I/O), the replay fails with
      a non-determinism error. Deterministic code ensures the same sequence of
      events produces the same workflow state every time.
  - question: >-
      What happens if I accidentally add non-deterministic code to a Temporal
      workflow?
    answer: >-
      Running workflow instances will fail with a NonDeterminismError when
      Temporal tries to replay them. The workflow becomes stuck and cannot make
      progress. Fix by: (1) reverting the non-deterministic change, or (2) using
      patched()/getVersion() to branch between old and new code paths, allowing
      existing workflows to complete while new ones use the updated logic.
relatedItems:
  - temporal-workflow-architect
  - temporal-activity-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Temporal Workflow Determinism Rules

## Rule
All Temporal workflow functions MUST be deterministic. No I/O, no randomness, no system time, no threading in workflow code. Use activities for all non-deterministic operations.

## Format
Workflow code produces the same result when replayed from event history. Any non-deterministic operation breaks replay.

## Requirements

### 1. No I/O in Workflow Code
```typescript
// BAD: HTTP call in workflow (non-deterministic)
export async function myWorkflow() {
  const data = await fetch("https://api.example.com/data"); // BREAKS REPLAY
}

// GOOD: I/O in an activity
export async function myWorkflow() {
  const data = await fetchData("https://api.example.com/data"); // Activity call
}
```

### 2. No Random Values in Workflow Code
```typescript
// BAD: Non-deterministic random
export async function myWorkflow() {
  const id = Math.random().toString(36); // Different on replay!
  const uuid = crypto.randomUUID();       // Different on replay!
}

// GOOD: Use Temporal's deterministic UUID
import { uuid4 } from "@temporalio/workflow";
export async function myWorkflow() {
  const id = uuid4(); // Deterministic across replays
}
```

### 3. No Current Time in Workflow Code
```typescript
// BAD: System time changes on replay
export async function myWorkflow() {
  const now = new Date();     // Different on replay!
  const ts = Date.now();      // Different on replay!
}

// GOOD: Temporal workflow time (deterministic)
import { sleep } from "@temporalio/workflow";
export async function myWorkflow() {
  // Use sleep for time-based logic
  await sleep("5m");

  // If you need current time, pass it via activity or signal
}
```

### 4. No Mutation of External State
```typescript
// BAD: Global state mutation
let counter = 0;
export async function myWorkflow() {
  counter++; // Shared state, non-deterministic with multiple workflows
}

// GOOD: Local workflow state only
export async function myWorkflow() {
  let counter = 0; // Local to this workflow instance
  counter++;
}
```

### 5. Use getVersion for Workflow Code Changes
```typescript
import { patched } from "@temporalio/workflow";

export async function myWorkflow(order: Order) {
  if (patched("add-validation-step")) {
    // New code path (new workflow executions)
    await validateOrder(order);
  }
  // Original code path (existing workflow executions continue here)
  await processOrder(order);
}
```

## Anti-Patterns
- fetch(), axios, fs calls in workflow code
- Math.random() or crypto.randomUUID() in workflows
- new Date() or Date.now() in workflows
- Global/shared mutable state between workflow instances
- Changing workflow code without versioning (breaks running instances)

## Enforcement
Use Temporal's replay testing to verify determinism. Add determinism checks to code review checklist for all workflow code changes.
