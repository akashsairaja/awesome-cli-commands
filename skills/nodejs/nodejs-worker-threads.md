---
id: nodejs-worker-threads
stackId: nodejs
type: skill
name: Node.js Worker Threads for CPU Tasks
description: >-
  Offload CPU-intensive operations to worker threads in Node.js — image
  processing, data transformation, cryptography, and parallel computation
  without blocking the event loop.
difficulty: advanced
tags:
  - worker-threads
  - parallel-processing
  - cpu-intensive
  - worker-pool
  - shared-memory
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
languages:
  - javascript
  - typescript
prerequisites:
  - Node.js 20+
  - Understanding of threading concepts
faq:
  - question: When should I use worker threads in Node.js?
    answer: >-
      Use worker threads for CPU-intensive tasks: image/video processing, data
      compression, cryptographic operations, large JSON parsing, machine
      learning inference, and complex mathematical computations. Do NOT use
      workers for I/O-bound tasks (HTTP requests, database queries) —
      async/await handles those efficiently on the main thread.
  - question: >-
      What is the difference between worker threads and child processes in
      Node.js?
    answer: >-
      Worker threads run in the same process, share memory via
      SharedArrayBuffer, and have lower startup overhead. Child processes run in
      separate OS processes with isolated memory. Use workers for CPU
      parallelism within your app; use child processes for running separate
      programs or when you need full process isolation.
  - question: How many worker threads should I create?
    answer: >-
      Match the number of workers to available CPU cores: os.cpus().length. For
      mixed I/O and CPU workloads, use fewer workers (cores - 1) to leave a core
      for the main event loop. Use a worker pool library like piscina or
      workerpool rather than managing workers manually.
relatedItems:
  - nodejs-stream-processing
  - nodejs-error-handling-patterns
  - nodejs-esm-migration
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Node.js Worker Threads for CPU Tasks

## Overview
Worker threads allow Node.js to run CPU-intensive JavaScript in parallel threads, keeping the main event loop responsive. Unlike child processes, worker threads share memory and have lower overhead.

## Why This Matters
- **Non-blocking** — heavy computation doesn't freeze your HTTP server
- **Shared memory** — use SharedArrayBuffer for zero-copy data transfer
- **Lower overhead** — lighter than child processes, no serialization cost for shared data
- **True parallelism** — utilize multiple CPU cores from a single Node.js process

## Step 1: Basic Worker Setup
```javascript
// main.js
import { Worker } from 'node:worker_threads';

function runWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {
      workerData: data,
    });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
    });
  });
}

const result = await runWorker({ numbers: [1, 2, 3, 4, 5] });
```

```javascript
// worker.js
import { parentPort, workerData } from 'node:worker_threads';

const sum = workerData.numbers.reduce((a, b) => a + b, 0);
parentPort.postMessage({ sum });
```

## Step 2: Worker Pool Pattern
```javascript
import { Worker } from 'node:worker_threads';
import { cpus } from 'node:os';

class WorkerPool {
  #workers = [];
  #queue = [];

  constructor(workerPath, poolSize = cpus().length) {
    for (let i = 0; i < poolSize; i++) {
      this.#addWorker(workerPath);
    }
  }

  #addWorker(workerPath) {
    const worker = new Worker(workerPath);
    worker.busy = false;
    worker.on('message', (result) => {
      worker.resolve(result);
      worker.busy = false;
      this.#processQueue();
    });
    worker.on('error', (err) => {
      worker.reject(err);
      worker.busy = false;
      this.#processQueue();
    });
    this.#workers.push(worker);
  }

  exec(data) {
    return new Promise((resolve, reject) => {
      const available = this.#workers.find(w => !w.busy);
      if (available) {
        available.busy = true;
        available.resolve = resolve;
        available.reject = reject;
        available.postMessage(data);
      } else {
        this.#queue.push({ data, resolve, reject });
      }
    });
  }

  #processQueue() {
    if (this.#queue.length === 0) return;
    const { data, resolve, reject } = this.#queue.shift();
    const available = this.#workers.find(w => !w.busy);
    if (available) {
      available.busy = true;
      available.resolve = resolve;
      available.reject = reject;
      available.postMessage(data);
    } else {
      this.#queue.unshift({ data, resolve, reject });
    }
  }

  async destroy() {
    await Promise.all(this.#workers.map(w => w.terminate()));
  }
}
```

## Step 3: SharedArrayBuffer for Zero-Copy
```javascript
// Share data between main thread and worker without copying
const shared = new SharedArrayBuffer(1024);
const view = new Int32Array(shared);

const worker = new Worker('./worker.js', {
  workerData: { shared }
});
// Worker can read/write the same memory — use Atomics for synchronization
```

## Best Practices
- Use a worker pool — don't create/destroy workers per request
- Match pool size to CPU cores: `os.cpus().length`
- Use SharedArrayBuffer for large data to avoid serialization
- Keep worker files focused — one responsibility per worker
- Handle worker crashes — recreate workers on unexpected exit
- Use `workerpool` or `piscina` npm packages for production worker pools

## Common Mistakes
- Creating a new worker for every request (expensive startup)
- Sending large data via postMessage (serialization overhead)
- Using workers for I/O-bound tasks (use async/await instead)
- Not terminating workers on application shutdown (memory leaks)
