---
id: firebase-cloud-functions-standards
stackId: firebase
type: rule
name: Cloud Functions Code Standards
description: >-
  Enforce coding standards for Firebase Cloud Functions — TypeScript usage,
  error handling, idempotency, input validation, and region configuration
  requirements.
difficulty: intermediate
globs:
  - '**/functions/src/**/*.ts'
  - '**/functions/src/**/*.js'
tags:
  - cloud-functions
  - typescript
  - error-handling
  - idempotency
  - standards
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
faq:
  - question: Why must Firebase Cloud Functions event triggers be idempotent?
    answer: >-
      Firebase may deliver events more than once due to retries on failures or
      at-least-once delivery semantics. If your function creates an order on
      every trigger, a retry could create duplicate orders. Idempotent functions
      check if they have already processed an event before executing, making
      retries safe.
  - question: Should I use Cloud Functions v1 or v2?
    answer: >-
      Always use v2 for new functions. V2 runs on Cloud Run with better
      performance, concurrency support, larger instances, and longer timeouts.
      V1 is still supported but lacks these improvements. Import from
      'firebase-functions/v2/*' instead of 'firebase-functions'.
relatedItems:
  - firebase-cloud-functions
  - firebase-security-rules-standards
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Cloud Functions Code Standards

## Rule
All Firebase Cloud Functions MUST use TypeScript, handle errors properly, be idempotent for event triggers, validate inputs, and specify explicit regions.

## Format
```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";

// Always specify region
export const myFunction = onCall(
  { region: "us-east1", memory: "256MiB" },
  async (request) => {
    // Validate, process, return
  }
);
```

## Requirements

### TypeScript & v2 APIs
- Use Cloud Functions v2 (firebase-functions/v2/*) for all new functions
- Enable TypeScript strict mode
- Define explicit input/output types

### Error Handling
```typescript
export const processOrder = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }

  const { orderId } = request.data;
  if (!orderId || typeof orderId !== "string") {
    throw new HttpsError("invalid-argument", "orderId is required");
  }

  try {
    const result = await processOrderLogic(orderId);
    return { success: true, data: result };
  } catch (error) {
    logger.error("Order processing failed", { orderId, error });
    throw new HttpsError("internal", "Order processing failed");
  }
});
```

### Idempotency for Event Triggers
```typescript
export const onOrderCreated = onDocumentCreated(
  "orders/{orderId}",
  async (event) => {
    const orderId = event.params.orderId;

    // Check if already processed (idempotency)
    const processedRef = db.doc(`processed/${orderId}`);
    const processed = await processedRef.get();
    if (processed.exists) {
      logger.info("Already processed, skipping", { orderId });
      return;
    }

    // Process and mark as done
    await processOrder(event.data?.data());
    await processedRef.set({ processedAt: FieldValue.serverTimestamp() });
  }
);
```

### Region Configuration
- Always specify region explicitly
- Use the region closest to your Firestore database
- Use multi-region for globally distributed users

## Examples

### Good
- v2 functions with explicit TypeScript types
- Input validation with HttpsError for clear error messages
- Idempotent event triggers with deduplication checks
- Explicit region, memory, and timeout configuration

### Bad
- v1 function syntax (deprecated patterns)
- No input validation on callable functions
- Non-idempotent triggers (duplicate processing on retry)
- Default region (us-central1) when database is elsewhere

## Enforcement
Configure ESLint for functions directory.
Run function tests with Firebase Emulator in CI.
Review region configuration in deployment scripts.
