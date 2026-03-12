---
id: python-async-patterns
stackId: python
type: skill
name: Python Async/Await Patterns with asyncio
description: >-
  Master Python async programming — asyncio event loop, TaskGroups for
  structured concurrency, async generators, and building high-performance
  I/O-bound applications.
difficulty: advanced
tags:
  - async-await
  - asyncio
  - taskgroup
  - concurrency
  - httpx
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - python
prerequisites:
  - Python 3.11+
  - httpx (for HTTP examples)
faq:
  - question: When should I use async/await in Python?
    answer: >-
      Use async/await for I/O-bound workloads — HTTP requests, database queries,
      file operations, WebSocket connections. Async Python handles thousands of
      concurrent I/O operations on a single thread. For CPU-bound work, use
      multiprocessing or concurrent.futures.ProcessPoolExecutor instead.
  - question: What is asyncio.TaskGroup and why should I use it?
    answer: >-
      TaskGroup (Python 3.11+) provides structured concurrency — all tasks in
      the group must complete before exiting the async with block. If any task
      raises an exception, all sibling tasks are cancelled. This prevents task
      leaks and makes error handling predictable, unlike asyncio.gather where
      errors can be silently swallowed.
  - question: Why should I use httpx instead of requests for async Python?
    answer: >-
      The requests library is synchronous — calling it in async code blocks the
      event loop and prevents other tasks from running. httpx provides both sync
      and async APIs with the same interface. Use httpx.AsyncClient for
      concurrent HTTP requests in async applications, with connection pooling
      and HTTP/2 support.
relatedItems:
  - python-type-annotations
  - python-packaging
  - python-testing-patterns
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Python Async/Await Patterns with asyncio

## Overview
Python's asyncio enables concurrent I/O operations on a single thread. With async/await syntax and structured concurrency (TaskGroup), you can handle thousands of concurrent network requests, database queries, and file operations efficiently.

## Why This Matters
- **Throughput** — handle thousands of concurrent I/O operations
- **Resource efficiency** — single thread, minimal memory per connection
- **Modern Python** — async is standard for web frameworks (FastAPI, Starlette)
- **Structured concurrency** — TaskGroup (3.11+) prevents goroutine-leak-style bugs

## Step 1: Basic Async Functions
```python
import asyncio

async def fetch_user(user_id: int) -> dict:
    # Simulate async I/O (database, HTTP, etc.)
    await asyncio.sleep(0.1)
    return {"id": user_id, "name": f"User {user_id}"}

async def main():
    user = await fetch_user(1)
    print(user)

asyncio.run(main())
```

## Step 2: Concurrent Execution with TaskGroup
```python
import asyncio

async def fetch_all_users(user_ids: list[int]) -> list[dict]:
    results = []

    async with asyncio.TaskGroup() as tg:
        for uid in user_ids:
            task = tg.create_task(fetch_user(uid))
            results.append(task)

    return [task.result() for task in results]

# All tasks complete or all are cancelled on error
users = asyncio.run(fetch_all_users([1, 2, 3, 4, 5]))
```

## Step 3: Semaphore for Rate Limiting
```python
import asyncio
import httpx

async def fetch_url(client: httpx.AsyncClient, sem: asyncio.Semaphore, url: str) -> str:
    async with sem:  # Limit concurrent requests
        response = await client.get(url)
        return response.text

async def crawl(urls: list[str], max_concurrent: int = 10) -> list[str]:
    sem = asyncio.Semaphore(max_concurrent)
    async with httpx.AsyncClient() as client:
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(fetch_url(client, sem, url)) for url in urls]
    return [t.result() for t in tasks]
```

## Step 4: Async Generators for Streaming
```python
import asyncio
from typing import AsyncGenerator

async def read_lines(filename: str) -> AsyncGenerator[str, None]:
    """Stream file lines without loading entire file into memory."""
    import aiofiles
    async with aiofiles.open(filename) as f:
        async for line in f:
            yield line.strip()

async def process_log():
    async for line in read_lines("server.log"):
        if "ERROR" in line:
            print(f"Found error: {line}")
```

## Step 5: Timeouts and Cancellation
```python
import asyncio

async def slow_operation():
    await asyncio.sleep(30)
    return "done"

async def main():
    # Timeout after 5 seconds
    try:
        async with asyncio.timeout(5.0):
            result = await slow_operation()
    except TimeoutError:
        print("Operation timed out")

    # Cancel a running task
    task = asyncio.create_task(slow_operation())
    await asyncio.sleep(1)
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print("Task was cancelled")
```

## Best Practices
- Use `asyncio.TaskGroup` (3.11+) instead of `asyncio.gather`
- Always use `asyncio.timeout()` on external calls
- Use `asyncio.Semaphore` to limit concurrent requests
- Use httpx instead of requests (async-native HTTP client)
- Never call blocking functions in async context (use `asyncio.to_thread()`)
- Use `async with` for async context managers (HTTP clients, DB connections)

## Common Mistakes
- Calling `requests.get()` in async code (blocks the event loop)
- Using `time.sleep()` instead of `asyncio.sleep()`
- Creating tasks without awaiting them (fire-and-forget leaks)
- Not handling CancelledError (prevents graceful shutdown)
