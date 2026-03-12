---
id: netlify-functions-setup
stackId: netlify
type: skill
name: Build Serverless APIs with Netlify Functions
description: >-
  Create serverless API endpoints with Netlify Functions — TypeScript setup,
  request handling, environment variables, background functions, and scheduled
  tasks.
difficulty: intermediate
tags:
  - netlify-functions
  - serverless
  - api
  - typescript
  - background-functions
  - scheduled-functions
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
prerequisites:
  - Netlify site
  - Node.js 18+
  - TypeScript (recommended)
faq:
  - question: How do I create a Netlify Function?
    answer: >-
      Create a TypeScript file in your functions directory (default:
      netlify/functions/). Export a handler function that receives an event and
      context, and returns an object with statusCode, headers, and body. The
      function is accessible at /.netlify/functions/{filename}.
  - question: What is the timeout for Netlify Functions?
    answer: >-
      Regular Netlify Functions have a 10-second timeout (26 seconds on Pro).
      For longer tasks, use background functions which run for up to 15 minutes
      and return a 202 response immediately. Scheduled functions also support
      the extended 15-minute timeout.
  - question: Can I use TypeScript with Netlify Functions?
    answer: >-
      Yes. Install @netlify/functions for type definitions and set node_bundler
      to esbuild in netlify.toml. Netlify automatically compiles TypeScript
      during the build process. You get full type safety for event, context, and
      response objects.
relatedItems:
  - netlify-functions-specialist
  - netlify-deployment-specialist
  - netlify-redirects-config
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Build Serverless APIs with Netlify Functions

## Overview
Netlify Functions let you deploy serverless API endpoints alongside your static site. They run on AWS Lambda, support TypeScript, and integrate with Netlify's build pipeline. Use them for form processing, API proxying, webhooks, and server-side logic.

## Why This Matters
- **No server management** — deploy functions alongside your frontend
- **Auto-scaling** — handles traffic spikes without configuration
- **TypeScript support** — full type safety in serverless functions
- **Built-in features** — background functions, scheduled tasks, event triggers

## How It Works

### Step 1: Project Setup
```bash
npm install @netlify/functions
mkdir -p netlify/functions
```

```toml
# netlify.toml
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

### Step 2: Create a Basic Function
```typescript
// netlify/functions/hello.ts
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event, context) => {
  const name = event.queryStringParameters?.name || "World";

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: `Hello, ${name}!` }),
  };
};

export { handler };
// Accessible at: /.netlify/functions/hello?name=Dev
```

### Step 3: Handle POST Requests
```typescript
// netlify/functions/contact.ts
import type { Handler } from "@netlify/functions";

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, message } = JSON.parse(event.body || "{}");

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Send email, save to database, etc.
    await sendEmail({ name, email, message });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

export { handler };
```

### Step 4: Background Function (Long-Running)
```typescript
// netlify/functions/process-image-background.ts
import type { BackgroundHandler } from "@netlify/functions";

const handler: BackgroundHandler = async (event) => {
  // Runs for up to 15 minutes
  // Returns 202 immediately, processes in background
  const { imageUrl } = JSON.parse(event.body || "{}");
  await processImage(imageUrl);
  await updateDatabase(imageUrl, "processed");
};

export { handler };
```

### Step 5: Scheduled Function (Cron)
```typescript
// netlify/functions/daily-digest.ts
import { schedule } from "@netlify/functions";

export const handler = schedule("0 9 * * *", async (event) => {
  // Runs every day at 9:00 AM UTC
  await sendDailyDigestEmail();
  return { statusCode: 200 };
});
```

## Best Practices
- Use esbuild bundler for faster builds and smaller bundles
- Return proper HTTP status codes (400 for bad input, 500 for errors)
- Set CORS headers for browser-accessible endpoints
- Use environment variables for API keys and secrets
- Use background functions for tasks exceeding 10-second timeout
- Add input validation before processing requests

## Common Mistakes
- Not handling different HTTP methods (GET vs POST)
- Missing error handling (unhandled exceptions return 502)
- Importing unused heavy dependencies (inflates bundle size)
- Not parsing event.body as JSON (it is a string)
- Forgetting to set Content-Type header on responses
