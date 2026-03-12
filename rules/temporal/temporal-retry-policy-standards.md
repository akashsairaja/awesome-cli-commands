---
id: temporal-retry-policy-standards
stackId: temporal
type: rule
name: Temporal Retry Policy Standards
description: >-
  Define retry policy standards for Temporal activities — backoff configuration,
  maximum attempts, non-retryable errors, and retry budget management for
  resilient workflows.
difficulty: intermediate
globs:
  - '**/workflows/**'
  - '**/activities/**'
tags:
  - retry-policy
  - backoff
  - error-handling
  - resilience
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
  - question: Why must I define nonRetryableErrorTypes in Temporal retry policies?
    answer: >-
      Without nonRetryableErrorTypes, Temporal retries ALL errors including
      business logic failures like 'insufficient funds' or 'invalid input'.
      Retrying these wastes resources and delays error reporting. Explicitly
      mark errors that cannot be fixed by retrying as non-retryable so they fail
      immediately and trigger compensations or alerts.
  - question: What is the backoff coefficient in Temporal retry policies?
    answer: >-
      The backoff coefficient multiplies the wait time between retries. With
      initialInterval=1s and coefficient=2: 1st retry waits 1s, 2nd waits 2s,
      3rd waits 4s, 4th waits 8s, capped at maximumInterval. This prevents
      overwhelming a failing service with immediate retries (thundering herd).
      Common values are 2-3.
relatedItems:
  - temporal-workflow-determinism
  - temporal-timeout-configuration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Temporal Retry Policy Standards

## Rule
All activities MUST have explicit retry policies with appropriate backoff, maximum attempts, and non-retryable error classification.

## Format
```typescript
retry: {
  initialInterval: "1s",
  backoffCoefficient: 2,
  maximumInterval: "1m",
  maximumAttempts: 5,
  nonRetryableErrorTypes: ["BusinessLogicError"],
}
```

## Requirements

### 1. Default Retry Policy
```typescript
// Standard retry policy for most activities
const defaultRetry = {
  initialInterval: "1s",
  backoffCoefficient: 2,
  maximumInterval: "30s",
  maximumAttempts: 5,
};
```

### 2. Retry Policies by Error Type
```typescript
// Transient errors: retry aggressively
const transientRetry = {
  initialInterval: "500ms",
  backoffCoefficient: 2,
  maximumInterval: "10s",
  maximumAttempts: 10,
};

// External API errors: retry with backoff
const apiRetry = {
  initialInterval: "2s",
  backoffCoefficient: 3,
  maximumInterval: "2m",
  maximumAttempts: 5,
};

// Infrastructure errors: retry longer
const infraRetry = {
  initialInterval: "5s",
  backoffCoefficient: 2,
  maximumInterval: "5m",
  maximumAttempts: 20,
};
```

### 3. Non-Retryable Errors (MUST define)
```typescript
const { processPayment } = proxyActivities({
  startToCloseTimeout: "30s",
  retry: {
    ...defaultRetry,
    nonRetryableErrorTypes: [
      "InvalidInputError",         // Bad data — retrying won't help
      "InsufficientFundsError",    // Business rule — needs human action
      "AuthorizationError",        // Permission issue — needs config fix
      "NotFoundError",             // Resource doesn't exist
      "DuplicateError",            // Already processed
    ],
  },
});
```

### 4. Activity Error Classification
```typescript
// In activity code: throw specific error types
import { ApplicationFailure } from "@temporalio/activity";

export async function processPayment(orderId: string, amount: number) {
  try {
    return await paymentGateway.charge(orderId, amount);
  } catch (error) {
    if (error.code === "INSUFFICIENT_FUNDS") {
      // Non-retryable: throw ApplicationFailure
      throw ApplicationFailure.nonRetryable(
        "Insufficient funds",
        "InsufficientFundsError",
        { orderId, amount }
      );
    }
    // Retryable: let the error propagate naturally
    throw error;
  }
}
```

## Retry Budget Guidelines
| Activity Type | Max Attempts | Initial Interval | Max Interval |
|---------------|-------------|-------------------|--------------|
| API call | 3-5 | 1-2s | 30s |
| Database | 5-10 | 500ms | 10s |
| File I/O | 3-5 | 1s | 30s |
| Email/SMS | 5-10 | 5s | 2m |
| Payment | 3 | 2s | 30s |

## Anti-Patterns
- No retry policy (activity fails permanently on first error)
- Retrying non-retryable errors (insufficient funds, invalid input)
- Too many retry attempts without maximum (retry for days)
- No backoff coefficient (hammering a failing service)
- Same retry policy for all activity types

## Enforcement
Define shared retry policy constants. Require nonRetryableErrorTypes for all payment and business-logic activities. Review retry configuration in PRs.
