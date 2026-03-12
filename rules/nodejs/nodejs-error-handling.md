---
id: nodejs-error-handling
stackId: nodejs
type: rule
name: Node.js Error Handling Patterns
description: >-
  Handle errors properly in Node.js — always catch promise rejections, use
  custom error classes, implement global error handlers, and never swallow
  errors silently.
difficulty: intermediate
globs:
  - '**/*.js'
  - '**/*.mjs'
  - '**/*.ts'
tags:
  - error-handling
  - async-errors
  - custom-errors
  - unhandled-rejection
  - express
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
  - javascript
faq:
  - question: Why should unhandled promise rejections crash the Node.js process?
    answer: >-
      An unhandled rejection means the application reached an unexpected state
      that was not anticipated in the code. Continuing to run in an unknown
      state can cause data corruption, security vulnerabilities, or cascade
      failures. Crashing and restarting (via process manager) is safer than
      running in a broken state.
  - question: What is the difference between operational and programmer errors?
    answer: >-
      Operational errors are expected runtime failures: network timeouts,
      invalid user input, file not found. Handle them gracefully with proper
      HTTP status codes. Programmer errors are bugs: undefined references, type
      errors, assertion failures. These should crash the process because the
      code is in an unexpected state.
relatedItems:
  - nodejs-esm-modules
  - nodejs-security-essentials
  - nodejs-env-management
version: 1.0.0
lastUpdated: '2026-03-12'
---

# Node.js Error Handling Patterns

## Rule
Every async operation MUST have error handling. Unhandled promise rejections MUST crash the process. Use custom error classes with status codes and operational/programmer error distinction.

## Format
```javascript
// Custom error class
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

## Good Examples
```javascript
// Custom error hierarchy
class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message, errors) {
    super(message, 400);
    this.errors = errors;
  }
}

// Async error handling in Express
app.get("/users/:id", async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id);
    if (!user) throw new NotFoundError("User", req.params.id);
    res.json(user);
  } catch (error) {
    next(error);  // Pass to error middleware
  }
});

// Global handlers
process.on("unhandledRejection", (reason) => {
  logger.fatal("Unhandled rejection", { reason });
  process.exit(1);  // Crash — state is unknown
});

process.on("uncaughtException", (error) => {
  logger.fatal("Uncaught exception", { error });
  process.exit(1);
});
```

## Bad Examples
```javascript
// BAD: Swallowing errors
try {
  await riskyOperation();
} catch (error) {
  // Silent catch — error disappears
}

// BAD: Generic error messages
throw new Error("Something went wrong");  // Useless for debugging

// BAD: No async error handling
app.get("/users", async (req, res) => {
  const users = await db.query("SELECT * FROM users");
  // If query fails, Express gets unhandled rejection
  res.json(users);
});
```

## Enforcement
- Use express-async-errors or wrapper for automatic next(error)
- Configure Node.js --unhandled-rejections=throw (default in v15+)
- ESLint: no-empty catch blocks
- Structured logging for all caught errors
