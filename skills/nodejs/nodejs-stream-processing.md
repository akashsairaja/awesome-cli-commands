---
id: nodejs-stream-processing
stackId: nodejs
type: skill
name: Node.js Stream Processing Patterns
description: >-
  Master Node.js streams for processing large files, HTTP responses, and data
  pipelines efficiently without loading everything into memory.
difficulty: intermediate
tags:
  - nodejs
  - stream
  - processing
  - patterns
  - best-practices
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Node.js Stream Processing Patterns skill?"
    answer: >-
      Master Node.js streams for processing large files, HTTP responses, and
      data pipelines efficiently without loading everything into memory. This
      skill provides a structured workflow for server-side architecture, error
      handling, stream processing, and API development.
  - question: "What tools and setup does Node.js Stream Processing Patterns require?"
    answer: >-
      Requires pip/poetry installed. Works with Node.js projects. No
      additional configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
---

# Node.js Stream Processing Patterns

## Overview
Node.js streams process data in chunks, enabling you to handle gigabytes of data with minimal memory usage. This skill covers readable/writable/transform streams, pipelines, and real-world streaming patterns.

## Why This Matters
- **Memory efficiency** — process 10GB files with 64KB of memory
- **Time to first byte** — start processing before the entire payload arrives
- **Backpressure** — automatically slow producers when consumers can't keep up
- **Composability** — chain transforms like Unix pipes

## Stream Types
```javascript
import { Readable, Writable, Transform, pipeline } from 'node:stream';
import { pipeline as pipelineAsync } from 'node:stream/promises';
```

## Step 1: Read Large Files as Streams
```javascript
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

// Process a large file line by line
const rl = createInterface({
  input: createReadStream('large-file.csv'),
  crlfDelay: Infinity,
});

for await (const line of rl) {
  // Process each line — memory usage stays constant
  const [name, email] = line.split(',');
  await processUser({ name, email });
}
```

## Step 2: Transform Streams
```javascript
import { Transform } from 'node:stream';

const toUpperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

// Or use the simpler object mode
const parseCSV = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        this.push(line.split(','));
      }
    }
    callback();
  }
});
```

## Step 3: Pipeline for Safe Piping
```javascript
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';

// Compress a file with proper error handling and cleanup
await pipeline(
  createReadStream('input.log'),
  createGzip(),
  createWriteStream('input.log.gz')
);
// All streams are properly closed on success or error
```

## Step 4: HTTP Streaming Response
```javascript
import { createReadStream } from 'node:fs';

app.get('/download/:file', (req, res) => {
  const filePath = getValidatedPath(req.params.file);
  res.setHeader('Content-Type', 'application/octet-stream');

  const stream = createReadStream(filePath);
  stream.pipe(res);

  stream.on('error', (err) => {
    if (!res.headersSent) {
      res.status(500).json({ error: 'File read error' });
    }
    stream.destroy();
  });
});
```

## Best Practices
- Always use `pipeline()` from `node:stream/promises` instead of `.pipe()`
- Handle errors on every stream in the pipeline
- Use object mode for structured data (JSON objects, parsed records)
- Set `highWaterMark` to control chunk size and memory usage
- Use `for await...of` for simple consumption of readable streams
- Destroy streams explicitly when done to free resources

## Common Mistakes
- Using `.pipe()` without error handling (errors don't propagate)
- Reading entire files into memory with readFile when streaming would work
- Not handling backpressure (write returns false when buffer is full)
- Forgetting to end writable streams (call `.end()`)
