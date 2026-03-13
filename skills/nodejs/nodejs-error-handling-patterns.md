---
id: nodejs-error-handling-patterns
stackId: nodejs
type: skill
name: Node.js Error Handling Patterns
description: >-
  Comprehensive error handling for Node.js applications — async/await
  try-catch, custom error classes, global handlers, Express middleware, and
  graceful shutdown.
difficulty: advanced
tags:
  - nodejs
  - error
  - handling
  - patterns
  - monitoring
  - debugging
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
faq:
  - question: "When should I use the Node.js Error Handling Patterns skill?"
    answer: >-
      Comprehensive error handling for Node.js applications — async/await
      try-catch, custom error classes, global handlers, Express middleware,
      and graceful shutdown. This skill provides a structured workflow for
      server-side architecture, error handling, stream processing, and API
      development.
  - question: "What tools and setup does Node.js Error Handling Patterns require?"
    answer: >-
      Works with standard Node.js tooling (Node.js runtime, npm/yarn/pnpm). No
      special setup required beyond a working Node.js backend environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
