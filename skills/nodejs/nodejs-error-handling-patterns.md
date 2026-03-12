---
id: nodejs-error-handling-patterns
stackId: nodejs
type: skill
name: Node.js Error Handling Patterns
description: >-
  Comprehensive error handling for Node.js applications — async/await try-catch,
  custom error classes, global handlers, Express middleware, and graceful
  shutdown.
difficulty: intermediate
tags:
  - error-handling
  - async-await
  - middleware
  - graceful-shutdown
  - custom-errors
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - javascript
  - typescript
prerequisites:
  - Node.js 18+
  - Express or similar HTTP framework
faq:
  - question: How should I handle errors in async Node.js functions?
    answer: >-
      Wrap async Express route handlers with an asyncHandler wrapper that
      catches rejected promises and forwards them to error middleware. Use
      custom error classes (AppError) with status codes and error codes. Always
      have global unhandledRejection and uncaughtException handlers as safety
      nets.
  - question: What is graceful shutdown in Node.js and why does it matter?
    answer: >-
      Graceful shutdown means stopping the server from accepting new
      connections, finishing in-flight requests, closing database connections,
      and then exiting. Without it, active requests get terminated mid-response,
      database connections leak, and data can be corrupted. Handle SIGTERM and
      SIGINT signals.
  - question: Should I use try-catch or .catch() for async error handling?
    answer: >-
      Use try-catch with async/await for sequential operations — it reads more
      naturally and handles both sync and async errors. Use .catch() when
      working with raw promises or when you need to handle errors from specific
      promise chains independently. In Express, use an async wrapper that calls
      .catch(next).
relatedItems:
  - nodejs-esm-migration
  - nodejs-stream-processing
  - nodejs-security-hardening
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Node.js Error Handling Patterns

## Overview
Proper error handling in Node.js prevents silent failures, provides meaningful error messages, and ensures applications shut down gracefully. This skill covers custom error classes, async error boundaries, and production-grade error infrastructure.

## Why This Matters
- **Reliability** — no more silent failures crashing production at 3 AM
- **Debugging** — structured errors with context speed up root cause analysis
- **User experience** — proper error responses instead of generic 500s
- **Observability** — errors flow to logging and monitoring systems

## Step 1: Custom Error Classes
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
```

## Step 2: Async Route Wrapper
```typescript
// Wrap async route handlers to catch rejected promises
const asyncHandler = (fn: Function) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));
```

## Step 3: Global Error Middleware
```typescript
app.use((err: Error, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn(err.message, { code: err.code, statusCode: err.statusCode });
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Unexpected errors — log full stack, return generic message
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});
```

## Step 4: Global Process Handlers
```typescript
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled promise rejection', { error: reason.message });
  // In production: trigger graceful shutdown
});

process.on('uncaughtException', (error: Error) => {
  logger.fatal('Uncaught exception — shutting down', { error: error.message });
  process.exit(1); // Must exit — state is potentially corrupted
});
```

## Step 5: Graceful Shutdown
```typescript
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal} — starting graceful shutdown`);
  server.close(async () => {
    await database.disconnect();
    await cache.quit();
    logger.info('Shutdown complete');
    process.exit(0);
  });
  // Force exit after timeout
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

## Best Practices
- Distinguish operational errors (expected) from programmer errors (bugs)
- Always log errors with structured context (request ID, user ID, action)
- Never expose stack traces to API consumers in production
- Set timeouts on all external calls (HTTP, database, cache)
- Use error codes (not just messages) for programmatic error handling

## Common Mistakes
- Catching errors silently (`catch (e) {}`)
- Not handling promise rejections (unhandledRejection crashes Node.js)
- Using try/catch around synchronous code that cannot throw
- Returning error details in production API responses (security risk)
