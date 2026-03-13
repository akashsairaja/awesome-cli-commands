---
id: bun-server-patterns
stackId: bun
type: skill
name: High-Performance HTTP Servers with Bun.serve
description: >-
  Build blazing-fast HTTP servers with Bun.serve — routing, WebSocket support,
  streaming responses, static file serving, and production configuration for
  maximum throughput.
difficulty: beginner
tags:
  - bun
  - high-performance
  - http
  - servers
  - bunserve
  - performance
  - api
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
faq:
  - question: "When should I use the High-Performance HTTP Servers with Bun.serve skill?"
    answer: >-
      Build blazing-fast HTTP servers with Bun.serve — routing, WebSocket
      support, streaming responses, static file serving, and production
      configuration for maximum throughput. This skill provides a structured
      workflow for development tasks.
  - question: "What tools and setup does High-Performance HTTP Servers with Bun.serve require?"
    answer: >-
      Works with standard bun tooling (relevant CLI tools and frameworks). No
      special setup required beyond a working bun environment.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# High-Performance HTTP Servers with Bun.serve

## Overview
Bun.serve() is Bun's native HTTP server, built on top of uWebSockets. It handles significantly more requests per second than Express on Node.js, with a simpler API based on Web Standards (Request/Response).

## Why This Matters
- **2-4x faster** than Express/Fastify on Node.js for HTTP handling
- **Web Standards** — uses native Request and Response objects
- **Built-in WebSockets** — native WebSocket support without ws package
- **Streaming** — native support for streaming responses
- **Zero dependencies** — no Express, no middleware packages needed

## Step 1: Basic Server
```typescript
Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Hello from Bun!");
    }

    if (url.pathname === "/api/health") {
      return Response.json({ status: "ok", uptime: process.uptime() });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running on http://localhost:3000");
```

## Step 2: File-Based Router
```typescript
const router = new Map<string, (req: Request) => Response | Promise<Response>>();

router.set("GET /api/users", async () => {
  const users = await db.query("SELECT * FROM users");
  return Response.json(users);
});

router.set("POST /api/users", async (req) => {
  const body = await req.json();
  const user = await db.insert("users", body);
  return Response.json(user, { status: 201 });
});

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    const key = `${req.method} ${url.pathname}`;
    const handler = router.get(key);
    if (handler) return handler(req);
    return new Response("Not Found", { status: 404 });
  },
});
```

## Step 3: WebSocket Support
```typescript
Bun.serve({
  port: 3000,
  fetch(req, server) {
    if (new URL(req.url).pathname === "/ws") {
      const upgraded = server.upgrade(req, {
        data: { connectedAt: Date.now() },
      });
      if (!upgraded) return new Response("Upgrade failed", { status: 500 });
      return undefined;
    }
    return new Response("Hello");
  },
  websocket: {
    open(ws) { console.log("Connected:", ws.data.connectedAt); },
    message(ws, message) { ws.send(`Echo: ${message}`); },
    close(ws) { console.log("Disconnected"); },
  },
});
```

## Step 4: Streaming Response
```typescript
Bun.serve({
  fetch(req) {
    const stream = new ReadableStream({
      async start(controller) {
        for (let i = 0; i < 10; i++) {
          controller.enqueue(`data: ${JSON.stringify({ count: i })}\n\n`);
          await Bun.sleep(100);
        }
        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/event-stream" },
    });
  },
});
```

## Best Practices
- Use Bun.serve() instead of Express for new Bun projects
- Return Response objects directly — no res.send() or res.json()
- Use Bun.file() for efficient static file serving
- Leverage built-in WebSocket support instead of ws package
- Use Bun.sleep() instead of setTimeout for delays

## Common Mistakes
- Importing Express when Bun.serve is simpler and faster
- Not handling errors in fetch handler (crashes the server)
- Using Node.js stream APIs instead of Web Streams
- Forgetting that fetch() must always return a Response
