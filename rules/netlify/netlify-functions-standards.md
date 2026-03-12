---
id: netlify-functions-standards
stackId: netlify
type: rule
name: Netlify Functions Code Standards
description: >-
  Enforce coding standards for Netlify Functions — TypeScript usage, error
  handling, response formatting, CORS headers, and input validation
  requirements.
difficulty: intermediate
globs:
  - '**/netlify/functions/**/*.ts'
  - '**/netlify/functions/**/*.js'
tags:
  - netlify-functions
  - typescript
  - error-handling
  - standards
  - api
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
  - question: Should I use TypeScript for Netlify Functions?
    answer: >-
      Yes. TypeScript provides type safety for event, context, and response
      objects via @netlify/functions types. It catches common errors at compile
      time (missing fields, wrong status codes) and improves developer
      experience with autocomplete. Netlify compiles TypeScript automatically
      with esbuild.
  - question: How should I handle errors in Netlify Functions?
    answer: >-
      Wrap all async operations in try/catch blocks. Log errors with
      console.error (visible in Netlify function logs). Return appropriate HTTP
      status codes: 400 for bad input, 401 for unauthorized, 404 for not found,
      500 for internal errors. Always return JSON with a consistent structure.
relatedItems:
  - netlify-functions-specialist
  - netlify-functions-setup
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Netlify Functions Code Standards

## Rule
All Netlify Functions MUST use TypeScript, handle errors gracefully, validate inputs, and return consistent response formats.

## Format
```typescript
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  // 1. Validate HTTP method
  // 2. Parse and validate input
  // 3. Process request
  // 4. Return consistent response
};

export { handler };
```

## Requirements

### TypeScript
- Use `@netlify/functions` types for Handler, BackgroundHandler
- Enable strict mode in tsconfig
- Use esbuild bundler in netlify.toml

### Error Handling
```typescript
try {
  // Process request
  return { statusCode: 200, body: JSON.stringify({ data }) };
} catch (error) {
  console.error("Function error:", error);
  return {
    statusCode: 500,
    body: JSON.stringify({ error: "Internal server error" }),
  };
}
```

### Response Format
```typescript
// Always return consistent structure
return {
  statusCode: 200,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
  },
  body: JSON.stringify({
    success: true,
    data: result,
  }),
};
```

### Input Validation
```typescript
if (event.httpMethod !== "POST") {
  return { statusCode: 405, body: "Method Not Allowed" };
}

const body = JSON.parse(event.body || "{}");
if (!body.email || !body.name) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Missing required fields: email, name" }),
  };
}
```

## Examples

### Good
- TypeScript with proper type imports
- Try/catch wrapping all async operations
- Input validation before processing
- Consistent JSON response format with Content-Type header

### Bad
- JavaScript without types
- No error handling (unhandled rejections return 502)
- No input validation (crashes on malformed input)
- Inconsistent response formats across functions

## Enforcement
Configure ESLint rules for functions directory.
Add TypeScript strict mode to tsconfig.
Review function error handling in code reviews.
