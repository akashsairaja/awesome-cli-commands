---
id: go-concurrency-patterns
stackId: go
type: skill
name: Go Concurrency with Goroutines & Channels
description: >-
  Build concurrent Go applications — goroutine lifecycle management, channel
  patterns (fan-in, fan-out, pipeline), context cancellation, worker pools, and
  preventing goroutine leaks.
difficulty: advanced
tags:
  - goroutines
  - channels
  - concurrency
  - worker-pool
  - context
  - fan-out
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
languages:
  - go
prerequisites:
  - Go 1.21+
  - Understanding of concurrency concepts
faq:
  - question: What is a goroutine and how is it different from a thread?
    answer: >-
      A goroutine is a lightweight thread managed by the Go runtime, not the OS.
      It starts with ~2KB of stack (vs ~1MB for OS threads) and the Go scheduler
      multiplexes thousands of goroutines onto a few OS threads. Start a
      goroutine with the 'go' keyword: go doWork(). They are cheap to create and
      destroy.
  - question: How do I prevent goroutine leaks in Go?
    answer: >-
      Every goroutine must have a defined exit path. Use context.Context with
      cancellation, done channels, or channel closure to signal goroutines to
      stop. Use sync.WaitGroup to wait for completion. Test with
      runtime.NumGoroutine() to verify goroutines are cleaned up. Always select
      on ctx.Done() in long-running goroutines.
  - question: What is the fan-out fan-in pattern in Go?
    answer: >-
      Fan-out distributes work from one channel to multiple goroutines for
      parallel processing. Fan-in merges results from multiple goroutines into a
      single channel. This pattern maximizes throughput for I/O-bound or
      CPU-bound work by utilizing multiple cores while keeping the consumer
      interface simple (one output channel).
relatedItems:
  - go-error-handling-patterns
  - go-testing-patterns
  - go-interface-design
version: 1.0.0
lastUpdated: '2026-03-11'
---

# Go Concurrency with Goroutines & Channels

## Overview
Go's concurrency model is built on goroutines (lightweight threads) and channels (typed communication pipes). The runtime multiplexes thousands of goroutines onto a small number of OS threads.

## Why This Matters
- **Lightweight** — goroutines use ~2KB of stack (vs ~1MB for OS threads)
- **Scalable** — handle millions of concurrent operations
- **Safe communication** — channels prevent data races by design
- **Built-in** — no threading library or async framework needed

## Step 1: Worker Pool
```go
func workerPool(ctx context.Context, jobs <-chan Job, results chan<- Result, numWorkers int) {
    var wg sync.WaitGroup
    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            for {
                select {
                case job, ok := <-jobs:
                    if !ok { return }
                    results <- process(job)
                case <-ctx.Done():
                    return
                }
            }
        }(i)
    }
    wg.Wait()
    close(results)
}
```

## Step 2: Fan-Out / Fan-In
```go
// Fan-out: distribute work to multiple goroutines
func fanOut(ctx context.Context, input <-chan int, numWorkers int) []<-chan int {
    channels := make([]<-chan int, numWorkers)
    for i := 0; i < numWorkers; i++ {
        channels[i] = worker(ctx, input)
    }
    return channels
}

// Fan-in: merge multiple channels into one
func fanIn(ctx context.Context, channels ...<-chan int) <-chan int {
    merged := make(chan int)
    var wg sync.WaitGroup

    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for {
                select {
                case v, ok := <-c:
                    if !ok { return }
                    select {
                    case merged <- v:
                    case <-ctx.Done(): return
                    }
                case <-ctx.Done(): return
                }
            }
        }(ch)
    }

    go func() { wg.Wait(); close(merged) }()
    return merged
}
```

## Step 3: Context for Cancellation
```go
func fetchWithTimeout(url string) ([]byte, error) {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
    if err != nil {
        return nil, err
    }

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("fetching %s: %w", url, err)
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}
```

## Step 4: Rate Limiter
```go
func rateLimitedFetch(ctx context.Context, urls []string, rps int) []Result {
    limiter := time.NewTicker(time.Second / time.Duration(rps))
    defer limiter.Stop()

    results := make([]Result, len(urls))
    for i, url := range urls {
        select {
        case <-limiter.C:
            results[i] = fetch(ctx, url)
        case <-ctx.Done():
            return results[:i]
        }
    }
    return results
}
```

## Best Practices
- Every goroutine must have a defined way to stop (context, done channel)
- Use `sync.WaitGroup` to wait for goroutine completion
- Close channels from the sender, never the receiver
- Use `select` with `ctx.Done()` for cancellable operations
- Run `go test -race` to detect data races
- Prefer channels for communication, sync.Mutex for shared state

## Common Mistakes
- Starting goroutines without a shutdown mechanism (goroutine leaks)
- Closing a channel from the receiver side (panic)
- Sending on a closed channel (panic)
- Not using context for cancellation propagation
- Using time.Sleep for synchronization
