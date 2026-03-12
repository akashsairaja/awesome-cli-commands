---
id: powershell-pipeline-optimization
stackId: powershell
type: skill
name: PowerShell Pipeline & Performance
description: >-
  Optimize PowerShell pipeline performance — streaming vs collecting,
  ForEach-Object -Parallel, Where-Object -FilterScript, avoiding common
  bottlenecks, and measuring execution time.
difficulty: intermediate
tags:
  - pipeline
  - performance
  - parallel
  - streaming
  - optimization
  - powershell
compatibility:
  - claude-code
  - cursor
  - copilot
  - codex
  - windsurf
  - amazon-q
  - aider
languages:
  - powershell
prerequisites:
  - PowerShell 7.0+
  - Basic pipeline concepts
faq:
  - question: How does ForEach-Object -Parallel work in PowerShell 7?
    answer: >-
      ForEach-Object -Parallel runs script blocks concurrently in separate
      runspaces. Each iteration runs in its own thread. Use -ThrottleLimit to
      control concurrency (default 5). Access variables from the calling scope
      with $using:variable. Best for I/O-bound tasks (network calls, disk
      operations). Not beneficial for CPU-bound work on single-core.
  - question: Why is += slow for building arrays in PowerShell?
    answer: >-
      Arrays in PowerShell are fixed-size. The += operator creates a new, larger
      array and copies all elements every iteration. For 10,000 items, this
      creates 10,000 arrays and copies 50 million elements total (O(N^2)). Use
      [System.Collections.Generic.List[object]] with .Add() or pipeline output
      assignment instead.
relatedItems:
  - powershell-automation-architect
  - powershell-error-handling
version: 1.0.0
lastUpdated: '2026-03-11'
---

# PowerShell Pipeline & Performance

## Overview
The PowerShell pipeline streams objects between commands — processing one object at a time without loading everything into memory. Understanding when to stream vs collect, and how to parallelize, is the difference between scripts that take seconds and scripts that take hours.

## Why This Matters
- Pipeline streaming processes 1M objects in constant memory
- Collecting all results first (arrays) uses O(N) memory and is slower
- ForEach-Object -Parallel enables multi-core processing (PowerShell 7+)

## Performance Patterns

### Step 1: Pipeline Streaming vs Collection
```powershell
# SLOW: Collect all results, then process
$files = Get-ChildItem -Recurse  # Loads ALL into memory
$files | Where-Object { $_.Length -gt 1MB }

# FAST: Stream through pipeline (constant memory)
Get-ChildItem -Recurse | Where-Object { $_.Length -gt 1MB }

# SLOW: Array concatenation in a loop
$results = @()
foreach ($item in $data) {
    $results += $item  # Creates new array every iteration! O(N^2)
}

# FAST: Use ArrayList or pipeline output
$results = [System.Collections.Generic.List[object]]::new()
foreach ($item in $data) {
    $results.Add($item)
}

# FASTEST: Let pipeline collect
$results = $data | ForEach-Object { Process-Item $_ }
```

### Step 2: ForEach-Object -Parallel (PowerShell 7+)
```powershell
# Sequential: 100 servers x 2s each = 200 seconds
$servers | ForEach-Object {
    Test-Connection $_ -Count 1
}

# Parallel: 100 servers, 10 at a time = ~20 seconds
$servers | ForEach-Object -Parallel {
    Test-Connection $_ -Count 1
} -ThrottleLimit 10

# Access outer variables with $using:
$credential = Get-Credential
$servers | ForEach-Object -Parallel {
    Invoke-Command -ComputerName $_ -Credential $using:credential -ScriptBlock {
        Get-Service | Where-Object Status -eq 'Running'
    }
} -ThrottleLimit 20
```

### Step 3: Filter Left, Format Right
```powershell
# BAD: Get everything, then filter
Get-ADUser -Filter * | Where-Object { $_.Department -eq "Engineering" }

# GOOD: Filter at the source (server-side filtering)
Get-ADUser -Filter { Department -eq "Engineering" }

# BAD: Format in the middle of pipeline
Get-Process | Format-Table | Where-Object { $_.CPU -gt 100 }  # BROKEN

# GOOD: Filter first, format last
Get-Process | Where-Object CPU -gt 100 | Format-Table Name, CPU
```

### Step 4: Measure Performance
```powershell
# Measure execution time
Measure-Command {
    Get-ChildItem -Recurse C:\ -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 100MB }
}

# Compare approaches
$sequential = Measure-Command { 1..100 | ForEach-Object { Start-Sleep -Milliseconds 50 } }
$parallel = Measure-Command { 1..100 | ForEach-Object -Parallel { Start-Sleep -Milliseconds 50 } -ThrottleLimit 20 }
Write-Output "Sequential: $($sequential.TotalSeconds)s, Parallel: $($parallel.TotalSeconds)s"
```

## Best Practices
- Use pipeline streaming for large datasets (don't collect into arrays)
- Use ForEach-Object -Parallel for I/O-bound operations (network, disk)
- Filter at the source whenever possible (Get-ADUser -Filter, not Where-Object)
- Avoid += with arrays in loops (O(N^2) — use List<T> or pipeline)
- Use Measure-Command to benchmark before and after optimization
- Format output last (Format-Table/Format-List should be the final pipeline stage)

## Common Mistakes
- Using += to build arrays in loops (creates new array every iteration)
- Filtering client-side when server-side filtering is available
- Using Format-* cmdlets in the middle of a pipeline (breaks object output)
- Not using -ThrottleLimit with -Parallel (defaults to 5, may need tuning)
- Collecting pipeline output when streaming would work
