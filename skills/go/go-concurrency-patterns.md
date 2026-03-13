---
id: go-concurrency-patterns
stackId: go
type: skill
name: >-
  Go Concurrency with Goroutines & Channels
description: >-
  Build concurrent Go applications — goroutine lifecycle management, channel
  patterns (fan-in, fan-out, pipeline), context cancellation, worker pools,
  and preventing goroutine leaks.
difficulty: intermediate
tags:
  - go
  - concurrency
  - goroutines
  - channels
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
faq:
  - question: "When should I use the Go Concurrency with Goroutines & Channels skill?"
    answer: >-
      Build concurrent Go applications — goroutine lifecycle management,
      channel patterns (fan-in, fan-out, pipeline), context cancellation,
      worker pools, and preventing goroutine leaks. This skill provides a
      structured workflow for concurrency patterns, error handling, testing,
      and microservice development.
  - question: "What tools and setup does Go Concurrency with Goroutines & Channels require?"
    answer: >-
      Requires pip/poetry installed. Works with Go projects. No additional
      configuration needed beyond standard tooling.
version: "1.0.0"
lastUpdated: "2026-03-11"
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
