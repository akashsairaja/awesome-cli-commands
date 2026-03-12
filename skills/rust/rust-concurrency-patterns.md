---
id: rust-concurrency-patterns
stackId: rust
type: skill
name: Rust Concurrency & Async with Tokio
description: >-
  Build concurrent Rust applications with threads, channels, and async/await
  using Tokio — task spawning, shared state, message passing, and async I/O
  patterns.
difficulty: advanced
tags:
  - concurrency
  - async
  - tokio
  - threads
  - channels
  - fearless-concurrency
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - rust
prerequisites:
  - Rust 1.75+
  - Tokio 1.x
  - Understanding of ownership
faq:
  - question: What is fearless concurrency in Rust?
    answer: >-
      Fearless concurrency means Rust's type system prevents data races at
      compile time. The Send and Sync marker traits ensure only thread-safe
      types are shared across threads. If your code compiles, it is free from
      data races — a guarantee no other systems language provides without a
      garbage collector.
  - question: When should I use threads vs async in Rust?
    answer: >-
      Use async (Tokio) for I/O-bound work — network requests, database queries,
      file operations. Async handles thousands of concurrent tasks with minimal
      threads. Use std::thread for CPU-bound work — data processing,
      cryptography, image manipulation. Use tokio::spawn_blocking to bridge CPU
      work into an async context.
  - question: What is the difference between std Mutex and Tokio Mutex?
    answer: >-
      std::sync::Mutex blocks the thread while waiting for the lock — fine for
      short critical sections in sync code. tokio::sync::Mutex is async-aware —
      it yields the task while waiting, allowing other tasks to run. Always use
      tokio::sync::Mutex in async code to prevent blocking the runtime.
relatedItems:
  - rust-error-handling-patterns
  - rust-ownership-patterns
  - rust-cargo-essentials
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Rust Concurrency & Async with Tokio

## Overview
Rust guarantees thread safety at compile time through its ownership system. The type system prevents data races, making concurrent programming safer than in any other systems language. Tokio is the standard async runtime for I/O-bound workloads.

## Why This Matters
- **Fearless concurrency** — data races are compile-time errors
- **Zero-cost abstractions** — async/await compiles to efficient state machines
- **Thread safety by default** — Send/Sync traits enforce safe data sharing
- **Performance** — Tokio handles millions of concurrent connections

## Step 1: Threads and Channels
```rust
use std::sync::mpsc;
use std::thread;

fn parallel_processing() {
    let (tx, rx) = mpsc::channel();

    // Spawn worker threads
    for i in 0..4 {
        let tx = tx.clone();
        thread::spawn(move || {
            let result = expensive_computation(i);
            tx.send((i, result)).unwrap();
        });
    }
    drop(tx); // Close sender — rx.iter() will end

    for (id, result) in rx {
        println!("Worker {id}: {result}");
    }
}
```

## Step 2: Shared State with Arc<Mutex<T>>
```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn shared_counter() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final count: {}", *counter.lock().unwrap());
}
```

## Step 3: Async with Tokio
```rust
use tokio;

#[tokio::main]
async fn main() {
    // Spawn concurrent tasks
    let handle1 = tokio::spawn(fetch_url("https://api.example.com/users"));
    let handle2 = tokio::spawn(fetch_url("https://api.example.com/posts"));

    let (users, posts) = tokio::try_join!(handle1, handle2).unwrap();
    println!("Users: {users:?}, Posts: {posts:?}");
}

async fn fetch_url(url: &str) -> Result<String, reqwest::Error> {
    let response = reqwest::get(url).await?;
    response.text().await
}
```

## Step 4: Tokio Channels
```rust
use tokio::sync::mpsc;

async fn worker_pool() {
    let (tx, mut rx) = mpsc::channel(100); // Buffered channel

    // Spawn producer
    tokio::spawn(async move {
        for i in 0..50 {
            tx.send(i).await.unwrap();
        }
    });

    // Consume messages
    while let Some(msg) = rx.recv().await {
        println!("Received: {msg}");
    }
}
```

## Step 5: Select for Multiple Futures
```rust
use tokio::select;
use tokio::time::{sleep, Duration};

async fn with_timeout() {
    select! {
        result = fetch_data() => {
            println!("Got data: {result:?}");
        }
        _ = sleep(Duration::from_secs(5)) => {
            println!("Timeout!");
        }
    }
}
```

## Best Practices
- Use `Arc<T>` for shared ownership across threads
- Use `Mutex<T>` for shared mutable state (keep locks short)
- Prefer channels for communication over shared state
- Use `tokio::spawn` for async tasks, `std::thread` for CPU work
- Use `tokio::select!` for racing futures with timeouts
- Never block the async runtime with sync code (use `spawn_blocking`)

## Common Mistakes
- Holding a Mutex lock across an await point (deadlock risk)
- Using std::sync::Mutex in async code (use tokio::sync::Mutex)
- Blocking the Tokio runtime with CPU-intensive work
- Not using Arc when sharing data across spawned tasks
